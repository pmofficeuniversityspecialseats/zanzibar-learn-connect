import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Weka Nenosiri Jipya | Ofisi ya Mbunge" }, { name: "description", content: "Weka nenosiri jipya kwa akaunti yako." }, { property: "og:title", content: "Weka Nenosiri Jipya" }, { property: "og:description", content: "Urejeshaji salama wa akaunti." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirmation = String(fd.get("confirm") ?? "");
    if (password !== confirmation) {
      toast.error("Manenosiri hayafanani.");
      return;
    }

    setLoading(true);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.error("Kiungo cha kurejesha nenosiri si sahihi au kimekwisha muda. Omba kiungo kipya.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Nenosiri halikuweza kubadilishwa. Tafadhali omba kiungo kipya.");
      return;
    }
    toast.success("Nenosiri limebadilishwa. Unaweza kuingia sasa.");
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <section className="min-h-[70vh] bg-secondary px-4 py-16">
      <div className="mx-auto max-w-md border border-border bg-background p-7 shadow-institutional">
        <KeyRound className="size-8 text-primary" />
        <h1 className="mt-5 font-display text-3xl font-bold">Weka Nenosiri Jipya</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Tumia angalau herufi nane na uhifadhi nenosiri lako mahali salama.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div><Label htmlFor="password">Nenosiri jipya</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-2" /></div>
          <div><Label htmlFor="confirm">Rudia nenosiri</Label><Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="mt-2" /></div>
          <Button className="w-full" disabled={loading}>{loading ? "Inahifadhi..." : "Hifadhi Nenosiri"}</Button>
        </form>
      </div>
    </section>
  );
}