# Sanity Schema: Contact Submission

Add the following schema to your Sanity Studio project to store contact form submissions.

---

## 1. Create the Schema File

In your Sanity Studio project, create the file:

```
schemas/contactSubmission.ts
```

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactSubmission',
  title: 'Contact Submissions',
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Submission Date (Newest)',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      submittedAt: 'submittedAt',
    },
    prepare({ firstName, lastName, email, submittedAt }) {
      return {
        title: `${firstName} ${lastName}`,
        subtitle: `${email} - ${submittedAt ? new Date(submittedAt).toLocaleDateString() : 'No date'}`,
      }
    },
  },
})
```

---

## 2. Register the Schema

In your `sanity.config.ts` (or wherever schemas are registered), import and add the new schema:

```ts
import contactSubmission from './schemas/contactSubmission'

export default defineConfig({
  // ...existing config
  schema: {
    types: [
      // ...existing schemas
      contactSubmission,
    ],
  },
})
```

---

## 3. Generate a Write Token

The API route needs a Sanity **write token** to create documents.

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Select your project (`rt9k03al`)
3. Go to **API** > **Tokens**
4. Click **Add API Token**
5. Name it `Contact Form Write` (or similar)
6. Set permissions to **Editor**
7. Copy the generated token

---

## 4. Set Environment Variables

Add the token to your environment:

**Local** (`.env.local` - already has placeholder):
```
SANITY_WRITE_TOKEN=your_token_here
```

**Vercel Dashboard** (for production):
- Go to **Project Settings** > **Environment Variables**
- Add `SANITY_WRITE_TOKEN` with the token value

---

## 5. CORS Configuration

If the API runs on a different domain than your Sanity project expects:

1. Go to [sanity.io/manage](https://www.sanity.io/manage) > your project
2. Go to **API** > **CORS Origins**
3. Ensure your production domain is listed (e.g., `https://sponsrbridge.io`)
4. `localhost:3000` should already be allowed for development

---

## Summary of Changes

| What | Where |
|------|-------|
| New schema file | `schemas/contactSubmission.ts` in Sanity Studio |
| Register schema | `sanity.config.ts` in Sanity Studio |
| Write token | Sanity Dashboard > API > Tokens |
| Env variable | `SANITY_WRITE_TOKEN` in `.env.local` and Vercel |
| CORS (if needed) | Sanity Dashboard > API > CORS Origins |
