import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  submissionType: z.enum(["issue", "feedback", "challenge", "information", "contact"]),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  institution: z.string().trim().max(180).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(3000),
  attachmentPath: z.string().regex(/^incoming\/[a-zA-Z0-9_-]+\/(?:[a-zA-Z0-9_.-]+)$/).max(400).optional(),
  consent: z.literal(true),
});

export const submitPublicMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const referenceCode = `OMB-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const { error } = await supabaseAdmin.from("public_submissions").insert({
      reference_code: referenceCode,
      submission_type: data.submissionType,
      full_name: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      institution: data.institution || null,
      subject: data.subject,
      message: data.message,
      attachment_path: data.attachmentPath ?? null,
      consent: data.consent,
    });
    if (error) throw new Error("Ujumbe haukuweza kuhifadhiwa. Tafadhali jaribu tena.");
    return { referenceCode };
  });