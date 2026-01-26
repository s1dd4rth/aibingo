# AI Bingo Quest 🤖🎯

A gamified AI learning platform built with **Next.js 15**, **Prisma**, and **Google Gemini 2.0**.
Participants unlock stamps by running Python snippets in Colab, learning the full AI stack from "Asking" to "Thinking" and "Agents".

## Features
- **Gamified Learning**: 20 unlockable components representing the modern AI stack.
- **Magic Link Auth**: Passwordless login using simulated email (dev) or Nodemailer.
- **Live Leaderboard**: Real-time ranking with Presenter Mode for workshops.
- **Multiplayer Sessions**: Join rooms with custom codes (e.g. `WORKSHOP-1`).
- **AI Integration**:
  - Gemini 2.0 Flash for core logic.
  - Gemini 3.0 Flash Preview for **Native Thinking** (System 2 reasoning).
  - Multimodal capabilities (Audio/Video understanding).

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: SQLite (Dev) / Postgres (Prod) via Prisma
- **Styling**: TailwindCSS 4 + Framer Motion
- **AI**: Google Gemini API (`google-genai` SDK)

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/s1dd4rth/aibingo.git
cd aibingo
npm install
```

### 2. Environment Setup
Create a `.env` file:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_google_ai_studio_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Locally
```bash
npx prisma db push  # Setup SQLite DB
npm run dev         # Start Server
```
Visit `http://localhost:3000`.

## Deployment (Vercel)
1.  Push to GitHub.
2.  Import in Vercel.
3.  Set Environment Variables (`GEMINI_API_KEY`, `POSTGRES_PRISMA_URL`...).
4.  **Important**: Update `prisma/schema.prisma` to use `provider = "postgresql"` for production.

## Workshop Mode (Facilitator)
1.  Go to `/leaderboard`.
2.  Click **Present**.
3.  Share the **Session Code** shown on screen.
4.  Participants join via the "Live Workshop" box on the home screen.


## Testing

We use Jest and React Testing Library for unit and integration testing.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## CI/CD and Automation

This project includes a comprehensive test suite that should be run before deployment:

1. **Unit Tests**: Cover utility functions and individual components.
2. **Integration Tests**: Verify interactions between components and mock server actions.

**To run the full suite:**
```bash
npm test
```

## Security Standards

This project implements standard security practices:
- **Headers**: Strict Content-Security-Policy, HSTS, X-Frame-Options configured in `next.config.ts`.
- **Authentication**: Secure Magic Link implementation with JWT.
- **CSRF Protection**: Standard protection via Next.js Server Actions and framework features.

## Accessibility Guidelines

We follow WCAG 2.1 AA standards. Key practices include:
- **Semantic HTML**: Proper use of standard elements.
- **ARIA Attributes**: Used where semantic HTML is insufficient (e.g., dynamic states in Bingo cards).
- **Keyboard Navigation**: Ensure all interactive elements are reachable via keyboard.
- **Color Contrast**: sufficient contrast ratios for text and UI elements.

## License
MIT

