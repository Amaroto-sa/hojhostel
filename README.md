# HOJ Hostel — House of Jesse Web App

A complete, production-ready Next.js hostel booking and management platform for **House of Jesse / HOJ Hostel**.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling + brand theming |
| **Prisma ORM** | Database management |
| **PostgreSQL** | Database |
| **NextAuth.js** | Authentication (credentials) |
| **Zod** | Form/API validation |
| **Framer Motion** | Animation-ready |
| **Lucide React** | Icons |
| **Cloudinary** | Image upload support |

## Project Structure

```
├── app/
│   ├── page.tsx                    # Public homepage (all sections)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── login/page.tsx              # Customer login
│   ├── register/page.tsx           # Customer registration
│   ├── dashboard/page.tsx          # Customer dashboard
│   ├── availability/page.tsx       # Public availability
│   ├── pricing/page.tsx            # Public pricing
│   ├── locations/page.tsx          # Public locations
│   ├── book/page.tsx               # Booking form
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout + sidebar
│   │   ├── page.tsx                # Admin dashboard overview
│   │   ├── listings/page.tsx       # Listing CRUD
│   │   ├── bookings/page.tsx       # Booking management
│   │   ├── residents/page.tsx      # Resident management
│   │   ├── testimonials/page.tsx   # Testimonial management
│   │   └── settings/page.tsx       # Site settings
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth API
│       ├── register/               # Registration API
│       ├── bookings/               # Booking CRUD API
│       ├── listings/               # Listing CRUD API
│       ├── houses/                 # House CRUD API
│       ├── residents/              # Resident CRUD API
│       ├── testimonials/           # Testimonial CRUD API
│       ├── settings/               # Settings API
│       └── upload/                 # Image upload API
├── components/
│   ├── Navbar.tsx                  # Global navigation
│   ├── Footer.tsx                  # Global footer + WhatsApp float
│   └── Providers.tsx               # NextAuth provider
├── lib/
│   ├── auth.ts                     # NextAuth options
│   ├── prisma.ts                   # Prisma client
│   ├── validations.ts             # Zod schemas
│   ├── email.ts                    # Email templates + sender
│   ├── upload.ts                   # Cloudinary upload utils
│   ├── whatsapp.ts                 # WhatsApp link helpers
│   ├── due-date.ts                 # Due date calculation
│   └── utils.ts                    # Tailwind merge utility
├── prisma/
│   ├── schema.prisma               # Full database schema
│   └── seed.ts                     # Seed data
├── types/
│   └── next-auth.d.ts              # NextAuth type extensions
├── .env.example                    # Environment variable template
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── next.config.js
└── README.md
```

## Setup Instructions

### 1. Clone and Navigate
```bash
cd hoj-website
```

### 2. Environment Variables
```bash
cp .env.example .env
```

Fill in your secrets:
- `DATABASE_URL` — PostgreSQL connection string (Supabase, Neon, Vercel Postgres, or local)
- `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — Your app URL (e.g. `http://localhost:3000`)
- `CLOUDINARY_*` — Optional, for image uploads
- `SMTP_*` — Optional, for email notifications

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Initial Data (optional but recommended)
```bash
npx prisma db seed
```

This creates:
- Admin user: `admin@hojhostel.com` (password from `ADMIN_SECRET` env var, default: `admin123`)
- HOJ 1 & HOJ 2 houses
- All 4 accommodation listings with real prices
- Default site settings including house rules

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

1. Push code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add all `.env` variables in Vercel project settings
4. Build command: `npm run build`
5. Install command: `npm install`
6. Deploy!

The `postinstall` script in `package.json` auto-generates the Prisma client during deployment.

## Key Features

### Public Website
- Premium homepage with Hero, About, Amenities, Pricing, Gallery, Testimonials, Contact
- Real-time availability display synced with admin
- Full booking form with all required resident fields
- WhatsApp CTA everywhere
- SEO-optimized with proper meta tags

### Customer System
- Registration & login
- Customer dashboard with booking history and stay tracking
- Due date visibility
- Booking request submission

### Admin Dashboard
- Protected admin routes with role-based access
- Dashboard overview with key metrics
- Full listing CRUD (create/edit/delete/publish/unpublish/featured)
- Booking management (approve/reject/view details)
- Resident management with due-date alerts
- Testimonial management (add/edit/delete/show/hide)
- Site settings management
- Image upload support via Cloudinary

### Backend Logic
- Automatic due-date calculation from check-in + duration
- Occupancy sync: approved bookings auto-update capacity
- Overbooking prevention
- Email notification templates (booking, approval, welcome, house rules)
- Availability status auto-updates based on occupancy

## Business Data Used

- **Brand:** House of Jesse / HOJ Hostel
- **Theme:** Orange (#ff7a1a) + Black (#0a0a0c)
- **WhatsApp:** +234 814 541 6775
- **Email:** houseofjessehostel@gmail.com
- **HOJ 1:** Golden Rays Estate, Olokonla
- **HOJ 2:** Greenland Estate, Olokonla Ajah
- **Pricing:** 7 bed (₦30k/wk), 14 bed (₦40k/wk), Single A (₦40k/wk), Single B (₦70k/wk)

## Security

- No hardcoded credentials anywhere in the codebase
- All secrets in `.env` with `.env.example` template
- Password hashing with bcrypt (12 rounds)
- Server-side validation with Zod on all API routes
- Role-based route protection (CUSTOMER, ADMIN, SUPER_ADMIN)
- CSRF protection via NextAuth
