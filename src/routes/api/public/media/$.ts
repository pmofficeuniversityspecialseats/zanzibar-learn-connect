import { createFileRoute } from "@tanstack/react-router";

// Serves files from the private "site-media" storage via short-lived signed URLs.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String(params._splat ?? "");
        if (!/^[a-zA-Z0-9/_\-.]+$/.test(path) || path.includes("..") || path.length > 300) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("site-media").createSignedUrl(path, 60 * 60);
        if (error || !data?.signedUrl) return new Response("Not found", { status: 404 });
        return new Response(null, { status: 302, headers: { Location: data.signedUrl, "Cache-Control": "public, max-age=1800" } });
      },
    },
  },
});
