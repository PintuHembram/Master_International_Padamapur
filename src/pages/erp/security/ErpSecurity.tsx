import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Shield, ShieldCheck, KeyRound, Network, ScanFace, ScrollText, Search, Download,
  Plus, Trash2, RefreshCw, Save, AlertTriangle, Lock, Fingerprint, Clock,
} from "lucide-react";

type SecuritySettings = {
  id: string;
  require_mfa_admins: boolean;
  require_mfa_all: boolean;
  captcha_public_forms: boolean;
  enforce_ip_allowlist: boolean;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_symbols: boolean;
  leaked_password_protection: boolean;
  max_login_attempts: number;
  audit_retention_days: number;
};

type AuditLog = {
  id: string;
  user_email: string | null;
  action: string;
  module: string | null;
  description: string | null;
  severity: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type IpRule = {
  id: string;
  label: string;
  ip_address: string;
  scope: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

const SEVERITY_STYLE: Record<string, string> = {
  info: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function ErpSecurity() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [rules, setRules] = useState<IpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [module, setModule] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [ipOpen, setIpOpen] = useState(false);
  const [ipForm, setIpForm] = useState({ label: "", ip_address: "", scope: "admin", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [s, l, r] = await Promise.all([
      supabase.from("security_settings").select("*").limit(1).maybeSingle(),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("ip_allowlist").select("*").order("created_at", { ascending: false }),
    ]);
    if (s.data) setSettings(s.data as SecuritySettings);
    setLogs((l.data ?? []) as AuditLog[]);
    setRules((r.data ?? []) as IpRule[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (patch: Partial<SecuritySettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { id, ...rest } = settings;
    const { error } = await supabase.from("security_settings").update(rest).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Security policy saved");
    await logAudit({ action: "security_settings.update", module: "Security", severity: "warning", description: "Security policy updated" });
    load();
  };

  const addIp = async () => {
    if (!ipForm.label.trim() || !ipForm.ip_address.trim()) return toast.error("Label and IP address are required");
    const { error } = await supabase.from("ip_allowlist").insert({
      label: ipForm.label.trim(),
      ip_address: ipForm.ip_address.trim(),
      scope: ipForm.scope,
      notes: ipForm.notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("IP added to allowlist");
    await logAudit({ action: "ip_allowlist.create", module: "Security", severity: "warning", description: `Allowed ${ipForm.ip_address}` });
    setIpOpen(false);
    setIpForm({ label: "", ip_address: "", scope: "admin", notes: "" });
    load();
  };

  const toggleIp = async (rule: IpRule) => {
    const { error } = await supabase.from("ip_allowlist").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "ip_allowlist.toggle", module: "Security", record_id: rule.id, description: `${rule.ip_address} ${rule.is_active ? "disabled" : "enabled"}` });
    load();
  };

  const deleteIp = async (rule: IpRule) => {
    const { error } = await supabase.from("ip_allowlist").delete().eq("id", rule.id);
    if (error) return toast.error(error.message);
    toast.success("Rule removed");
    await logAudit({ action: "ip_allowlist.delete", module: "Security", severity: "warning", description: `Removed ${rule.ip_address}` });
    load();
  };

  const modules = useMemo(
    () => Array.from(new Set(logs.map((l) => l.module).filter(Boolean))) as string[],
    [logs],
  );

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        const q = search.trim().toLowerCase();
        const matchQ =
          !q ||
          [l.action, l.description, l.user_email, l.module].some((v) => (v ?? "").toLowerCase().includes(q));
        return matchQ && (severity === "all" || l.severity === severity) && (module === "all" || l.module === module);
      }),
    [logs, search, severity, module],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCsv = () => {
    const head = ["Date", "User", "Action", "Module", "Severity", "Description", "IP"];
    const rows = filtered.map((l) => [
      new Date(l.created_at).toLocaleString(),
      l.user_email ?? "",
      l.action,
      l.module ?? "",
      l.severity,
      (l.description ?? "").replace(/"/g, "'"),
      l.ip_address ?? "",
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `MIS-${Date.now()}` });
    if (error) return toast.error(error.message);
    setMfaEnroll({ qr: data.totp.qr_code, secret: data.totp.secret, factorId: data.id, code: "" });
  };

  const [mfaEnroll, setMfaEnroll] = useState<{ qr: string; secret: string; factorId: string; code: string } | null>(null);
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string | null; status: string }[]>([]);

  const loadFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as never);
  }, []);
  useEffect(() => { if (user) loadFactors(); }, [user, loadFactors]);

  const verifyMfa = async () => {
    if (!mfaEnroll) return;
    const challenge = await supabase.auth.mfa.challenge({ factorId: mfaEnroll.factorId });
    if (challenge.error) return toast.error(challenge.error.message);
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaEnroll.factorId,
      challengeId: challenge.data.id,
      code: mfaEnroll.code,
    });
    if (error) return toast.error(error.message);
    toast.success("Two-factor authentication enabled");
    await logAudit({ action: "mfa.enroll", module: "Security", severity: "warning", description: "Authenticator app enrolled" });
    setMfaEnroll(null);
    loadFactors();
  };

  const unenroll = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return toast.error(error.message);
    toast.success("Factor removed");
    await logAudit({ action: "mfa.unenroll", module: "Security", severity: "critical", description: "Authenticator removed" });
    loadFactors();
  };

  const score = useMemo(() => {
    if (!settings) return 0;
    let s = 0;
    if (settings.require_mfa_admins) s += 20;
    if (factors.length > 0) s += 20;
    if (settings.captcha_public_forms) s += 15;
    if (settings.leaked_password_protection) s += 15;
    if (settings.password_min_length >= 10) s += 10;
    if (settings.enforce_ip_allowlist && rules.some((r) => r.is_active)) s += 10;
    if (settings.session_timeout_minutes <= 60) s += 10;
    return s;
  }, [settings, factors, rules]);

  const stats = [
    { label: "Security score", value: `${score}/100`, icon: ShieldCheck, tone: score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600" },
    { label: "Audit events", value: logs.length, icon: ScrollText, tone: "text-sky-600" },
    { label: "Allowlisted IPs", value: rules.filter((r) => r.is_active).length, icon: Network, tone: "text-violet-600" },
    { label: "Critical events", value: logs.filter((l) => l.severity === "critical").length, icon: AlertTriangle, tone: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] text-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Security &amp; Audit</h1>
            <p className="text-sm text-white/70">Multi-factor authentication, audit trail, IP allowlist and captcha policy</p>
          </div>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.tone}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="mfa">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="mfa"><Fingerprint className="h-4 w-4 mr-1" /> MFA</TabsTrigger>
          <TabsTrigger value="policy"><Lock className="h-4 w-4 mr-1" /> Policies</TabsTrigger>
          <TabsTrigger value="ip"><Network className="h-4 w-4 mr-1" /> IP Allowlist</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1" /> Audit Logs</TabsTrigger>
        </TabsList>

        {/* MFA */}
        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ScanFace className="h-4 w-4" /> Authenticator app (TOTP)</CardTitle>
              <CardDescription>Signed in as {user?.email}. Use Google Authenticator, Authy or any TOTP app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {factors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No authenticator enrolled for this account.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Factor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {factors.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>{f.friendly_name || "Authenticator"}</TableCell>
                        <TableCell><Badge variant={f.status === "verified" ? "default" : "secondary"}>{f.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => unenroll(f.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!mfaEnroll ? (
                <Button onClick={enrollMfa}><KeyRound className="h-4 w-4 mr-1" /> Enroll authenticator</Button>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start border rounded-lg p-4">
                  <img src={mfaEnroll.qr} alt="MFA QR code" className="h-40 w-40 bg-white p-2 rounded" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <Label>Manual secret</Label>
                      <Input readOnly value={mfaEnroll.secret} className="font-mono text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="mfa-code">6-digit code</Label>
                      <Input
                        id="mfa-code"
                        inputMode="numeric"
                        maxLength={6}
                        value={mfaEnroll.code}
                        onChange={(e) => setMfaEnroll({ ...mfaEnroll, code: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={verifyMfa}>Verify &amp; enable</Button>
                      <Button variant="outline" onClick={() => setMfaEnroll(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POLICIES */}
        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security policy</CardTitle>
              <CardDescription>Applies across staff, student and public portals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {([
                      ["require_mfa_admins", "Require MFA for administrators"],
                      ["require_mfa_all", "Require MFA for all staff"],
                      ["captcha_public_forms", "Captcha on public forms (contact, admission, fees)"],
                      ["enforce_ip_allowlist", "Enforce IP allowlist for admin sign-in"],
                      ["password_require_symbols", "Passwords must include a symbol"],
                      ["leaked_password_protection", "Block leaked / breached passwords"],
                    ] as [keyof SecuritySettings, string][]).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                        <Label htmlFor={key} className="text-sm font-normal">{label}</Label>
                        <Switch
                          id={key}
                          checked={Boolean(settings[key])}
                          onCheckedChange={(v) => update({ [key]: v } as Partial<SecuritySettings>)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="timeout" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Session timeout (min)</Label>
                      <Input id="timeout" type="number" min={5} value={settings.session_timeout_minutes}
                        onChange={(e) => update({ session_timeout_minutes: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label htmlFor="pwlen">Min password length</Label>
                      <Input id="pwlen" type="number" min={6} value={settings.password_min_length}
                        onChange={(e) => update({ password_min_length: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label htmlFor="attempts">Max login attempts</Label>
                      <Input id="attempts" type="number" min={1} value={settings.max_login_attempts}
                        onChange={(e) => update({ max_login_attempts: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label htmlFor="retention">Audit retention (days)</Label>
                      <Input id="retention" type="number" min={30} value={settings.audit_retention_days}
                        onChange={(e) => update({ audit_retention_days: Number(e.target.value) })} />
                    </div>
                  </div>

                  <Button onClick={saveSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save policy"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP ALLOWLIST */}
        <TabsContent value="ip">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">IP allowlist</CardTitle>
                <CardDescription>Restrict administrative access to trusted networks.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIpOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add IP</Button>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No IP rules yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead><TableHead>IP / CIDR</TableHead><TableHead>Scope</TableHead>
                        <TableHead>Active</TableHead><TableHead>Notes</TableHead><TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.label}</TableCell>
                          <TableCell className="font-mono text-xs">{r.ip_address}</TableCell>
                          <TableCell className="capitalize">{r.scope}</TableCell>
                          <TableCell><Switch checked={r.is_active} onCheckedChange={() => toggleIp(r)} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.notes}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => deleteIp(r)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit trail</CardTitle>
              <CardDescription>Immutable record of administrative activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Search action, user, description"
                    value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severity</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={module} onValueChange={(v) => { setModule(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modules</SelectItem>
                    {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">No audit events recorded yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date &amp; time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead>
                          <TableHead>Module</TableHead><TableHead>Severity</TableHead><TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageRows.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="whitespace-nowrap text-xs">{new Date(l.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-xs">{l.user_email ?? "—"}</TableCell>
                            <TableCell className="font-mono text-xs">{l.action}</TableCell>
                            <TableCell className="text-xs">{l.module ?? "—"}</TableCell>
                            <TableCell>
                              <Badge className={SEVERITY_STYLE[l.severity] ?? ""} variant="secondary">{l.severity}</Badge>
                            </TableCell>
                            <TableCell className="text-xs max-w-[280px] truncate">{l.description ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {page} of {pageCount} • {filtered.length} events</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                      <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={ipOpen} onOpenChange={setIpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add IP to allowlist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ip-label">Label</Label>
              <Input id="ip-label" value={ipForm.label} onChange={(e) => setIpForm({ ...ipForm, label: e.target.value })} placeholder="School office" />
            </div>
            <div>
              <Label htmlFor="ip-addr">IP address or CIDR</Label>
              <Input id="ip-addr" value={ipForm.ip_address} onChange={(e) => setIpForm({ ...ipForm, ip_address: e.target.value })} placeholder="203.0.113.24 or 203.0.113.0/24" />
            </div>
            <div>
              <Label htmlFor="ip-scope">Scope</Label>
              <Select value={ipForm.scope} onValueChange={(v) => setIpForm({ ...ipForm, scope: v })}>
                <SelectTrigger id="ip-scope"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin panel</SelectItem>
                  <SelectItem value="erp">Full ERP</SelectItem>
                  <SelectItem value="api">API access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ip-notes">Notes</Label>
              <Textarea id="ip-notes" rows={2} value={ipForm.notes} onChange={(e) => setIpForm({ ...ipForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIpOpen(false)}>Cancel</Button>
            <Button onClick={addIp}>Add rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
