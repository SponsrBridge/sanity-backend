# Newsletter Subscription — Sanity Implementation Guide

## 1. Sanity Studio Schema

Create a new schema file in your Sanity Studio project:

**File:** `schemas/newsletterSubscription.ts`

```ts
import { defineType, defineField } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';

export default defineType({
  name: 'newsletterSubscription',
  title: 'Newsletter Subscription',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'subscribedAt',
    },
  },
});
```

## 2. Register the Schema

In your Sanity Studio's `schemaTypes/index.ts` (or wherever schemas are aggregated), add:

```ts
import newsletterSubscription from './newsletterSubscription';

export const schemaTypes = [
  // ...existing schemas
  newsletterSubscription,
];
```

---

## 3. Next.js API Route

**File:** `src/app/api/newsletter/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanityWriteClient =
  process.env.SANITY_PROJECT_ID && process.env.SANITY_WRITE_TOKEN
    ? createClient({
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET || "production",
        apiVersion: "2024-01-01",
        useCdn: false,
        token: process.env.SANITY_WRITE_TOKEN,
      })
    : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!sanityWriteClient) {
      return NextResponse.json(
        { success: false, message: "Service unavailable" },
        { status: 503 }
      );
    }

    // Check for duplicate subscription
    const existing = await sanityWriteClient.fetch(
      `count(*[_type == "newsletterSubscription" && email == $email])`,
      { email }
    );

    if (existing > 0) {
      return NextResponse.json(
        { success: false, message: "Already subscribed" },
        { status: 409 }
      );
    }

    await sanityWriteClient.create({
      _type: "newsletterSubscription",
      email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
```

---

## 4. Update the Resources Component

**File:** `src/components/home/Resources.tsx`

Replace the newsletter `<form>` block (lines 103–112) with a stateful form that calls the API:

```tsx
// Add these state variables inside the InsightsSection component:
const [email, setEmail] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

const handleSubscribe = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  setStatus('loading');
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.status === 409) {
      setStatus('duplicate');
      return;
    }

    if (!res.ok) throw new Error();
    setStatus('success');
    setEmail('');
  } catch {
    setStatus('error');
  }
};
```

Then update the JSX:

```tsx
<form
  className="flex flex-col md:flex-row w-full md:w-auto gap-4"
  onSubmit={handleSubscribe}
>
  <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    disabled={status === 'loading' || status === 'success'}
    className="bg-brand-navy border border-brand-border text-brand-white px-4 py-3 rounded w-full md:w-80 focus:outline-none focus:border-brand-teal transition-colors placeholder-brand-muted disabled:opacity-50"
  />
  <button
    type="submit"
    disabled={status === 'loading' || status === 'success'}
    className="bg-brand-teal text-brand-navy font-bold px-6 py-3 rounded-lg hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
  >
    {status === 'loading'
      ? 'Subscribing...'
      : status === 'success'
        ? 'Subscribed!'
        : 'Subscribe'}
  </button>
</form>
{status === 'error' && (
  <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>
)}
{status === 'duplicate' && (
  <p className="text-yellow-400 text-sm mt-2">This email is already subscribed.</p>
)}
{status === 'success' && (
  <p className="text-green-400 text-sm mt-2">Thank you for subscribing!</p>
)}
```

---

## 5. Sanity CORS Configuration

Make sure your Next.js app's origin is allowed in Sanity's CORS settings:

1. Go to [https://www.sanity.io/manage](https://www.sanity.io/manage)
2. Select project **rt9k03al**
3. Go to **API** > **CORS origins**
4. Ensure `http://localhost:3000` (dev) and your production domain are listed
5. **Credentials** can stay unchecked — the write token is used server-side only

---

## Summary of Changes

| Where | What |
|---|---|
| **Sanity Studio** | Add `newsletterSubscription` schema with `email` and `subscribedAt` fields |
| **Sanity Studio** | Register the schema in `schemaTypes/index.ts` |
| **Next.js** | Create `src/app/api/newsletter/route.ts` API route |
| **Next.js** | Update `src/components/home/Resources.tsx` with form state and submission logic |
