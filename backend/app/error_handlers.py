from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger("speaking_agent")

def register_error_handlers(app):

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning(f"HTTP {exc.status_code}: {exc.detail} — {request.url}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail, "status_code": exc.status_code}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        # Convert errors to string-safe format (bytes are not JSON serializable)
        safe_errors = []
        for err in exc.errors():
            safe_err = {}
            for k, v in err.items():
                if isinstance(v, bytes):
                    safe_err[k] = v.decode("utf-8", errors="replace")
                else:
                    safe_err[k] = v
            safe_errors.append(safe_err)
        logger.error(f"Validation error: {safe_errors}")
        return JSONResponse(
            status_code=422,
            content={"error": "Validation failed", "details": safe_errors}
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled error on {request.url}: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error. Please try again."}
        )
