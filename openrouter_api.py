import httpx
from config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

async def query_openrouter(messages, system_prompt=None):
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": []
    }
    # The system prompt is already included in messages[0] by the route
    payload["messages"].extend(messages)
    async with httpx.AsyncClient() as client:
        r = await client.post(OPENROUTER_URL, headers=headers, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
