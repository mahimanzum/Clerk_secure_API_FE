# Security Testing Guide

This guide helps you verify that the secured API communication is working correctly.

## 🔒 Authentication Flow Testing

### 1. Test Public Endpoints (No Authentication Required)

```bash
# Test public health endpoint
curl http://localhost:8000/health

# Test public root endpoint
curl http://localhost:8000/
```

**Expected Result**: Both should return JSON responses without authentication.

### 2. Test Protected Endpoints Without Authentication

```bash
# Try to access protected endpoint without token
curl http://localhost:8000/protected
```

**Expected Result**: Should return `401 Unauthorized` with message about missing authentication.

### 3. Test Protected Endpoints With Invalid Token

```bash
# Try with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:8000/protected
```

**Expected Result**: Should return `401 Unauthorized` with JWT verification error.

## 🔑 JWT Token Testing

### 1. Get Valid JWT Token

1. Open your browser and go to `http://localhost:3000`
2. Sign in with Clerk
3. Open browser developer tools (F12)
4. Go to Console tab
5. Run this command to get your JWT token:

```javascript
// Get the current session token
const token = await window.Clerk.session.getToken()
console.log(token)
```

### 2. Test with Valid Token

```bash
# Replace YOUR_JWT_TOKEN with the actual token from step 1
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/protected
```

**Expected Result**: Should return user information and success message.

### 3. Test Different Protected Endpoints

```bash
# Test user profile endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/user/profile

# Test admin endpoint (should fail unless email ends with @admin.com)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/admin/users

# Test POST endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "message": "Hello from API!"}' \
  http://localhost:8000/user/data
```

## 🛡️ Security Verification

### 1. CORS Testing

Test that CORS is properly configured:

```bash
# This should be blocked from a different origin
curl -H "Origin: http://malicious-site.com" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/protected
```

### 2. JWT Token Expiration

Clerk tokens typically expire after 1 hour. To test expiration:

1. Get a token and wait for it to expire (or manually set a short expiration in Clerk dashboard)
2. Try to use the expired token
3. Should receive `401 Unauthorized`

### 3. Token Signature Verification

The backend verifies JWT signatures using Clerk's public keys (JWKS). This ensures:

- Tokens can't be forged
- Tokens are issued by your Clerk instance
- Tokens haven't been tampered with

## 🔍 Frontend Security Testing

### 1. Protected Routes

1. Open `http://localhost:3000/dashboard` while not signed in
2. Should redirect to Clerk sign-in page

### 2. Automatic Token Handling

1. Sign in to the frontend
2. Click the API testing buttons
3. Check Network tab in browser dev tools
4. Verify that requests include `Authorization: Bearer <token>` headers

### 3. Token Refresh

Clerk automatically handles token refresh. To test:

1. Stay logged in for an extended period
2. Continue using the app
3. Tokens should be refreshed automatically without user intervention

## 🚨 Common Security Issues to Check

### ✅ What Should Work

- Signed-in users can access protected routes
- Valid JWT tokens allow API access
- Automatic token refresh
- CORS protection for allowed origins
- Proper error messages for authentication failures

### ❌ What Should Be Blocked

- Unauthenticated access to protected routes
- Invalid or expired JWT tokens
- Requests from unauthorized origins
- Malformed authentication headers
- Access to admin routes without proper permissions

## 🔧 Troubleshooting

### Backend Issues

1. **"Unable to fetch authentication keys"**
   - Check your `CLERK_JWKS_URL` environment variable
   - Ensure your server can reach Clerk's JWKS endpoint

2. **"Invalid token: signing key not found"**
   - Token was issued by a different Clerk instance
   - Check your `CLERK_PUBLISHABLE_KEY` and `CLERK_JWT_ISSUER`

3. **CORS errors**
   - Check `allow_origins` in the FastAPI CORS middleware
   - Ensure frontend URL is included in allowed origins

### Frontend Issues

1. **Redirect loops**
   - Check your Clerk configuration
   - Verify middleware route matching patterns

2. **API calls failing**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify backend is running and accessible

## 📊 Security Monitoring

In production, monitor for:

- Failed authentication attempts
- Unusual API access patterns
- Expired token usage
- Cross-origin request attempts
- Rate limiting triggers

## 🔐 Best Practices Implemented

This implementation includes:

- ✅ JWT signature verification using JWKS
- ✅ Token expiration validation
- ✅ CORS protection
- ✅ Secure HTTP headers
- ✅ Environment variable configuration
- ✅ Error handling without information leakage
- ✅ Route-based access control
- ✅ Automatic token refresh on frontend 