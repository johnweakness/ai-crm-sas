# Orbit CRM

Production-shaped AI CRM for small marketing agencies. It includes Supabase authentication, workspace-scoped PostgreSQL data, admin/employee roles, lead CRUD, tasks, CSV workflows, and an AI follow-up endpoint.

## Production setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Run [`supabase/schema.sql`](supabase/schema.sql) in Supabase SQL Editor, then add the values from [`.env.example`](.env.example). Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL so email confirmation links do not point to localhost. Add `GEMINI_API_KEY` for live AI messages and Google OAuth credentials for Gmail sending and Calendar event creation. Production configuration is required; missing services return explicit errors.

For confirmation emails, in Supabase go to **Authentication > URL Configuration**, set the Site URL to `http://localhost:3000`, and add `http://localhost:3000/auth/callback` under Redirect URLs. Supabase's built-in email provider must be enabled under **Authentication > Providers > Email**. The app now sends this callback URL explicitly during signup.

Supabase's built-in email service is rate-limited. After `Email rate exceeded`, stop retrying and wait for the limit to clear. For reliable delivery, configure a custom SMTP provider in Supabase, such as Resend, SendGrid, or Mailgun. The app limits resend clicks to once per 60 seconds.

If signup reports `Database error saving new user`, run [`supabase/fix-auth-trigger.sql`](supabase/fix-auth-trigger.sql) once in the Supabase SQL Editor. This repairs the Auth trigger permissions without recreating the whole schema.

API routes: `GET|POST|PATCH|DELETE /api/leads`, `GET|POST|PATCH /api/tasks`, `GET /api/notifications`, `POST /api/ai/follow-up`, `GET /api/integrations/google?provider=gmail|calendar`, `GET /api/health`, and `GET /auth/callback`.

For Vercel, add the same environment variables and register both the local and deployed `/auth/callback` URLs in Supabase Authentication settings.

Never commit `.env.local`. Rotate any provider credential that has been exposed before publishing the repository.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
