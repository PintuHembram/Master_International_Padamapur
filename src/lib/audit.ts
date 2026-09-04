import { supabase } from "@/integrations/supabase/client";

export type AuditSeverity = "info" | "warning" | "critical";

export async function logAudit(entry: {
  action: string;
  module?: string;
  record_id?: string;
  description?: string;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: data.user?.id ?? null,
      user_email: data.user?.email ?? null,
      action: entry.action,
      module: entry.module ?? null,
      record_id: entry.record_id ?? null,
      description: entry.description ?? null,
      severity: entry.severity ?? "info",
      user_agent: navigator.userAgent,
      metadata: (entry.metadata ?? {}) as never,
    });
  } catch {
    // auditing must never break the user flow
  }
}
