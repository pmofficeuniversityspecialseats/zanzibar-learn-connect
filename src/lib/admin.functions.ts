import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type RecentSubmission = { id: string; subject: string; reference_code: string; submission_type: string; status: string };

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as any;
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", context.userId);
    const list = ((roles ?? []) as { role: string }[]).map((r) => r.role);
    if (!list.includes("admin") && !list.includes("editor") && !list.includes("reviewer")) {
      return { authorized: false, newSubmissions: 0, pendingContent: 0, recentSubmissions: [] as RecentSubmission[] };
    }
    const [subs, pending, recent] = await Promise.all([
      sb.from("public_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      sb.from("content_items").select("id", { count: "exact", head: true }).eq("status", "draft"),
      sb.from("public_submissions").select("id,subject,reference_code,submission_type,status").order("created_at", { ascending: false }).limit(8),
    ]);
    return {
      authorized: true,
      newSubmissions: (subs.count ?? 0) as number,
      pendingContent: (pending.count ?? 0) as number,
      recentSubmissions: (recent.data ?? []) as RecentSubmission[],
    };
  });
