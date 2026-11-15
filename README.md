# OpenStudy Academy Client

The OpenStudy Academy client is a browser-based learning management application
for school administrators, teachers, and students. It provides role-specific
dashboards and workflows for managing classes, teaching materials, assessments,
student progress, invoices, payments, payroll, schedules, and profiles.

This project is the frontend application in the School Application platform. It
communicates with the Express API documented in [`../server/README.md`](../server/README.md).

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Install and run](#install-and-run)
- [Available scripts](#available-scripts)
- [Application routes](#application-routes)
- [Architecture](#architecture)
- [API and authentication](#api-and-authentication)
- [Payments and invoice status](#payments-and-invoice-status)
- [Testing and quality checks](#testing-and-quality-checks)
- [Production deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)

## Features

### Administrators

- School dashboard and enrollment activity.
- Manage teachers, students, classes, subjects, topics, lessons, and schedules.
- Review student invoices, create and issue invoices, request refunds, and view
  transaction records.
- Manage individual and bulk teacher payroll, including bank-account review.
- Update school settings and administrator profile information.

### Teachers

- Teacher dashboard and assigned subject/topic views.
- Manage lessons, evaluations, and question banks.
- Review student records and learning progress.
- View payroll history, payslips, profile, and teaching schedules.

### Students

- Student dashboard, assigned learning materials, evaluations, and progress.
- View invoices and payment history, open invoice details, and initiate payment.
- View schedules and manage profile information.

### Shared functionality

- Email verification and invitation password setup.
- Role-protected routes and session-expiration handling.
- Responsive interface built with Material UI.
- Toast notifications and server-state caching.

## Technology

- React 19 and TypeScript 6
- Vite 8
- React Router 7
- Material UI 9 and Roboto
- TanStack React Query 5
- Axios
- Recharts
- React Toastify
- Playwright for browser-level testing

Dependency versions are declared in [`package.json`](./package.json) and pinned
by [`package-lock.json`](./package-lock.json).

## Requirements

- A maintained Node.js release compatible with the installed Vite and
  TypeScript versions.
- npm.
- Access to a running OpenStudy Academy API server.
- A modern browser. Playwright browser installations are additionally needed
  to run the browser test suite.

The project does not declare a Node.js `engines` constraint. Use a currently
supported Node.js LTS release and run the production build in the same runtime
family used by CI and deployment.

## Configuration

Create `client/.env.local` for local development. Vite exposes variables
prefixed with `VITE_` to browser code, so these variables are public and must
never contain credentials or private keys.

| Variable       | Required | Description                                                                                                                             |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Yes      | API server origin, such as `http://localhost:7070`. The client appends `/api/v1` automatically. Do not include `/api/v1` in this value. |

Example:

```dotenv
VITE_API_URL=http://localhost:7070
```

In production, set `VITE_API_URL` to the publicly reachable HTTPS origin of the
API server and rebuild the client. Vite variables are embedded into the static
build at build time; changing the deployment environment after building does
not update the existing bundle.

The API must permit the deployed client origin through CORS and allow
credentialed requests. Configure the API cookie domain, `Secure`, and
`SameSite` settings for the client and API deployment topology. The client
expects API calls to use the `/api/v1` prefix.

## Install and run

From the client directory:

```sh
npm ci
```

Create `.env.local` with the API origin, then start the development server:

```sh
npm run dev
```

Vite prints the local URL when the server is ready; the default is
`http://localhost:5173`. To expose the development server on the network, use
Vite's `--host` option, for example `npm run dev -- --host 0.0.0.0`. Do not
expose a development server publicly as a production deployment.

## Available scripts

| Command               | Purpose                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`         | Start Vite's development server with hot module replacement.                     |
| `npm run build`       | Run TypeScript project checks and create the optimized static bundle in `dist/`. |
| `npm run preview`     | Serve the built `dist/` output locally for a production-build smoke test.        |
| `npm run lint`        | Run ESLint across the client project.                                            |
| `npx playwright test` | Run the Playwright tests in `tests/` using the configured browser projects.      |

The current `npm test` script is a placeholder that exits with an error; it
does not run tests. Use the Playwright command above for the configured
browser-level test. Install the required browsers on a new development or CI
machine with:

```sh
npx playwright install
```

## Application routes

The client uses browser-history routes. The root route redirects to `/login`.
Role-protected pages redirect unauthenticated users to login and send users
with the wrong role to their own dashboard.

### Public and authentication routes

| Route                  | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `/login`               | Sign in.                                |
| `/signup`              | Account registration.                   |
| `/verify-email/:token` | Verify an email address.                |
| `/create-password/*`   | Set a password from an invitation flow. |

### Administrator routes

All administrator pages are under `/admin` and require the `ADMIN` role.

| Route                                           | Purpose                                          |
| ----------------------------------------------- | ------------------------------------------------ |
| `/admin`                                        | Dashboard.                                       |
| `/admin/teachers`, `/admin/teachers/:teacherId` | Teacher directory and details.                   |
| `/admin/students`, `/admin/students/:studentId` | Student directory and details.                   |
| `/admin/students/:studentId/progress`           | Student progress.                                |
| `/admin/classes`                                | Class management.                                |
| `/admin/subjects`, `/admin/subjects/:subjectId` | Subject directory and details.                   |
| `/admin/topics`, `/admin/topics/:topicId`       | Topic directory and details.                     |
| `/admin/topics/:topicId/lessons`                | Lessons in a topic.                              |
| `/admin/topics/:topicId/lessons/:lessonId`      | Lesson details.                                  |
| `/admin/invoices`, `/admin/invoices/:invoiceId` | Invoices, refund workflows, and invoice details. |
| `/admin/transactions`                           | Transaction records.                             |
| `/admin/payroll`                                | Payroll and bulk payroll batches.                |
| `/admin/schedule`                               | Teaching schedules.                              |
| `/admin/settings`                               | School settings.                                 |

### Teacher routes

All teacher pages are under `/teacher` and require the `TEACHER` role.

| Route                                        | Purpose                       |
| -------------------------------------------- | ----------------------------- |
| `/teacher`                                   | Dashboard.                    |
| `/teacher/subjects`                          | Assigned subjects.            |
| `/teacher/topics`                            | Topics and topic details.     |
| `/teacher/topics/:topicId/lessons`           | Lessons in a topic.           |
| `/teacher/topics/:topicId/lessons/:lessonId` | Lesson details.               |
| `/teacher/evaluations`                       | Evaluations.                  |
| `/teacher/questions`                         | Question bank.                |
| `/teacher/students`                          | Student directory.            |
| `/teacher/students/:studentId`               | Student details.              |
| `/teacher/students/:studentId/progress`      | Student progress.             |
| `/teacher/payroll`                           | Payroll history and payslips. |
| `/teacher/schedule`                          | Teaching schedules.           |
| `/teacher/profile`                           | Teacher profile.              |

### Student routes

All student pages are under `/student` and require the `STUDENT` role.

| Route                                                        | Purpose                                     |
| ------------------------------------------------------------ | ------------------------------------------- |
| `/student`                                                   | Dashboard.                                  |
| `/student/subjects`, `/student/subjects/:subjectId`          | Assigned subjects and details.              |
| `/student/topics/:topicId`                                   | Topic details and learning content.         |
| `/student/evaluations`, `/student/evaluations/:evaluationId` | Evaluations and attempts.                   |
| `/student/progress`                                          | Learning progress.                          |
| `/student/schedule`                                          | Student schedule.                           |
| `/student/invoices`, `/student/invoices/:invoiceId`          | Invoice list and details.                   |
| `/student/payment/callback`                                  | Return route after hosted payment checkout. |
| `/student/profile`                                           | Student profile.                            |

## Architecture

The frontend is a single-page application. Route configuration and lazy-loaded
pages are in `src/app/router.tsx`; the root component installs the router and
the application shell. Shared layouts are separated by role.

The primary data flow is:

1. A page calls a hook in `src/hooks/`.
2. The hook uses an API module in `src/api/` and TanStack React Query for
   loading, caching, mutation, and invalidation.
3. API modules use the Axios client in `src/app/axios.ts`.
4. The backend returns JSON data consumed by the page components.

React Query defaults are configured in `src/app/queryClient.tsx`. Query data is
considered fresh for five minutes, garbage-collected after ten minutes, and
retries are disabled by default. Page-specific hooks can override those defaults.

Material UI theme and application-wide styling are defined in `src/utils/theme.ts`
and `src/index.css`. The application uses Roboto and includes a shared toast
container for user-facing notifications.

## API and authentication

The Axios base URL is `${VITE_API_URL}/api/v1`. Requests include
`withCredentials: true`, allowing the browser to send the API's HTTP-only
`accessToken` cookie. The client does not use a bearer token in browser storage.

Login establishes the session cookie on the API. Protected-route components
load the signed-in user and check the role before rendering private pages.
When an API request returns `401`, the Axios interceptor attempts to refresh
the session through `POST /api/v1/auth/refresh`, then retries the original
request. If refresh is rejected with `401` or `403`, the client redirects to
`/login` and displays a session-expired notice.

> **Backend compatibility:** ensure the API deployment exposes the refresh
> endpoint expected by the client. CORS must allow the client origin, cookies,
> and credentialed requests. Cross-site deployments generally require HTTPS
> and `SameSite=None; Secure` cookies.

## Payments and invoice status

Student payments are initialized through the API and completed on the payment
provider's hosted checkout page. The client uses the callback route to verify
the returned payment reference and refresh the relevant invoice/payment data.
Amounts sent to payment APIs are in kobo for NGN.

The student invoice detail screen displays payment status by invoice item.
The backend currently records payments as an invoice-level aggregate and does
not persist a payment-to-item allocation ledger. Item-level amounts/statuses
shown by the frontend are therefore allocated estimates, not an authoritative
record of which specific fee item a payment settled. Use the invoice's actual
paid amount and outstanding balance as the authoritative totals.

Administrative refund actions use the server's refund endpoints. Payment,
refund, and payroll transfers depend on valid server-side provider
configuration; provider secrets must never be added to the client environment.

## Testing and quality checks

Before submitting a frontend change, run the checks relevant to the change:

```sh
npm run lint
npm run build
npx playwright test
```

Playwright configuration is in `playwright.config.ts`; test files are in
`tests/`. The configured suite runs against Chromium, Firefox, WebKit, and
mobile device profiles. The Playwright web server starts the Vite development
server at `http://localhost:5173`. Set `CI=true` in continuous integration to
enable CI retry and `test.only` checks.

## Production deployment

The client is deployed as a Vite static site on Vercel. The checked-in
[`vercel.json`](./vercel.json) rewrites application routes to `index.html`, so
React Router's nested routes can be opened or refreshed directly.

### Configure the Vercel project

When importing the repository into Vercel, configure the project for the
client application:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | `client` when the repository root contains the `client/` directory; otherwise the client project root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

Set `VITE_API_URL` in the Vercel project's Environment Variables for every
environment that is built (Production, Preview, and Development as applicable).
Its value must be the API origin, for example `https://api.example.com`, with
no trailing `/api/v1`. The client adds that path itself. Vite embeds this value
at build time, so redeploy after changing it. Never put API credentials,
Paystack secrets, or other private values in `VITE_*` variables.

The API must be reachable over HTTPS and configured to allow the exact Vercel
production domain and any preview domains that need to access it. It must
support credentialed CORS requests and set session cookies appropriately for
the frontend/API domains (`Secure` and, for cross-site cookies, `SameSite=None`).
Do not use a Vercel preview URL as the production API's only allowed origin.

### Configure GitHub Actions CI/CD

For GitHub Actions to discover an automation workflow, the workflow file must
be located under `.github/workflows/` at the Git repository root. Add the
Vercel deployment workflow there (for example
`.github/workflows/vercel-deploy.yml`) and configure these GitHub Actions
repository or environment secrets:

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Authenticate the Vercel CLI. |
| `VERCEL_ORG_ID` | Identify the Vercel team/account. |
| `VERCEL_PROJECT_ID` | Identify the Vercel project. |

The deployment job should install locked dependencies with `npm ci`, pull the
Vercel project settings, build the production bundle with the Vercel CLI, and
deploy the prebuilt output. If the workflow runs from a repository root that
contains `client/`, run the npm and Vercel CLI commands from that directory
(using `working-directory: client` or an equivalent `cd client`) so they use
the client's `package.json`, lockfile, and Vercel project configuration.
Configure the Vercel project's Production environment variable `VITE_API_URL`
before running the production build.

Use separate CI behavior for pull requests and production releases:

- On pull requests, run quality checks such as `npm run lint` and
  `npm run build`; optionally create a Vercel Preview deployment.
- Deploy to Production only from the selected protected release branch (for
  example, `master`) after required checks pass.
- Protect the production environment and restrict who can update its secrets
  or approve deployments.

> **Workflow location and trigger check:** the workflow definition currently
> appears at `github/workflows/openstudy.yml` in this client project. GitHub
> Actions does not discover workflows at that path; move or copy the intended
> workflow to the repository-root `.github/workflows/` directory. Also review
> its current pull-request trigger: it runs `vercel deploy --prod`, which would
> publish pull-request code to Production if the workflow is made active as-is.
> Change pull requests to checks or Preview deployments and reserve production
> deployment for approved pushes to the release branch.

### Release verification

Before enabling or updating production deployment:

1. Verify the Vercel project root, build command, and output directory.
2. Verify `VITE_API_URL` is configured for the correct Vercel environment.
3. Run `npm run lint` and `npm run build` locally or in the required CI checks.
4. Confirm production deployment is restricted to the intended release branch.
5. Test login, role-based navigation, API requests, invoice payment return
   navigation, and direct refreshes on nested routes on the deployed domain.
6. Confirm the production API's CORS allowlist and cookie settings match that
   domain.

The `vite.config.ts` host allowlist applies only to the Vite development
server. It does not configure Vercel hosting, production CORS, or API cookies.

## Troubleshooting

### API calls fail or return a network/CORS error

- Confirm `VITE_API_URL` is an origin (for example `https://api.example.com`),
  without `/api/v1`.
- Confirm the API is reachable at `${VITE_API_URL}/api/v1/health`.
- Confirm the backend's CORS allowlist includes the exact frontend origin and
  allows credentials.
- Restart Vite after changing `.env.local`.

### Login succeeds but private pages redirect to login

- Confirm the browser accepts the API's `accessToken` cookie.
- Check HTTPS and `SameSite`/`Secure` cookie settings when the API and frontend
  are on different sites.
- Confirm the API user endpoint and refresh endpoint are available.

### A nested route returns 404 after refresh or direct navigation

Configure the static host's SPA fallback to serve `index.html` for
application routes. Do not rewrite static asset requests to the HTML page.

### Playwright cannot launch a browser

Install the project's browser binaries with `npx playwright install`. In Linux
CI environments, install required operating-system dependencies as well with
`npx playwright install --with-deps`.

## Project structure

```text
client/
├── public/                 # Static public assets
├── src/
│   ├── api/                # Typed API request modules
│   ├── app/                # Router, Axios clients, query client
│   ├── components/         # Shared interface components
│   ├── hooks/              # React Query hooks
│   ├── layouts/            # Public and role-specific layouts
│   ├── pages/              # Feature and route pages
│   ├── routes/protect/     # Role-based route guard
│   ├── types/              # Shared TypeScript declarations
│   └── utils/              # Theme and shared helpers
├── tests/                  # Playwright tests
├── .env.local              # Local configuration (not committed)
├── package.json
├── playwright.config.ts
└── vite.config.ts
```
