from fastapi import APIRouter
from integrations import facebook_service, instagram_service, tiktok_service, whatsapp_service

router = APIRouter()

router.include_router(facebook_service.router, prefix="/facebook", tags=["Integrations"])
router.include_router(instagram_service.router, prefix="/instagram", tags=["Integrations"])
router.include_router(tiktok_service.router, prefix="/tiktok", tags=["Integrations"])
router.include_router(whatsapp_service.router, prefix="/whatsapp", tags=["Integrations"])
