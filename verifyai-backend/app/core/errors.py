from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error carrying an HTTP status code and user-facing message."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UpstreamServiceError(AppError):
    """Raised when Groq, Tavily, or Supabase fail unexpectedly."""

    def __init__(self, message: str = "An upstream service failed. Please try again."):
        super().__init__(message, status.HTTP_502_BAD_GATEWAY)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"message": exc.message, "status_code": exc.status_code}},
    )


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"message": "An unexpected error occurred.", "status_code": 500}},
    )
