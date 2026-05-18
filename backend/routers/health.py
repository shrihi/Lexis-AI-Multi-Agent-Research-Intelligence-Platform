from fastapi import APIRouter

router = APIRouter()

@router.get("/healthz")
async def health():
    return {"status": "ok", "timestamp": __import__('datetime').datetime.now().isoformat()}

