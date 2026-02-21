# Writer Integrity System

A comprehensive platform for managing writers, assignments, and ensuring content integrity through AI-powered analysis.

## Features

- **Writer Management**: Onboard, track, and manage writers with profiles
- **Assignment System**: Create and assign tasks with deadlines
- **Submission Analysis**: AI-powered content analysis for:
  - Style consistency (fingerprinting)
  - AI-generated content detection
  - Citation verification
  - Reasoning depth assessment
- **Admin Dashboard**: Comprehensive analytics and reporting
- **Secure Configuration**: All API keys encrypted at rest
- **Multi-Provider LLM Support**: OpenAI, Anthropic, Gemini, Groq

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add CONFIG_ENCRYPTION_KEY

# Initialize database
npx prisma migrate dev

# Start development server
npm run dev

# Seed database (in another terminal)
curl -X POST http://localhost:3000/api/debug/seed
```

Then open http://localhost:3000 and log in with:
- Email: `muhsinaov0@gmail.com`
- Password: `Amnas@1997`

## Production Setup

See [PRODUCTION.md](./PRODUCTION.md) for detailed production deployment instructions.

## API Configuration

All LLM API keys are configured through the Admin Panel:
1. Log in as admin
2. Go to Settings → LLM Configuration
3. Select provider and enter API key
4. Test connection before saving

## Architecture

- **Frontend**: Next.js 16, React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: Cookie-based sessions
- **Encryption**: AES-256 for sensitive config

## Project Structure

```
app/
├── admin/           # Admin dashboard pages
├── writer/          # Writer portal pages
├── api/             # API routes
├── login/           # Authentication
└── onboarding/      # Writer onboarding

lib/
├── config/          # Secure configuration
├── intelligence/    # LLM adapters
├── auth/            # Session management
├── baseline/        # Style analysis
└── policy/          # Policy management

prisma/
└── schema.prisma    # Database schema
```

## Security

- All API keys encrypted at rest
- HttpOnly cookies for sessions
- Role-based access control
- Input validation on all endpoints
- Audit logging for sensitive operations

## License

Private - All rights reserved.
