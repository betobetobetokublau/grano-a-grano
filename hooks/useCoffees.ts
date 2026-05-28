"use client";

/**
 * Hook principal para fetch + mutaciones de cafes via SWR + Supabase.
 *
 * Decisiones del eng review:
 * - SWR para cache cliente + revalidacion
 * - UPDATE/DELETE usan optimistic + rollback automatico si Supabase rechaza
 * - INSERT NO usa optimistic (evita ghost rows con id falso) — espera respuesta
 *   real del server antes de agregar a la lista
 * - expires_at se computa client-side, nunca se almacena
 */

import { useCallback } from "react";
import useSWR from "swr";

import { createClient } from "@/lib/supabase/client";
import { daysUntilExpiration } from "@/lib/dates";
import { computeExpiration } from "@/lib/expiration";
import type { Coffee, CoffeeInsert, CoffeeWithComputed } from "@/types/coffee";

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
    days_left: expiresAt === null ? null : daysUntilExpiration(expiresAt),
  };
}

function sortByUrgency(coffees: CoffeeWithComputed[]): CoffeeWithComputed[] {
  return [...coffees].sort((a, b) => {
    // Cafes sin fecha al final
    if (a.days_left === null && b.days_left === null) return 0;
    if (a.days_left === null) return 1;
    if (b.days_left === null) return -1;
    return a.days_left - b.days_left;
  });
}

async function fetcher(): Promise<CoffeeWithComputed[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coffees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return sortByUrgency((data ?? []).map(enrichCoffee));
}

export function useCoffees() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeWithComputed[]>(
    SWR_KEY,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const supabase = createClient();

  /**
   * Insert sin optimistic. Espera respuesta del server con el id real.
   * Throw el error para que el caller lo capture y muestre toast.
   */
  const addCoffee = useCallback(
    async (input: Omit<CoffeeInsert, "user_id" | "id" | "created_at">) => {
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

      // Refetch para tener la lista ordenada correctamente
      await mutate();
      return inserted;
    },
    [supabase, mutate],
  );

  /**
   * Update con optimistic. Si falla, SWR re-fetchea automaticamente y
   * el rollback es transparente porque el current cache se reemplaza.
   */
  const updateCoffee = useCallback(
    async (id: string, updates: Partial<Coffee>) => {
      const current = data ?? [];
      const optimistic = sortByUrgency(
        current.map((c) => (c.id === id ? enrichCoffee({ ...c, ...updates }) : c)),
      );

      try {
        await mutate(
          async () => {
            const { error: updateError } = await supabase
              .from("coffees")
              .update(updates)
              .eq("id", id);
            if (updateError) throw updateError;
            return fetcher();
          },
          {
            optimisticData: optimistic,
            rollbackOnError: true,
            revalidate: false, // ya re-fetcheamos dentro del mutate
          },
        );
      } catch (err) {
        // Re-throw para que el caller muestre toast
        throw err;
      }
    },
    [data, supabase, mutate],
  );

  const deleteCoffee = useCallback(
    async (id: string) => {
      const current = data ?? [];
      const optimistic = current.filter((c) => c.id !== id);

      try {
        await mutate(
          async () => {
            const { error: deleteError } = await supabase
              .from("coffees")
              .delete()
              .eq("id", id);
            if (deleteError) throw deleteError;
            return optimistic;
          },
          {
            optimisticData: optimistic,
            rollbackOnError: true,
            revalidate: false,
          },
        );
      } catch (err) {
        throw err;
      }
    },
    [data, supabase, mutate],
  );

  return {
    coffees: data ?? [],
    isLoading,
    error,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    refresh: mutate,
  };
}
