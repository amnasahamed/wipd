# Writer Integrity System - Production Setup Guide

## Overview

This is a production-ready Writer Integrity System with secure API key management, real LLM integrations, and comprehensive admin configuration.

## Key Features

- **Secure Configuration Management**: All API keys are encrypted at rest using AES-256
- **Multiple LLM Provider Support**: OpenAI, Anthropic, Google Gemini, Groq
- **Admin Configuration Panel**: Configure all settings from the web interface
- **Real-time Connection Testing**: Test API keys before saving
- **Health Monitoring**: Built-in health check endpoint
- **Audit Logging**: Track all configuration changes

## Environment Variables

### Required

```bash
# Database
DATABASE_URL="file:./dev.db"  # For SQLite (dev)
# OR
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  # For PostgreSQL (production)

# Security (CRITICAL - must be set in production)
CONFIG_ENCRYPTION_KEY="your-secure-32-char-encryption-key"
```

Generate a secure encryption key:
```bash
openssl rand -base64 32
```

### Optional

```bash
# NextAuth (if using authentication)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Seed protection
SEED_TOKEN="optional-token-for-seed-protection"
```

## First-Time Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and set CONFIG_ENCRYPTION_KEY
   ```

3. **Initialize the database**:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the database** (creates admin user and default config):
   ```bash
   # Start the dev server first
   npm run dev
   
   # Then in another terminal
   curl -X POST http://localhost:3000/api/debug/seed
   ```

5. **Access the admin panel**:
   - URL: http://localhost:3000/login
   - Email: muhsinaov0@gmail.com
   - Password: Amnas@1997

6. **Configure LLM Provider**:
   - Go to Settings → LLM Configuration
   - Select your preferred provider
   - Enter API key
   - Click "Test" to verify connection
   - Save changes

## API Configuration from Admin Panel

All API configuration is managed through the web interface at `/admin/settings/llm`:

### Supported Providers

1. **OpenAI** (GPT-4, GPT-4o, GPT-4o-mini)
2. **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)
3. **Google Gemini** (1.5 Flash, 1.5 Pro)
4. **Groq** (Llama 3.1, Mixtral)
5. **Mock** (For testing without API costs)

### Security

- API keys are encrypted using AES-256 before storage
- Encryption key is stored in environment variable `CONFIG_ENCRYPTION_KEY`
- Keys are never exposed in the frontend (masked as `********`)
- Keys are only decrypted server-side when making API calls

## Health Checks

### Basic Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "database": true,
    "encryption": true,
    "configuration": true
  }
}
```

### Detailed Health Check (Admin only)
```bash
curl -X POST http://localhost:3000/api/health \
  -H "Cookie: auth-token=your-auth-token"
```

## Database Schema

Key tables:
- `User` - User accounts (admin/writer)
- `Profile` - Writer profiles with baseline metrics
- `Submission` - Document submissions
- `AnalysisResult` - LLM analysis results
- `SystemConfig` - Encrypted configuration values
- `ApiUsageLog` - API call logging for monitoring

## Monitoring

### API Usage Logs
All LLM API calls are logged to the `ApiUsageLog` table with:
- Provider name
- Endpoint
- Request/response size
- Status code
- Duration
- Success/failure
- Related submission ID

### Configuration Changes
All configuration changes are tracked with:
- Who made the change (user ID)
- When the change was made
- What was changed

## Deployment Checklist

- [ ] Set `CONFIG_ENCRYPTION_KEY` (32+ characters)
- [ ] Change default admin password
- [ ] Set up PostgreSQL database for production
- [ ] Configure `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Disable seed endpoint or set `SEED_TOKEN`
- [ ] Set up health check monitoring
- [ ] Configure rate limiting (if needed)
- [ ] Set up log aggregation
- [ ] Configure backup for database

## Troubleshooting

### Encryption Issues
If you see "Failed to decrypt configuration value":
- The `CONFIG_ENCRYPTION_KEY` may have changed
- You'll need to re-enter API keys in the admin panel

### API Connection Issues
- Use the "Test" button next to each API key field
- Check the browser console and server logs
- Verify the API key is valid and has sufficient quota

### Database Issues
- Ensure `DATABASE_URL` is correctly set
- Run `npx prisma migrate deploy` in production

## Support

For issues or questions:
1. Check the health endpoint
2. Review server logs
3. Verify environment variables
4. Test API keys individually
