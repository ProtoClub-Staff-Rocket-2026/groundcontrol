import httpx
from fastapi import APIRouter

from app.config import LAUNCH_PAD_URL

router = APIRouter()


@router.get("/commands/launch")
async def launch():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(LAUNCH_PAD_URL)
        return {"status_code": response.status_code, "message": response.text}
    except httpx.RequestError as e:
        return {"status_code": 500, "message": str(e)}
