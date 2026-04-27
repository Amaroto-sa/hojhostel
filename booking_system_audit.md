# HOJ Booking System — Full Audit Report

> Deep analysis of every file in the public booking flow, the backend API, admin management, email notifications, and all connected features.

---

## ✅ What's WORKING & Present

| Feature | Status | Location |
|---|---|---|
| Booking form with all resident fields | ✅ Working | `app/book/page.tsx` |
| Zod validation on booking input | ✅ Working | `lib/validations.ts` |
| Live price estimation on form | ✅ Working | `app/book/page.tsx` L102–108 |
| Past-date prevention on check-in | ✅ Working | `app/book/page.tsx` L111 |
| Guest booking toggle (via settings) | ✅ Working | `app/book/page.tsx` L49–60 |
| Rate limiting on booking POST | ✅ Working | `lib/rate-limit.ts` |
| Capacity/overbooking check | ✅ Working | `app/api/bookings/route.ts` L86–88 |
| Price calculation (daily/weekly/monthly) | ✅ Working | `app/api/bookings/route.ts` L90–95 |
| Booking confirmation email to client | ✅ Working | `lib/email.ts` L45–70 |
| Admin notification email | ✅ Working | `lib/email.ts` L72–117 |
| Telegram notification to admin | ✅ Working | `lib/email.ts` L120–147 |
| Admin approve/reject with status update | ✅ Working | `app/api/bookings/[id]/route.ts` |
| Auto resident creation on approval | ✅ Working | `app/api/bookings/[id]/route.ts` L67–94 |
| Auto receipt generation on approval | ✅ Working | `app/api/bookings/[id]/route.ts` L64, L83–92 |
| Occupancy increment on approval | ✅ Working | `app/api/bookings/[id]/route.ts` L97–104 |
| Due date calculation | ✅ Working | `lib/due-date.ts` |
| Combined approval email (payment + rules) | ✅ Working | `app/api/bookings/[id]/route.ts` L121–153 |
| Rejection email with custom text | ✅ Working | `app/api/bookings/[id]/route.ts` L160–173 |
| Customer dashboard: booking history | ✅ Working | `app/dashboard/page.tsx` |
| Customer dashboard: active stay display | ✅ Working | `app/dashboard/page.tsx` L98–136 |
| Availability page with live data | ✅ Working | `app/availability/page.tsx` |
| Self-healing occupancy sync on listings GET | ✅ Working | `app/api/listings/route.ts` L18–46 |
| Admin booking search & filter | ✅ Working | `app/admin/bookings/page.tsx` |
| Admin booking CSV export | ✅ Working | `app/admin/bookings/page.tsx` L44–66 |
| SEO meta tags on availability & pricing | ✅ Working | Both pages have `metadata` exports |

---

## 🔴 MISSING Features & Bugs

### 1. **No Booking Cancellation by Customer**
- **Problem:** The customer dashboard (`app/dashboard/page.tsx`) shows bookings but has **NO button** for the customer to cancel a PENDING booking.
- **Impact:** Customers who change their mind must contact admin via WhatsApp. There is no self-service cancellation.
- **Fix needed:** Add a "Cancel Booking" button on PENDING bookings in the dashboard, calling `PATCH /api/bookings/[id]` with `status: "CANCELLED"`.

### 2. **No Booking Detail/View Page**
- **Problem:** There is no `/book/[id]` or `/dashboard/booking/[id]` page. Customers cannot view full details of a single booking (receipt, full breakdown, status timeline).
- **Impact:** Customers only see a summary card. No way to view the detailed receipt, notes, or comprehensive booking info.

### 3. **No `DELETE` Route for Bookings**
- **Problem:** `app/api/bookings/[id]/route.ts` only has a `PATCH` handler. There is **no `DELETE` handler** for admins to fully delete a booking record.
- **Impact:** Admins can only change status, never purge old/test bookings from the database.

### 4. **No `GET` Single Booking Route**
- **Problem:** `app/api/bookings/[id]/route.ts` has no `GET` handler. You can only fetch ALL bookings, not a single booking by ID.
- **Impact:** Can't build a detail page or fetch a specific booking's info client-side.

### 5. **Booking Form Does NOT Pre-select Listing from Availability/Pricing Pages**
- **Problem:** The "Book Now" links on the `/availability` and `/pricing` pages all link to `/book` with **no query parameter** to pre-select the listing.
- **Impact:** Customer clicks "Book Now" on a specific room, arrives at the form, and must manually re-select the accommodation from the dropdown. Broken UX.
- **Fix needed:** Links should be `/book?listingId=<id>` and the booking form should read `searchParams` to pre-populate `form.listingId`.

### 6. **No Client-Side Validation (Zod is Backend Only)**
- **Problem:** The booking form (`app/book/page.tsx`) uses basic HTML `required` attributes but does **NOT** use the Zod `bookingSchema` on the client side. `react-hook-form` and `@hookform/resolvers` are installed but **completely unused** on the booking page.
- **Impact:** Weak client-side validation — e.g., a user can submit a 1-character phone number; it will only fail on the server, resulting in a poor error experience.

### 7. **`residentEmail` is Required in Schema but Optional in Intent**
- **Problem:** In `lib/validations.ts` L22, `residentEmail` is defined as `z.string().email(...)` (required). But in `app/api/bookings/route.ts` L108, it's treated as optional: `residentEmail: data.residentEmail || null`. The Zod schema will **reject** any booking without an email before it reaches that line.
- **Impact:** If guest booking is enabled and a guest doesn't have an email, the Zod validation will fail. The schema and the API logic disagree about whether email is required so email is required .

### 8. **No Booking Email Log Tracking**
- **Problem:** The `EmailLog` model exists in the Prisma schema but the `sendEmail` function in `lib/email.ts` **never writes to the `EmailLog` table**. Booking emails (confirmation, approval, rejection) are sent but never logged.
- **Impact:** Admin has no audit trail of which emails were sent, when, and to whom. If an email fails silently, no one knows.

### 9. **`calculateDueDate` is Imported but Never Used in Booking POST**
- **Problem:** In `app/api/bookings/route.ts` L6, `calculateDueDate` is imported but **never called** in the `POST` handler. It's only used in the `[id]/route.ts` PATCH (approval) handler.
- **Impact:** No functional bug (due date is calculated at approval time), but it's a dead import adding confusion.

### 10. **Occupancy Decrement Missing on Rejection/Cancellation**
- **Problem:** When a booking is `REJECTED` or `CANCELLED` in `app/api/bookings/[id]/route.ts` (L160–173), the listing occupancy is **NOT decremented**. Only approval increments it.
- **Impact:** This is actually *correct* because occupancy is only incremented on APPROVAL. However, there is **no handling for if an APPROVED booking is later CANCELLED** — the occupancy would remain inflated, and the resident record would stay ACTIVE. There's no reversal logic.

### 11. **No "Re-open" or "Complete" Booking Action for Admin**
- **Problem:** The admin bookings page (`app/admin/bookings/page.tsx` L181) only shows Approve/Reject buttons for `PENDING` bookings. There are **no actions** for `APPROVED`, `REJECTED`, or `COMPLETED` bookings.
- **Impact:** Admin cannot mark a booking as `COMPLETED`, cannot reverse a rejection, and cannot cancel an already-approved booking.

### 12. **Dashboard WhatsApp Link is Hardcoded**
- **Problem:** In `app/dashboard/page.tsx` L222, the WhatsApp link is hardcoded to `https://wa.me/2348145416775` instead of fetching from settings.
- **Impact:** If admin changes the WhatsApp number in settings, the dashboard still shows the old hardcoded number.

### 13. **No Confirmation Dialog Before Admin Approve/Reject**
- **Problem:** In `app/admin/bookings/page.tsx`, clicking Approve or Reject fires immediately (`onClick={() => updateStatus(booking.id, "APPROVED")}`). No confirmation modal, no "Are you sure?" prompt.
- **Impact:** Accidental clicks can approve or reject bookings irreversibly, triggering emails and Telegram notifications.

### 14. **Settings API Exposes All Settings Publicly**
- **Problem:** `app/api/settings/route.ts` GET has **no authentication check**. It returns ALL settings (including `notification_email`, `email_booking_approved`, `house_rules`, `security_alerts_enabled`, etc.) to anyone.
- **Impact:** Any unauthenticated user can see internal operational settings, admin email addresses, and house rules text. This is a **security concern**.

### 15. **No Booking Reference/Tracking Number Shown to Customer**
- **Problem:** After successful booking submission, the success screen (`app/book/page.tsx` L113–127) shows a generic "Booking Submitted!" message but does **NOT** display a booking reference number or the booking ID.
- **Impact:** When a customer contacts support about their booking, they have no reference number to provide. Makes support harder.

### 16. **No Email Logging to `EmailLog` Table**
- **Problem:** The `EmailLog` model exists in Prisma but is completely unused. The `sendEmail` function never creates records in this table.
- **Impact:** No historical audit trail of emails sent. Duplicate of point #8 but worth emphasizing — the entire model is dead code.

---

## ⚠️ Minor Issues / Improvements

| Issue | Detail |
|---|---|
| **Price label says "/wk" always** | The listing label in the booking form dropdown (L38) always shows `/wk` regardless of whether the listing price is actually weekly. |
| **No loading skeleton** | The booking form shows nothing while listings are loading from API. No skeleton or spinner. |
| **No form reset after error** | If submission fails, the form retains all data (this is actually good UX) but the error message could be more specific. |
| **Booking success page links to /dashboard** | If a guest (non-logged-in) submitted a booking, the "View Dashboard" link will redirect them to `/login`, which is confusing. |
| **No duplicate booking prevention** | The comment on L97 of the booking API says "Antispam duplicate check removed." A user can spam identical bookings. |
| **Hardcoded WhatsApp in email templates** | `lib/email.ts` has `2348145416775` hardcoded in email HTML (L63, L166, L185, L206). It does NOT pull from the dynamic `whatsapp_number` setting. |
| **`COMPLETED` and `CANCELLED` missing from admin filter tabs** | Admin filter tabs only show `all`, `PENDING`, `APPROVED`, `REJECTED` (L107). No tab for `COMPLETED` or `CANCELLED`. |

---

## Summary: Priority Fixes

| Priority | Issue |
|---|---|
| 🔴 **HIGH** | Settings API exposes all data publicly (security) |
| 🔴 **HIGH** | No booking pre-selection from availability/pricing pages (UX) |
| 🔴 **HIGH** | No customer booking cancellation |
| 🔴 **HIGH** | Email addresses hardcoded in templates instead of dynamic |
| 🟡 **MEDIUM** | No EmailLog tracking |
| 🟡 **MEDIUM** | No booking reference number shown to customer |
| 🟡 **MEDIUM** | No confirmation dialog on admin approve/reject |
| 🟡 **MEDIUM** | No reversal logic for approved-then-cancelled bookings |
| 🟡 **MEDIUM** | Dashboard WhatsApp link hardcoded |
| 🟢 **LOW** | Dead `calculateDueDate` import in booking POST |
| 🟢 **LOW** | Missing filter tabs for COMPLETED/CANCELLED |
| 🟢 **LOW** | No client-side Zod validation with react-hook-form |
