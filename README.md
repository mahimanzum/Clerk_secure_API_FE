# Secured API Communication with Next.js & FastAPI

A complete example of secured API communication between a Next.js frontend and FastAPI backend using Clerk authentication and JWT tokens.

## 🔐 Architecture Overview

- **Frontend**: Next.js with Clerk authentication
- **Backend**: FastAPI with JWT verification using Clerk's JWKS
- **Security**: JWT tokens, CORS protection, HTTPS ready
- **Local Development**: Docker Compose setup for easy testing

## 🏗️ Project Structure

```
├── frontend/          # Next.js application with Clerk
├── backend/           # FastAPI application with JWT verification
├── docker-compose.yml # Local development setup
└── README.md         # This file
```

## 🚀 Quick Start

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd Secured_Api_Communication
   ```

2. **Set up Clerk:**
   - Create account at [clerk.com](https://clerk.com)
   - Create a new application
   - Get your Frontend API key and Secret key
   - Note your JWT Issuer URL

3. **Configure environment variables:**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...  # Same value as backend
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Backend (.env)
   CLERK_PUBLISHABLE_KEY=pk_test_...              # Same value as frontend
   CLERK_JWT_ISSUER=https://your-app.clerk.accounts.dev
   CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
   ```

   **Note**: `CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` should have the **same value** - your Clerk publishable key.

4. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

5. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔒 Security Features

- **JWT Token Verification**: Backend verifies JWT tokens using Clerk's public keys
- **CORS Protection**: Configured for secure cross-origin requests
- **HTTPS Ready**: Production-ready security headers
- **Route Protection**: Middleware-based authentication
- **Rate Limiting**: Protection against abuse

## 📱 Frontend Features

- Clerk authentication (sign-in/sign-up)
- Protected routes with middleware
- Automatic token management
- Secure API calls with JWT headers

## 🖥️ Backend Features

- FastAPI with automatic OpenAPI docs
- JWT verification using Clerk's JWKS
- Protected endpoints
- User information extraction from tokens

## 🧪 Testing the Integration

1. Start the services
2. Visit http://localhost:3000
3. Sign up/Sign in with Clerk
4. Access protected pages
5. Check Network tab to see JWT tokens in API calls

## 🚀 Production Deployment

- Use environment variables for all secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up rate limiting
- Monitor JWT token usage

## 📚 Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Authentication](https://nextjs.org/docs/authentication) # Clerk_secure_API_FE
