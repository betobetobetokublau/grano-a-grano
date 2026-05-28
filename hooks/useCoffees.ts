"use client";

/**
 * Hook principal para fetch + mutaciones de cafes via SWR + Supabase.
 *
 * Decisiones del eng review:
 * - SWR para cache cliente + revalidacion
 * - UPDATE/DELETE usan optimistic + rollback automatico si Supabase rechaza
 * - INSERT NO usa optimistic (evita ghost rows con id falso) — espera respuesta
 *   real del server antes de agregar a la lista
 * - expires_at se computa client-side y se cachea (depende solo de los inputs)
 * - days_left NO se cachea — se computa al render en componentes (depende de "now")
 */

import { useCallback, useMemo } from "react";
import useSWR from "swr";

import { createClient } from "@/lib/supabase/client";
import { computeExpiration } from "@/lib/expiration";
import { daysUntilExpiration } from "@/lib/dates";
import type {
  Coffee,
  CoffeeInsert,
  CoffeeWithComputed,
} from "@/types/coffee";

const SWR_KEY = "coffees";

function enrichCoffee(coffee: Coffee): CoffeeWithComputed {
  const expiresAt = computeExpiration({
    roast_date: coffee.roast_date,
    manual_expires_at: coffee.manual_expires_at,
    is_open: coffee.is_open,
    opened_at: coffee.opened_at,
  });
  return {
    ...coffee,
    expires_at: expiresAt,
  };
}

/**
 * Ordena por dias restantes (computados al momento del sort).
 * Cafes sin fecha al final.
 */
function sortByUrgency(
  coffees: CoffeeWithComputed[],
  now: Date = new Date(),
): CoffeeWithComputed[] {
  return [...coffees].sort((a, b) => {
    const ad = a.expires_at === null ? null : daysUntilExpiration(a.expires_at, now);
    const bd = b.expires_at === null ? null : daysUntilExpiration(b.expires_at, now);
    if (ad === null && bd === null) return 0;
    if (ad === null) return 1;
    if (bd === null) return -1;
    return ad - bd;
  });
}

async function fetcher(): Promise<Coffee[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useCoffees() {
  const { data, error, isLoading, mutate } = useSWR<Coffee[]>(SWR_KEY, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  });

  // Enriquece y ordena en memoria, no en cache.
  // Asi days_left siempre se computa con "hoy" actual cuando un consumer lo calcula.
  const coffees = useMemo(
    () => sortByUrgency((data ?? []).map(enrichCoffee)),
    [data],
  );

  const addCoffee = useCallback(
    async (input: Omit<CoffeeInsert, "user_id" | "id" | "created_at">) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: inserted, error: insertError } = await supabase
        .from("coffees")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!inserted) throw new Error("Insert no retorno data");

      await mutate();
      return inserted;
    },
    [mutate],
  );

  const updateCoffee = useCallback(
    async (id: string, updates: Partial<Coffee>) => {
      await mutate(
        async (current) => {
          const supabase = createClient();
          const { error: updateError } = await supabase
            .from("coffees")
            .update(updates)
            .eq("id", id);
          if (updateError) throw updateError;
          // Refetch fresh
          return await fetcher();
        },
        {
          optimisticData: (current) =>
            (current ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    },
    [mutate],
  );

  const deleteCoffee = useCallback(
    async (id: string) => {
      await mutate(
        async (current) => {
          const supabase = createClient();
          const { error: deleteError } = await supabase
            .from("coffees")
            .delete()
            .eq("id", id);
          if (deleteError) throw deleteError;
          return (current ?? []).filter((c) => c.id !== id);
        },
        {
          optimisticData: (current) => (current ?? []).filter((c) => c.id !== id),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    },
    [mutate],
  );

  return {
    coffees,
    isLoading,
    error,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    refresh: mutate,
  };
}
