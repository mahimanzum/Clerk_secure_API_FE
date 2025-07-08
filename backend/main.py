import os
import httpx
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Dict, Optional
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global JWKS cache
jwks_cache: Dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    logger.info("🚀 FastAPI server starting up...")
    yield
    logger.info("🛑 FastAPI server shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="Secured API with Clerk Authentication",
    description="A FastAPI backend that verifies JWT tokens from Clerk",
    version="1.0.0",
    lifespan=lifespan
)

# Environment variables
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY")
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

if not all([CLERK_PUBLISHABLE_KEY, CLERK_JWT_ISSUER, CLERK_JWKS_URL]):
    raise ValueError("Missing required Clerk environment variables")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://localhost:3000",  # Next.js dev server with HTTPS
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

async def get_clerk_public_keys():
    """Fetch and cache Clerk's public keys from JWKS endpoint"""
    global jwks_cache
    
    if not jwks_cache:
        try:
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching JWKS from {CLERK_JWKS_URL}")
                response = await client.get(CLERK_JWKS_URL)
                response.raise_for_status()
                jwks_data = response.json()
                jwks_cache = jwks_data
                logger.info("JWKS cache updated successfully")
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch authentication keys"
            )
    
    return jwks_cache.get("keys", [])

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from Clerk"""
    token = credentials.credentials
    
    try:
        # Get unverified header to find the key ID
        unverified_header = jwt.get_unverified_header(token)
        key_id = unverified_header.get("kid")
        
        if not key_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing key ID"
            )
        
        # Get public keys from Clerk
        jwks_keys = await get_clerk_public_keys()
        
        # Find the matching key
        signing_key = None
        for key in jwks_keys:
            if key.get("kid") == key_id:
                signing_key = key
                break
        
        if not signing_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: signing key not found"
            )
        
        # Verify the token
        payload = jwt.decode(
            token,
            key=signing_key,
            algorithms=[signing_key.get("alg", "RS256")],
            audience=CLERK_PUBLISHABLE_KEY,
            issuer=CLERK_JWT_ISSUER,
        )
        
        logger.info(f"Token verified for user: {payload.get('sub')}")
        return payload
        
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Routes
@app.get("/")
async def root():
    """Public endpoint - no authentication required"""
    return {
        "message": "🔐 Secured API with Clerk Authentication",
        "status": "running",
        "auth": "not_required"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fastapi-backend",
        "auth_provider": "clerk"
    }

@app.get("/protected")
async def protected_route(user_data: dict = Depends(verify_clerk_token)):
    """Protected endpoint - requires valid JWT token"""
    return {
        "message": "🎉 Access granted to protected resource!",
        "user_id": user_data.get("sub"),
        "user_email": user_data.get("email"),
        "issued_at": user_data.get("iat"),
        "expires_at": user_data.get("exp"),
        "auth": "required"
    }

@app.get("/user/profile")
async def get_user_profile(user_data: dict = Depends(verify_clerk_token)):
    """Get user profile information from JWT token"""
    return {
        "user_id": user_data.get("sub"),
        "email": user_data.get("email"),
        "full_name": user_data.get("name"),
        "session_id": user_data.get("sid"),
        "token_claims": {
            key: value for key, value in user_data.items() 
            if key not in ["iat", "exp", "nbf", "iss", "aud"]
        }
    }

@app.post("/user/data")
async def update_user_data(
    data: dict,
    user_data: dict = Depends(verify_clerk_token)
):
    """Example endpoint for updating user data"""
    user_id = user_data.get("sub")
    
    # In a real application, you would save this to a database
    return {
        "message": "User data updated successfully",
        "user_id": user_id,
        "updated_data": data,
        "timestamp": user_data.get("iat")
    }

@app.get("/admin/users")
async def admin_only_route(user_data: dict = Depends(verify_clerk_token)):
    """Example admin route - you would check user roles here"""
    # In a real app, you'd verify admin role from token claims or database
    user_email = user_data.get("email", "")
    
    # Simple admin check (in production, use proper role-based access)
    if not user_email.endswith("@admin.com"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return {
        "message": "Admin access granted",
        "users": [
            {"id": "user_1", "email": "user1@example.com"},
            {"id": "user_2", "email": "user2@example.com"},
        ],
        "admin_user": user_data.get("sub")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 