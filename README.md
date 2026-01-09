# InsureShield - Insurance Portal

A sleek, modern insurance portal built with Next.js 16, shadcn/ui, and Tailwind CSS. Features a comprehensive dashboard for managing insurance policies, member details, and KYC verification.

## Features

- **Landing Page** - Modern hero section, features, stats, and CTA
- **Authentication** - Login with Member ID, signup with validation
- **Dashboard** - Policy overview with quick stats and KYC banner
- **Policy Management** - Detailed policy view with tabs for coverage and members
- **Dark/Light Mode** - Full theme support with smooth transitions
- **Responsive Design** - Works on all screen sizes
- **Mock API Layer** - Easy to replace with real backend

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Validation**: [Zod](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd insure_agents_ui

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

```
Sign up for a new user and then log in with the new email or member ID.
- **Valid case:** Create one account and run the KYC flow with `visa-IN.png` (expects APPROVED).
- **Rejected case:** Create a second account and use `visa-N.png` (expects REJECTED). 
```

## Testing KYC Verification Flow

Follow these steps to test the complete KYC verification process:

### Demo Files Location

Mock documents are available in `public/demo/`:

| File | Purpose |
|------|---------|
| `passport-IN.png` | Indian passport for identity verification |
| `visa-IN.png` | Valid Indian visa (for **SUCCESS** case) |
| `visa-N.png` | Non-valid visa (for **REJECTION** case) |
| `livephoto.jpg` | Live photo for facial verification |

### Step-by-Step Testing

#### 1. Sign Up
- Navigate to the **Sign Up** page
- Fill in your details (name, email, password, etc.)
- Complete registration

#### 2. Login
- Use your registered **email** or **member ID** to login
- Enter your password

#### 3. Start KYC Verification
- After login, you'll see a **KYC Pending** banner on the dashboard
- Click **"Start Verification"** button to begin the KYC process

#### 4. Upload Passport
- When prompted, upload `passport-IN.png` from `public/demo/`
- Wait for OCR extraction to complete

#### 5. Upload Visa & Live Photo

**For SUCCESS Case:**
- Upload `visa-IN.png` - Valid Indian visa
- Upload `livephoto.jpg` - Live photo
- The verification will be **APPROVED**

**For REJECTION Case:**
- Upload `visa-N.png` - Non-valid visa
- Upload `livephoto.jpg` - Live photo
- The verification will be **REJECTED**

### Quick Test Commands

```bash
# Start the development server
bun dev

# Open the app
# Navigate to http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── (dashboard)/        # Protected pages (dashboard, policies)
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles & CSS variables
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Footer, DashboardNav, KycBanner
│   ├── landing/            # Hero, Features, Stats, CTA sections
│   ├── auth/               # Login & Signup forms
│   ├── dashboard/          # PolicyCard, QuickStats
│   └── policy/             # PolicyDetails, MemberDetails tabs
│
├── types/                  # TypeScript interfaces
│   ├── user.ts             # User, Address, KycStatus
│   ├── policy.ts           # Policy, PolicyMember, PolicySummary
│   └── api.ts              # API request/response types
│
├── api/                    # API layer
│   ├── client.ts           # API client with mock toggle
│   ├── auth.ts             # Auth API methods
│   ├── policies.ts         # Policies API methods
│   └── mock/               # Mock implementations
│       ├── handlers.ts     # Mock request handlers
│       ├── delay.ts        # Simulate network delay
│       └── data/           # Mock data (users, policies)
│
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts         # Authentication hook
│   └── use-policies.ts     # Policies data hook
│
├── store/                  # Zustand stores
│   └── auth-store.ts       # Auth state management
│
├── providers/              # React context providers
│   └── theme-provider.tsx  # Dark/light theme provider
│
└── lib/                    # Utilities
    ├── utils.ts            # General utilities (cn)
    ├── constants.ts        # App constants & labels
    └── validations.ts      # Zod validation schemas
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true     # Set to false for real API
NEXT_PUBLIC_APP_NAME=InsureShield
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Connecting to Real API

The project uses a mock API layer that can be easily replaced with a real backend:

1. Set `NEXT_PUBLIC_USE_MOCK_API=false` in `.env.local`
2. Update `NEXT_PUBLIC_API_URL` to your backend URL
3. The API client in `src/api/client.ts` will automatically use real endpoints

### Expected API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with memberId & password |
| POST | `/auth/signup` | Register new user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| GET | `/policies` | Get user's policies |
| GET | `/policies/:id` | Get policy details |
| GET | `/policies/:id/members` | Get policy members |

## Data Models

### User

```typescript
interface User {
  id: string;
  memberId: string;        // e.g., "INS2024001"
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  kycStatus: 'pending' | 'verified' | 'rejected';
}
```

### Policy

```typescript
interface Policy {
  id: string;
  policyNumber: string;    // e.g., "HLT-2024-00001"
  type: 'health' | 'life' | 'auto' | 'home';
  name: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly';
  deductible: number;
  startDate: string;
  endDate: string;
  members: PolicyMember[];
}
```

## Adding New Features

### Adding a New Page

1. Create page in `src/app/(dashboard)/your-page/page.tsx`
2. Add navigation link in `src/components/layout/dashboard-nav.tsx`

### Adding New shadcn Components

```bash
bunx shadcn@latest add [component-name]
```

### Adding New API Endpoints

1. Add types in `src/types/`
2. Add mock handler in `src/api/mock/handlers.ts`
3. Add API method in `src/api/`

## KYC Integration

The portal includes a KYC banner that appears when `user.kycStatus === 'pending'`. To integrate your KYC flow:

1. Update the "Start Verification" button in `src/components/layout/kyc-banner.tsx`
2. Create KYC verification pages
3. Update user status via API after verification

## Scripts

```bash
bun dev        # Start development server
bun build      # Build for production
bun start      # Start production server
bun lint       # Run ESLint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.
