import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!role) return { authorized: false as const, newSubmissions: 0, pendingContent: 0, recentSubmissions: [] };
    const [submissions, content, recent] = await Promise.all([
      context.supabase.from("public_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      context.supabase.from("content_items").select("id", { count: "exact", head: true }).eq("status", "draft"),
      context.supabase.from("public_submissions").select("id,reference_code,submission_type,subject,status,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    return { authorized: true as const, newSubmissions: submissions.count ?? 0, pendingContent: content.count ?? 0, recentSubmissions: recent.data ?? [] };
  });