import os
import sys

from db.session import init_db
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from gms_backend_core.config import GmsBackendSettings
from gms_backend_core.logging.config import setup_logging
from parts.api.v1.location import router as locations_router
from parts.api.v1.part import router as parts_router
from parts.api.v1.search import router as search_router
from parts.api.v1.vehicle import router as vehicles_router
from pydantic import ValidationError

# Initialize shared configuration with explicit error handling for open source
try:
    settings = GmsBackendSettings()
except ValidationError as e:
    print("\n❌ FATAL: Missing mandatory environment variables.")
    print("--------------------------------------------------")
    for error in e.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        print(f"  - {field}: {error['msg']}")
    print("--------------------------------------------------")
    print("Please ensure your .env file or environment contains these required values.")
    print("Refer to the project documentation for more details.\n")
    sys.exit(1)

# Setup standardized logging
setup_logging(settings)

app = FastAPI(title="Parts Service API")


@app.on_event("startup")
async def on_startup():
    await init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parts_router, prefix="/api/v1")
app.include_router(vehicles_router, prefix="/api/v1")
app.include_router(locations_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}


# Static file serving
# In Docker, files are in /app/static. Locally, they are in src/frontend/dist
static_dir = "/app/static" if os.path.exists("/app/static") else "src/frontend/dist"

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # API requests should have been handled by routers already
        if full_path.startswith("api/v1") or full_path == "health":
            return None  # Let FastAPI handle 404 for missing API endpoints

        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend build not found"}
else:

    @app.get("/")
    async def root_no_static():
        return {"message": "Parts Service API is running. Static files not found."}
