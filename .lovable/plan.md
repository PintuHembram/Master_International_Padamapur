# School ERP (UDISE+ style) — Phased Plan

A full SMS/ERP this large cannot ship in one pass. This plan scaffolds a professional government-ERP shell now, then delivers modules in vertical slices so each phase is usable on its own.

## What you'll see after Phase 0 + 1 (this turn)

- New ERP shell at `/erp` — UDISE+ style: blue gov header (school code, session, academic year, user), collapsible left sidebar with all 15 module groups, breadcrumbs, content area.
- Role-based routing using existing `useAuth` (`admin`, `teacher`, `student` already in DB; new roles added: `super_admin`, `principal`, `accountant`, `warden`, `transport_manager`, `parent`).
- Dashboard with KPI widgets (students, fees collected, attendance %, hostel occupancy) wired to existing tables.
- Students module: list + detailed UDISE+ style profile view (matches your screenshot — numbered field rows) reusing `students` table.
- Module landing pages (stubs) for every other module so the IA is complete and clickable.

## Phases

### Phase 0 — Foundation (this turn)
- Extend `app_role` enum: add `super_admin`, `principal`, `accountant`, `warden`, `transport_manager`, `parent`.
- Add `schools` table (multi-school SaaS-ready) + `school_id` FK on `students`, `staff`, `fee_payments`, etc. (nullable, default to single school for now).
- Add `audit_logs` table.
- Build `ErpLayout` (sidebar + gov header + topbar with academic year switcher).
- Routes: `/erp`, `/erp/students`, `/erp/students/:id`, plus stub routes for every module.

### Phase 1 — Students module (this turn)
- Students list (search, class/section filters, pagination, export CSV).
- UDISE+ style detail page: numbered table of all 30+ fields exactly like your screenshot.
- ID Card generator (PDF) reusing existing html2canvas+jspdf pattern.
- Promote / Transfer / TC actions (UI + status updates).

### Phase 2 — Attendance
- `attendance` table (student_id, date, status, marked_by). Daily mark sheet by class. Monthly report. Absent SMS hook (stub).

### Phase 3 — Fees & Online Payment
- Extend `fee_payments`: `fee_structures`, `invoices`, `installments`, `late_fines`. Razorpay integration via edge function. Receipt PDF. Parent payment page.

### Phase 4 — Exams & Results
- Extend existing `exams`/`student_results`: marks entry grid, grade rules, report card PDF, rank calc, analytics.

### Phase 5 — Staff & Payroll
- `staff`, `staff_attendance`, `leaves`, `payroll`, `salary_slips`. Timetable.

### Phase 6 — Hostel
- `hostels`, `hostel_rooms`, `hostel_beds`, `hostel_allocations`, `mess_meals`, `visitor_log`, `complaints`.

### Phase 7 — Transport
- `bus_routes`, `buses`, `drivers`, `route_stops`, `student_transport`. GPS hook (stub).

### Phase 8 — Library
- `books`, `book_issues`, `library_fines`. Barcode entry.

### Phase 9 — Parent Portal
- `/parent` portal: linked children, attendance, fees, results, homework, bus tracking, notifications.

### Phase 10 — Notifications
- `notifications` table + edge functions: SMS (Twilio), Email (Resend), WhatsApp (Meta Cloud API), web push.

### Phase 11 — Reports & Analytics
- Recharts dashboards per role. CSV/PDF export across all modules.

### Phase 12 — Hardening
- MFA (OTP via email), audit log UI, IP allowlist for super_admin, captcha on public forms, leaked-password check.

## Technical notes (for the record)

- Stack stays React + Vite + Tailwind + shadcn + Lovable Cloud (Supabase). No framework changes.
- All new tables get RLS via `has_role()`; multi-school isolation via `school_id = current_user_school()` security-definer function.
- Existing public routes (`/`, `/admission/*`, `/student/*`, `/admin/*`, `/results`, `/fees`, `/admit-cards`) remain untouched.
- The new ERP lives under `/erp/*` and is gated by `useAuth` + role checks. Old `/admin/*` pages keep working; we'll migrate them into `/erp` over phases without breaking links.
- Aadhaar verification = format/checksum validation only (no UIDAI API; that requires KUA license).

## After you approve

I'll execute Phase 0 + Phase 1 in this turn:
1. One DB migration (roles, schools, audit_logs, attendance skeleton).
2. New files: `ErpLayout`, `ErpSidebar`, `ErpHeader`, `pages/erp/Dashboard`, `pages/erp/students/List`, `pages/erp/students/Detail`, stub pages for all other modules, route registration in `App.tsx`.
3. No changes to existing public site.

Reply "go" (or with edits) to proceed.
