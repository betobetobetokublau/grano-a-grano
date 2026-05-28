import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { HomeContent } from "./home-content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <HomeContent />;
}
