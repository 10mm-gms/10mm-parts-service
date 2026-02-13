from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    NFR-002: Secure API against unauthorised access.
    Checks for a JWT token in the Authorization header.
    For now, any valid-looking token is accepted as per NFR:
    'user authentication is not needed, so a JWT token should be embedded in the front end code'
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user": "default"}
