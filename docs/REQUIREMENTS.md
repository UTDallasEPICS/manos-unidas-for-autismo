# Requirements Documentation — Connected Care (Manos Unidas for Autismo)

> Generated from: codebase analysis, GitHub issues, and client docs in `docs/resources/` and `docs/client-files/`.  
> Last updated: 2026-06-26

> ⚠️ **Status note (2026-08):** the UI was rebuilt on NuxtUI v4 and auth was
> reworked (deny-by-default) after this doc was written, so some sections
> (component structure, page layouts, a few "open" issues that are now fixed)
> are out of date. For **current** conventions and setup, use
> [`../CONTRIBUTING.md`](../CONTRIBUTING.md), [`UI.md`](./UI.md), and
> [`I18N.md`](./I18N.md), and the live route map at `/dev`. This document remains
> the reference for **functional requirements / domain rules**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Functional Requirements](#4-functional-requirements)
    - [4.1 Authentication & Session Management](#41-authentication--session-management)
    - [4.2 Public Pages](#42-public-pages)
    - [4.3 Patient Registration (Contact Form)](#43-patient-registration-contact-form)
    - [4.4 Dashboards](#44-dashboards)
    - [4.5 Patient Management](#45-patient-management)
    - [4.6 Therapy Scheduling](#46-therapy-scheduling)
    - [4.7 Therapy Notes & Documentation](#47-therapy-notes--documentation)
    - [4.8 Progress Reports](#48-progress-reports)
    - [4.9 Appointment Requests & Referrals](#49-appointment-requests--referrals)
    - [4.10 Employee & Account Management](#410-employee--account-management)
    - [4.11 Internationalization (i18n)](#411-internationalization-i18n)
5. [Data Model](#5-data-model)
6. [API Endpoints](#6-api-endpoints)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Known Bugs & Open Issues](#8-known-bugs--open-issues)
    - [P0: Critical](#p0-critical)
    - [P1: High](#p1-high)
    - [P2: Medium](#p2-medium)
    - [P3: Low / Polish](#p3-low--polish)
9. [Feature Gaps (Missing Functionality)](#9-feature-gaps-missing-functionality)
10. [Tech Debt](#10-tech-debt)

---

## 1. Project Overview

**Connected Care** is a web-based therapy management system for **Fundación Manos Unidas para el Autismo (FMUA)**, an autism treatment center in the Dominican Republic. It replaces paper-based workflows and Excel spreadsheets with a digital platform for managing patients, therapists, therapy sessions, notes, evaluations, and progress reports.

**Key goals:**

- Digitize patient intake (contact forms, service requests)
- Manage weekly therapy session scheduling
- Enable therapists to document session notes and goals
- Track patient progress through progress reports
- Coordinate between evaluators, therapists, and user-service staff
- Provide parents read access to their children's progress
- Bilingual interface (English/Spanish)

---

## 2. Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Meta-framework | Nuxt 4 (Vue 3, server-side rendering + API routes)               |
| Frontend       | Vue 3 (Composition API), Tailwind CSS 4                          |
| Backend        | Nuxt server routes (h3), running in the same process             |
| ORM            | Prisma 6                                                         |
| Database       | SQLite (`prisma/dev.db`) — file-based, no separate server needed |
| Validation     | Zod                                                              |
| i18n           | @nuxtjs/i18n (en/es, locale files in `i18n/locales/`)            |
| Auth           | Cookie-based session (`userId` cookie) — **no password/OTP yet** |
| Icons          | Lucide Vue Next, Heroicons                                       |
| UI             | Headless UI, Vue Multiselect                                     |
| HTTP client    | Axios (client-side), h3 utilities (server-side)                  |
| Code quality   | ESLint, Prettier, Husky (pre-commit hooks)                       |
| Type system    | TypeScript                                                       |

**Development setup:**

1. Copy `.env.example` to `.env`
2. `npm install`
3. `npx prisma migrate dev` (initializes SQLite database)
4. `npx prisma db seed` (seeds demo accounts)
5. `npm run dev`

---

## 3. User Roles & Permissions

There are two categories of users: **employees** (staff) and **non-employees** (patients/parents).

### Employee Roles (`UserType` enum)

| Role           | Description                 | Key Permissions                                                                                    |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `ADMIN`        | Full system access          | All pages, create accounts, view all data, schedule management                                     |
| `USER_SERVICE` | Intake coordination         | View contact forms, manage appointment requests, assign evaluators/therapists, schedule management |
| `IT_SERVICE`   | Technical administration    | Create new user accounts                                                                           |
| `THERAPIST`    | Therapy delivery            | View own schedule, document therapy notes, view assigned patients, create progress reports         |
| `EVALUATOR`    | Neurodevelopment evaluation | View patients, create therapist referrals, view contact forms, schedule                            |

### Non-Employee Roles

| Role    | Description                  | Key Permissions                                                           |
| ------- | ---------------------------- | ------------------------------------------------------------------------- |
| Patient | End user receiving therapy   | View own profile, view own schedule/appointments, submit service requests |
| Parent  | Parent/guardian of a patient | View their children's profiles (scoped — cannot see other patients)       |

### Access Control Implementation

- Global client middleware (`middleware/01.permission.global.ts`) hides/redirects routes for UX only — it is **not** the real gate.
- `server/middleware/authentication.ts` only **attaches** the session-derived user and permission set to `event.context` (`user`, `permissions`); it no longer makes access decisions. (The old global `server/middleware/authorization.ts` was removed.)
- The real API gate is per-endpoint and **deny-by-default**: every handler under `server/api/**` is wrapped in `defineAuthedHandler` (`server/utils/defineAuthedHandler.ts`), which requires an explicit access decision. Any `/api` route that does not make one is blocked by a Nitro `beforeResponse` tripwire (`server/plugins/authTripwire.ts`) — forgetting to wrap fails **closed**.
- Per-resource ownership is enforced by predicates in `server/utils/ownership.ts` (`isSelf` / `isParentOf` / `isAssignedTherapist` / `canViewPatient`, plus `hasClinicalPatientAccess`). Endpoints returning patient data gate on `hasClinicalPatientAccess` (USER_SERVICE / EVALUATOR / ADMIN) rather than the broad `STAFF` role, so `IT_SERVICE` (which is granted `STAFF`) cannot read patient PHI.
- Patients can only view their own profile (`/patientProfile/[id]` restricted to own ID).
- Parents can only view their own children (enforced via `/api/parent/childrenIds`).
- Permission levels are defined in `types/permissions.ts` as `AccessPermission` enum.

---

## 4. Functional Requirements

### 4.1 Authentication & Session Management

**Current State:** Email-only login. No password, no OTP.

| #      | Requirement                                                                             | Status                                                |
| ------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| AUTH-1 | Users log in at `/login` by entering their email address                                | ✅ Implemented                                        |
| AUTH-2 | System sets a `userId` cookie on successful login                                       | ✅ Implemented                                        |
| AUTH-3 | Middleware reads `userId` cookie to identify user on every request                      | ✅ Implemented                                        |
| AUTH-4 | After login, user is redirected to their role-specific dashboard                        | ✅ Implemented                                        |
| AUTH-5 | Authenticated users visiting `/` are redirected to their dashboard                      | ❌ Missing (#210)                                     |
| AUTH-6 | Login must verify identity beyond just knowing the email (OTP, password, or magic link) | ❌ Not implemented (#212) — **CRITICAL security gap** |
| AUTH-7 | Session tokens must be non-guessable and httpOnly                                       | ❌ Not implemented (#212)                             |
| AUTH-8 | Logout clears the session cookie                                                        | ✅ Implemented (LogOut component)                     |

---

### 4.2 Public Pages

Pages accessible without login.

| #     | Requirement                                                                | Route                  | Status                                 |
| ----- | -------------------------------------------------------------------------- | ---------------------- | -------------------------------------- |
| PUB-1 | Landing page with organization info, logo, and contact details             | `/`                    | ✅ Implemented                         |
| PUB-2 | Contact page with clinic address and info                                  | `/contact`             | ✅ Implemented                         |
| PUB-3 | Service request form for unauthenticated users                             | `/requestForm`         | ✅ Implemented                         |
| PUB-4 | Request form validates Dominican Republic Cédula (11-digit, Luhn checksum) | `/requestForm`         | ✅ Implemented (but UX unclear — #164) |
| PUB-5 | Patient registration/contact form                                          | `/patient/contactForm` | ✅ Implemented                         |

---

### 4.3 Patient Registration (Contact Form)

The public form new patients fill out to initiate services.

| #     | Requirement                                                                                                                                                                          | Status                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| CF-1  | Collect: first name, last name, email, phone, WhatsApp, date of birth, gender, address, postal code                                                                                  | ✅ Implemented                                   |
| CF-2  | Collect: nationality, insurance company (from DR insurance enum), whether returning patient, whether wants evaluation                                                                | ✅ Implemented                                   |
| CF-3  | Collect: Dominican Republic ID (Cédula), diagnoses, optional medical info (medication, allergies, diet)                                                                              | ✅ Implemented                                   |
| CF-4  | Collect: parent/guardian information (name, contact details)                                                                                                                         | ✅ Implemented                                   |
| CF-5  | Email field must be required (needed for login)                                                                                                                                      | ❌ Bug (#152) — email is `.optional()` in schema |
| CF-6  | Submitting empty optional fields (medication, allergies, diet) must not error                                                                                                        | ❌ Bug (#153) — causes 500 error                 |
| CF-7  | Duplicate email submission must show a friendly error message, not a generic alert                                                                                                   | ❌ Bug (#170, #107)                              |
| CF-8  | Contact form status tracked: `PROCESSING` → `SCHEDULING` → `COMPLETED`                                                                                                               | ✅ Implemented (ContactForm.status enum)         |
| CF-9  | Form page title should say "Patient Registration" not "Patient Contact Form"                                                                                                         | ❌ Bug (#154)                                    |
| CF-10 | Insurance companies supported: SENASA Contributivo, SENASA Subsidiado, ARS Humano, MAPFRE, La Monumental, ARS Universal, ARS Meta Salud, ARS Plan Salud Banco Central, Renacer, Otro | ✅ Implemented                                   |

---

### 4.4 Dashboards

Each role has a dedicated dashboard with navigation buttons to their key workflows.

| Role         | Route                           | Key Buttons                                                                 | Status                                       |
| ------------ | ------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| Admin        | `/admin`                        | Schedule, View Patients, Review Forms, Employees, Create Account            | ✅                                           |
| User Service | `/userServiceDashboard`         | Schedule, Patients, Review Forms, Requested Appointments, Assign Specialist | ✅ (navbar missing Assign Specialist — #211) |
| IT Service   | `/iTServiceDashboard`           | Create Account                                                              | ✅                                           |
| Therapist    | `/therapistDashboard`           | Schedule, Patients, Therapy Notes, Progress Reports                         | ✅                                           |
| Evaluator    | `/dashboard/evaluatorDashboard` | Schedule, View Patients, View Contact Forms                                 | ✅ (missing referral workflow — #202)        |
| Patient      | `/patientDashboard`             | Schedule, View Profile, Request Services                                    | ✅ (missing Appointments History — #177)     |
| Parent       | `/parentDashboard`              | View Children's Profiles                                                    | ✅ (button broken — #209)                    |

---

### 4.5 Patient Management

| #      | Requirement                                                                      | Route/File                  | Status                                                  |
| ------ | -------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------- |
| PAT-1  | Search patients by name (staff/admin)                                            | `/patientSearch`            | ❌ Bug (#207) — queries wrong table                     |
| PAT-2  | View individual patient profile with personal, contact, medical, and clinic info | `/patientProfile/[id]`      | ✅ Implemented                                          |
| PAT-3  | Edit patient profile fields                                                      | Profile EditModal           | ❌ Bug (#161) — gender and medical fields don't persist |
| PAT-4  | Patients can only view their own profile                                         | Middleware                  | ✅ Implemented                                          |
| PAT-5  | Parents can only view their own children's profiles                              | Middleware + API            | ✅ Enforced, but navigation broken (#209)               |
| PAT-6  | View submitted contact forms with sorting                                        | `/patient/viewContactForms` | ✅ Implemented                                          |
| PAT-7  | Patient profile sections: General Info, Location, Contact, Medical, Clinic       | `/patientProfile/[id]`      | ✅ Implemented                                          |
| PAT-8  | Patient profile shows therapy notes history                                      | `/patientProfile/[id]`      | ✅ Implemented                                          |
| PAT-9  | Patient appointments history page (upcoming + past)                              | Not yet created             | ❌ Missing (#177)                                       |
| PAT-10 | Patient info captured: identification (Cédula), diagnosed status, sponsor        | Prisma Patient model        | ✅ Implemented                                          |

---

### 4.6 Therapy Scheduling

| #      | Requirement                                                                                | Route/File                                 | Status                                                     |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| SCH-1  | Week-view calendar showing all sessions                                                    | `/admin/scheduleView`                      | ✅ Implemented                                             |
| SCH-2  | Sessions displayed by day with therapist, time, and session type                           | WeekViewCalendar component                 | ✅ Implemented                                             |
| SCH-3  | Filter calendar by session type and/or therapist                                           | FilterAppointments component               | ✅ Implemented (but "Filter" button not translated — #155) |
| SCH-4  | Create new session: date, time, duration, session type, therapist, max attendance, comment | CreateAppointment component                | ✅ Implemented                                             |
| SCH-5  | Session types must be seeded in database before the dropdown populates                     | `prisma/seed.ts`                           | ❌ Bug (#208) — dropdown empty in fresh installs           |
| SCH-6  | Cannot create sessions in the past (frontend + backend validation)                         | CreateAppointment + session/create.post.ts | ❌ Bug (#172) — no date validation                         |
| SCH-7  | Max attendance must have an upper bound (e.g., 50)                                         | CreateAppointment + Zod schema             | ❌ Bug (#160)                                              |
| SCH-8  | Session types with color coding: BLUE, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW            | SessionType model                          | ✅ Implemented                                             |
| SCH-9  | Mark patient attendance for a session (paid/unpaid)                                        | `/api/session/attendance`                  | ✅ Implemented                                             |
| SCH-10 | Therapist can view their own schedule                                                      | `/api/session/schedule/therapist`          | ✅ Implemented                                             |
| SCH-11 | Patient can view their own session schedule                                                | `/api/session/schedule/patient`            | ✅ Implemented                                             |
| SCH-12 | Sessions unique per therapist per time slot (no double-booking)                            | Prisma unique constraint                   | ✅ Implemented                                             |

---

### 4.7 Therapy Notes & Documentation

Therapists document each session using a structured form.

| #     | Requirement                                                              | Status                                         |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| TN-1  | Create therapy note linked to a patient and therapy type                 | ✅ Implemented                                 |
| TN-2  | Therapy type selection with drilldown (type + optional sub-types)        | ✅ Implemented                                 |
| TN-3  | Record: goals achieved + date                                            | ✅ Implemented                                 |
| TN-4  | Record: progress notes + date                                            | ✅ Implemented                                 |
| TN-5  | Record: next session objectives + date                                   | ✅ Implemented                                 |
| TN-6  | Record: reinforcers used + date                                          | ✅ Implemented                                 |
| TN-7  | Record: family recommendations + date                                    | ✅ Implemented                                 |
| TN-8  | Record: general observations (required field) + date                     | ✅ Implemented                                 |
| TN-9  | Record: incidents (optional) + date                                      | ✅ Implemented                                 |
| TN-10 | Record: individual therapy objectives (goal key, label, therapist notes) | ✅ Implemented (TherapyNoteObjective)          |
| TN-11 | Record: group recommendations for parents                                | ✅ Implemented                                 |
| TN-12 | View history of all therapy notes for a patient                          | ✅ Implemented (NotesHistory component)        |
| TN-13 | Edit an existing therapy note                                            | ✅ Implemented (`/api/session/notes/[id].put`) |
| TN-14 | "General observations" required asterisk shown in form                   | ❌ Bug (#158)                                  |

---

### 4.8 Progress Reports

| #    | Requirement                                          | Status                                      |
| ---- | ---------------------------------------------------- | ------------------------------------------- |
| PR-1 | Therapist can create a progress report for a patient | ✅ Implemented (ReportModal)                |
| PR-2 | Report stores: date, question-answer pairs           | ✅ Implemented (Report + ReportData models) |
| PR-3 | Report linked to patient                             | ✅ Implemented                              |

---

### 4.9 Appointment Requests & Referrals

This workflow spans multiple roles: patient/public → user service → evaluator → user service → therapist.

#### Service Requests (Public/Patient)

| #     | Requirement                                                                      | Status                           |
| ----- | -------------------------------------------------------------------------------- | -------------------------------- |
| REQ-1 | Unauthenticated users can submit service requests (name, email, phone, services) | ✅ Implemented (`/requestForm`)  |
| REQ-2 | Authenticated users can submit logged-in service requests                        | ✅ Implemented (LoggedInRequest) |
| REQ-3 | Service types: EVALUATION, THERAPY, CONSULTATION, FOLLOW_UP                      | ✅ Implemented                   |

#### Appointment Requests (User Service manages)

| #     | Requirement                                                                                            | Status                                                  |
| ----- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| APT-1 | User Service views all pending appointment requests                                                    | ✅ Implemented (`/userService/viewAppointmentRequests`) |
| APT-2 | User Service assigns an evaluator (neurodevelopment specialist) to an appointment request              | ✅ Implemented (`/userService/assignNeuroSpecialist`)   |
| APT-3 | Appointment request captures: name, email, phone, WhatsApp, Dominican ID, service type, scheduled date | ✅ Implemented (AppointmentRequest model)               |
| APT-4 | User Service navbar should include direct link to "Assign Specialist"                                  | ❌ Missing (#211)                                       |

#### Therapist Referrals (Evaluator → User Service → Therapist)

| #     | Requirement                                                           | Status                                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REF-1 | Evaluator creates a therapist referral for a patient after assessment | ✅ API exists, ❌ no UI on evaluator dashboard (#202)                                                                                                                                                                                                                                                                                                                                                 |
| REF-2 | Referral captures: therapy recommendation, therapist type             | ✅ Implemented (TherapistReferral model)                                                                                                                                                                                                                                                                                                                                                              |
| REF-3 | User Service assigns a therapist to a referral                        | ✅ Implemented (PUT `/api/session/referrals`)                                                                                                                                                                                                                                                                                                                                                         |
| REF-4 | Evaluator can view their own submitted referrals                      | ❌ Missing (#202)                                                                                                                                                                                                                                                                                                                                                                                     |
| REF-5 | Referrals API must have proper access control                         | ✅ Resolved — the three referral endpoints are wrapped with `defineAuthedHandler`: GET `[USER_SERVICE, EVALUATOR, THERAPIST]` (a plain therapist sees only their own referrals; US/EVAL/ADMIN see all), POST `EVALUATOR`, PUT `USER_SERVICE`. Verified live (therapist/evaluator GET 200; patient/parent/it-service GET 403; unauthenticated 401). The old `apiAccessMap` mechanism no longer exists. |

---

### 4.10 Employee & Account Management

| #     | Requirement                                                 | Status                                       |
| ----- | ----------------------------------------------------------- | -------------------------------------------- |
| EMP-1 | Admin/IT can create new user accounts (role, personal info) | ✅ Implemented (`/employees/create`)         |
| EMP-2 | Admin can search and view all employees                     | ✅ Implemented (`/employees`)                |
| EMP-3 | Therapists can have one or more specializations             | ✅ Implemented (Specialization many-to-many) |
| EMP-4 | Patients can have a sponsor/funder associated               | ✅ Implemented (Sponsor model)               |

---

### 4.11 Internationalization (i18n)

| #      | Requirement                                                            | Status                              |
| ------ | ---------------------------------------------------------------------- | ----------------------------------- |
| I18N-1 | Language toggle (EN/ES) available in navbar                            | ✅ Implemented (LangSwap component) |
| I18N-2 | Footer text translates on language switch                              | ✅ Implemented                      |
| I18N-3 | Navbar link labels translate on language switch                        | ❌ Bug (#150) — labels hardcoded    |
| I18N-4 | "Filter" button on schedule page translates                            | ❌ Bug (#155)                       |
| I18N-5 | All form labels and page titles use i18n keys                          | Partial — many hardcoded            |
| I18N-6 | i18n locale files at `i18n/locales/en.json` and `i18n/locales/es.json` | ✅ Exists                           |

---

## 5. Data Model

Full schema in `prisma/schema.prisma`. Summary of core models:

### Users & People

```
User               — any person in the system (id, fName, lName, email, phone, contactPref, type)
  ├── NonEmployee  — patients and parents (dob, gender, address, postCode)
  │     └── Patient  — patient-specific (identification/Cédula, diagnosed, sponsorId)
  └── Employee types: ADMIN, USER_SERVICE, IT_SERVICE, THERAPIST, EVALUATOR
```

### Patient Data

```
Patient
  ├── ContactForm        — intake form (nationality, insurance, wantsEval, status)
  ├── MedicalRecord[]    — medical data records (data field as string)
  ├── Report[]           — progress reports
  │     └── ReportData[] — question/answer pairs
  ├── AppointmentRequest[] — booked appointments
  └── TherapyNote[]      — session documentation
        └── TherapyNoteObjective[] — individual goals within a note
```

### Scheduling

```
Session            — therapy session (time, duration, therapistId, typeId, maxAttendance)
  ├── SessionType  — type of therapy (name, color)
  └── SessionPatient[] — patient attendance (sessionId, patientId, paid)
```

### Referral Workflow

```
AppointmentRequest — service request assigned to evaluator
TherapistReferral  — evaluator recommends therapy type; user service assigns therapist
```

### Supporting

```
Specialization     — therapist specializations (many-to-many with User)
Sponsor            — therapy funder (name, contact)
PostCodeCity       — postal code ↔ city lookup
Request            — unauthenticated service request form
LoggedInRequest    — authenticated service request form
```

### Enums

| Enum               | Values                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserType`         | ADMIN, USER_SERVICE, IT_SERVICE, THERAPIST, EVALUATOR                                                                                                 |
| `Gender`           | MALE, FEMALE, OTHER                                                                                                                                   |
| `ContactType`      | EMAIL, PHONE, WHATS_APP                                                                                                                               |
| `InsuranceCompany` | SENASA_CONTRIBUTIVO, SENASA_SUBSIDIADO, ARS_HUMANO, MAPFRE, LA_MONUMENTAL, ARS_UNIVERSAL, ARS_META_SALUD, ARS_PLAN_SALUD_BANCO_CENTRAL, RENACER, OTRO |
| `Color`            | BLUE, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW                                                                                                        |
| `Status`           | PROCESSING, SCHEDULING, COMPLETED                                                                                                                     |
| `ServiceType`      | EVALUATION, THERAPY, CONSULTATION, FOLLOW_UP                                                                                                          |

---

## 6. API Endpoints

All routes under `/api/`. Auth enforced by server middleware.

| Method       | Path                              | Description                            | Auth                   |
| ------------ | --------------------------------- | -------------------------------------- | ---------------------- |
| GET          | `/api/login`                      | Login by email, sets userId cookie     | Public                 |
| GET          | `/api/updatePermissions`          | Refresh permissions after role change  | Staff                  |
| POST         | `/api/contactForm/form`           | Submit patient registration            | Public                 |
| GET          | `/api/contactForm/viewForm`       | List contact form submissions          | Staff                  |
| GET          | `/api/profile/patient`            | Get patient profile                    | Patient/Staff          |
| PUT          | `/api/profile/patient`            | Update patient profile                 | Patient/Staff          |
| POST         | `/api/profile/report`             | Submit progress report                 | Therapist              |
| GET          | `/api/search/all`                 | Search all patients                    | Staff                  |
| GET          | `/api/search/children`            | Get parent's children                  | Parent                 |
| GET          | `/api/search/employees`           | Search employees                       | Admin                  |
| GET          | `/api/parent/childrenIds`         | Get parent's children IDs              | Parent                 |
| POST         | `/api/session/create`             | Create therapy session                 | User Service/Admin     |
| GET          | `/api/session/types`              | List session types                     | Staff                  |
| GET          | `/api/session/therapists`         | List therapists                        | Staff                  |
| GET          | `/api/session/schedule/all`       | All sessions                           | Staff                  |
| GET          | `/api/session/schedule/patient`   | Patient's sessions                     | Patient                |
| GET          | `/api/session/schedule/therapist` | Therapist's sessions                   | Therapist              |
| PUT          | `/api/session/info`               | Update session info                    | Staff                  |
| GET/POST/PUT | `/api/session/appointments/index` | Appointment CRUD                       | Staff                  |
| POST/DELETE  | `/api/session/attendance/index`   | Mark attendance                        | Staff                  |
| GET/POST     | `/api/session/notes/index`        | Therapy notes list/create              | Therapist              |
| PUT          | `/api/session/notes/[id]`         | Update therapy note                    | Therapist              |
| GET/POST/PUT | `/api/session/referrals/index`    | Therapist referral CRUD                | Evaluator/User Service |
| POST         | `/api/sendRequest/form`           | Submit unauthenticated service request | Public                 |

---

## 7. Non-Functional Requirements

| #     | Requirement                                                                                    | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1 | Bilingual interface (English/Spanish)                                                          | Partial — many strings not yet using i18n                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| NFR-2 | Mobile-responsive UI                                                                           | Partial — contact form table overflows (#80)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| NFR-3 | Patient data access scoped by role (patients only see own data, parents only see own children) | ✅ Implemented — enforced **server-side per-resource** via ownership predicates in `server/utils/ownership.ts`, not merely client middleware. Endpoints returning patient data allow self / parent-of / assigned-therapist / clinical staff (`hasClinicalPatientAccess` = USER_SERVICE, EVALUATOR, ADMIN); they deliberately do **not** use a bare `STAFF` gate, so `IT_SERVICE` (which is granted `STAFF`) is denied patient PHI. Verified live: it-service and unassigned therapists get 403 on `/api/session/schedule/patient`, `/api/search/children`, `/api/parent/childrenIds`; patient/parent see only their own; USER_SERVICE/EVALUATOR/ADMIN see all. |
| NFR-4 | API endpoints protected by authentication and authorization                                    | ✅ Implemented — **deny-by-default**. Every endpoint under `server/api/**` makes an explicit access decision via `defineAuthedHandler`; the `authTripwire` Nitro plugin blocks any unwrapped route (fails closed). 29/29 non-auth endpoints are wrapped; the sole bare handler is `server/api/auth/[...all].ts` (the Better Auth passthrough, exempted by the `/api/auth/` prefix). The access-control facet of #207 (referrals — see REF-5) is resolved.                                                                                                                                                                                                      |
| NFR-5 | Form validation on both frontend and backend (Zod schemas)                                     | ✅ Partially implemented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| NFR-6 | Loading indicators for async data fetches                                                      | ❌ Missing (#81)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| NFR-7 | Consistent button/input styling with hover, focus, and active states                           | ❌ Inconsistent (#85)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| NFR-8 | No high/critical npm vulnerabilities                                                           | ❌ Audit needed (#162)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| NFR-9 | Dominican Republic context: DR insurance companies, Cédula validation, Dominican postal codes  | ✅ Implemented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## 8. Known Bugs & Open Issues

### P0: Critical

Issues that block core workflows.

| Issue | Title                                        | Description                                                                                                                                                  |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #212  | **No authentication security**               | Login requires only an email — no password, OTP, or any verification. Anyone who knows a user's email can access their account and all patient medical data. |
| #209  | **Parent "View Children's Profiles" broken** | Button references route `childSearch` which is commented out in `nuxt.config.ts`. Parents cannot navigate to their children.                                 |
| #208  | **Session type dropdown empty**              | `SessionType` table not seeded by default — dropdown in Create Appointment is empty, blocking all scheduling.                                                |
| #207  | **Patient search queries wrong table**       | `patientSearch.vue` fetches from `/api/session/referrals` (returns only patients with referrals) instead of `/api/search/all`. Most patients are invisible.  |

### P1: High

Important functionality gaps.

| Issue | Title                                       | Description                                                                                                                                     |
| ----- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| #210  | **Logged-in users see landing page at `/`** | `index.vue` has no auth check — authenticated users should be redirected to their dashboard.                                                    |
| #172  | **No past-date validation on appointments** | Users can create appointments in the past. Neither frontend nor backend validates that the date is in the future.                               |
| #161  | **Patient profile edits don't persist**     | Gender and medical fields (medication, allergies, diet) revert after save. `EditModal.vue` doesn't map all fields correctly to the API payload. |
| #153  | **Signup fails with empty optional fields** | Leaving medication, allergies, or diet blank causes a 500 error because `MedicalRecord.data` is non-nullable.                                   |
| #152  | **Email not required during signup**        | Email is `.optional()` in Zod schema and has no `required` attribute in the form — but email is the only login method.                          |

### P2: Medium

Non-blocking bugs and improvements.

| Issue | Title                                               | Description                                                                                                                                  |
| ----- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| #211  | **Missing "Assign Specialist" navbar link**         | User Service navbar doesn't include a direct link to the assign specialist page.                                                             |
| #170  | **Duplicate email shows generic error**             | Submitting a duplicate email shows "Form submit encountered an error, check console" instead of "An account with this email already exists." |
| #164  | **Dominican ID validation unclear**                 | No placeholder, no format hint, error message doesn't explain what's wrong.                                                                  |
| #160  | **No upper limit on max attendance**                | Frontend has no `max` attribute, backend Zod schema has no `.lte()`. Unreasonable values (e.g., 999999) are accepted.                        |
| #158  | **Missing required asterisk on therapy note field** | "General observations" is required but shows no asterisk, confusing therapists.                                                              |
| #150  | **Navbar links not translated**                     | All navbar link labels are hardcoded strings in `useUserLinks.ts` — they don't change on language switch.                                    |
| #107  | **Contact form generic error**                      | All contact form errors show a generic `alert()` instead of inline, field-specific feedback.                                                 |

### P3: Low / Polish

| Issue | Title                                  | Description                                                                                          |
| ----- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| #155  | **"Filter" button not translated**     | Button in `scheduleView.vue` is hardcoded "Filter" — doesn't translate.                              |
| #154  | **Signup form title confusing**        | Title reads "Patient Contact Form" — should say "Patient Registration."                              |
| #151  | **Date input too narrow**              | `sm:w-28` (112px) cuts off the full date. Should be wider.                                           |
| #85   | **Inconsistent button/input styling**  | `.btn` has no hover/active states; `.input` has conflicting padding rules.                           |
| #81   | **No loading indicators**              | WeekViewCalendar, contact forms list, and filter dropdown show no loading state while fetching data. |
| #80   | **Contact forms table not responsive** | Table overflows horizontally on mobile — no `overflow-x-auto` wrapper.                               |

---

## 9. Feature Gaps (Missing Functionality)

Features that have backend infrastructure (models, APIs) but lack a complete user-facing implementation.

### Evaluator Referral Workflow (#202)

- **What exists:** `TherapistReferral` model, GET/POST/PUT API endpoints
- **What's missing:** UI on the evaluator dashboard to create referrals and view their status
- **Flow:** Evaluator assesses patient → creates referral with therapy recommendation → User Service assigns therapist

### Patient Appointments History Page (#177)

- **What exists:** `/api/session/schedule/patient` API returns patient-specific sessions
- **What's missing:** A `/pages/patient/appointments.vue` page showing upcoming vs. past appointments
- **Needed:** "My Appointments" button on patient dashboard

### Children Profile Navigation (from #209)

- **What exists:** `/api/parent/childrenIds`, `/api/search/children`, patient profile page
- **What's missing:** Either uncomment the `childSearch` route in `nuxt.config.ts` (with parent-scoped filtering) or create `/pages/parent/childrenProfiles.vue`

### Seed Data for Session Types (#208)

- **What's missing:** `prisma/seed.ts` must include default `SessionType` records (e.g., "Speech Therapy," "Occupational Therapy," "Behavioral Therapy," "ABA Therapy")

---

## 10. Tech Debt

| Issue          | Description                                                                                                           | Priority |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| #162           | Run `npm audit fix` — known vulnerabilities in dependencies                                                           | Low      |
| #157           | `pages/userService/assignModal.vue` is a component, not a page — should move to `components/userService/`             | Low      |
| Validation     | Several API endpoints lack Zod input validation (rely on Prisma errors bubbling up)                                   | Medium   |
| Error handling | Most API errors rely on `handlePrismaError()` — frontend doesn't parse these into user-friendly messages              | Medium   |
| i18n coverage  | Many page titles, labels, and button text are hardcoded English strings not wrapped in `$t()`                         | Medium   |
| Prisma seed    | No documented seed script with realistic demo data for all session types and user roles                               | High     |
| Database       | SQLite is appropriate for development but not for production at scale — evaluate PostgreSQL for deployment            | High     |
| Auth           | `userId` cookie is plain text and spoofable — needs JWT or server-side session store regardless of OTP implementation | High     |
