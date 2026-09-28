import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Kuingia kwa Wasimamizi | Ofisi ya Mbunge" }, { name: "description", content: "Eneo salama la wasimamizi wa tovuti." }, { property: "og:title", content: "Kuingia kwa Wasimamizi" }, { property: "og:description", content: "Eneo salama la usimamizi wa maudhui." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "recovery">("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();

    try {
      if (mode === "recovery") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Kiungo cha kuweka nenosiri jipya kimetumwa. Angalia barua pepe yako.");
        setMode("signin");
        return;
      }

      const password = String(fd.get("password") ?? "");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Umeingia salama.");
      await navigate({ to: "/admin", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("invalid login credentials")) {
        toast.error("Barua pepe au nenosiri si sahihi. Jaribu tena au tumia ‘Umesahau nenosiri?’");
      } else if (message.includes("email not confirmed")) {
        toast.error("Thibitisha barua pepe yako kwanza, kisha ujaribu tena.");
      } else {
        toast.error("Imeshindikana kukamilisha ombi. Tafadhali jaribu tena.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] bg-secondary px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-md border border-border bg-background p-6 shadow-institutional sm:p-8">
        <div className="flex size-12 items-center justify-center bg-primary text-primary-foreground">
          {mode === "signin" ? <LockKeyhole className="size-6" /> : <KeyRound className="size-6" />}
        </div>
        <p className="mt-5 text-xs font-bold uppercase text-gold">Eneo salama la wasimamizi</p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {mode === "signin" ? "Ingia kwenye Dashibodi" : "Rejesha Nenosiri"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "signin"
            ? "Tumia akaunti ya ofisi iliyoidhinishwa kuendesha maudhui ya tovuti."
            : "Tutakutumia kiungo salama cha kuweka nenosiri jipya."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <Label htmlFor="email">Barua pepe</Label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" autoComplete="email" required className="pl-10" />
            </div>
          </div>

          {mode === "signin" && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Nenosiri</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setMode("recovery")}>
                  Umesahau nenosiri?
                </Button>
              </div>
              <div className="relative mt-2">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={8} className="pr-11" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ficha nenosiri" : "Onyesha nenosiri"}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
          )}

          <Button className="w-full" disabled={loading}>
            {loading ? "Tafadhali subiri..." : mode === "signin" ? "Ingia kwenye Dashibodi" : "Tuma Kiungo cha Urejeshaji"}
          </Button>
        </form>

        {mode === "recovery" && (
          <Button type="button" variant="link" className="mt-3 w-full" onClick={() => setMode("signin")}>
            Rudi kwenye ukurasa wa kuingia
          </Button>
        )}
        <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          Ufikiaji huu ni kwa wasimamizi walioidhinishwa pekee.
        </p>
      </div>
    </section>
  );
}