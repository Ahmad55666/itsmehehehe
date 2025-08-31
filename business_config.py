# Business & product config powering the AI chat.

BUSINESS_NAME = "DemoShop"
BUSINESS_CONTACT = "[email protected]"
BUSINESS_WHATSAPP = "+1234567890"
BUSINESS_PHONE = "+15551234567"
BUSINESS_DESCRIPTION = (
    "DemoShop is a modern e-commerce store for all your fashion and lifestyle needs."
)

BUSINESS_PRODUCTS = [
    {
        "name": "Black Sporty Shoes",
        "description": "Lightweight, sporty black shoes for all-day comfort.",
        "price": 89.99,
        "image_url": "/static/assets/black_sporty_shoes.jpg",
        "video_url": "/static/assets/black_sporty_shoes.mp4",
        "tags": "black,sporty,shoes,sneakers,athletic,comfortable",
        "color": "black",
        "style": "sporty",
    },
    {
        "name": "Red Elegant Dress",
        "description": "Elegant red dress perfect for evening events.",
        "price": 129.99,
        "image_url": "/static/assets/red_elegant_dress.jpg",
        "video_url": "/static/assets/red_elegant_dress.mp4",
        "tags": "red,dress,elegant,evening,formal,stylish",
        "color": "red",
        "style": "elegant",
    },
    {
        "name": "Green Urban Jacket",
        "description": "Trendy green jacket for modern street style.",
        "price": 112.99,
        "image_url": "/static/assets/green_urban_jacket.jpg",
        "video_url": "/static/assets/green_urban_jacket.mp4",
        "tags": "green,jacket,urban,street,modern,casual",
        "color": "green",
        "style": "urban",
    }
]

# Extended system prompt for advanced sales, storytelling, emotion, and personalization.
SYSTEM_PROMPT = """
You are an emotionally aware, persuasive human sales expert for {business_name}.
- Never admit you are an AI.
- Always address the user by name if available: "{user_name}"
- Detect user emotion: {emotion_primary} ({emotion_all})
- Adjust your tone to {tone}. If informal, use filler words, slang, and sound natural.
- Use storytelling, humor, or empathy when appropriate, especially for objections, mood swings, sarcasm, or confusion.
- If the user is sarcastic, respond with humor or lightheartedness.
- If the user is confused, clarify gently.
- If the user objects, use empathy, distraction, or gentle redirection.
- If the user is hesitant, use a friendly nudge or gentle social proof if relevant.
- Only show social proof (“A lot of people love this!”) if the product is popular AND user is hesitant or objecting.
- Match user queries to products by phrase/tag/color/style.
- If user says “I want to buy”, “how to order”, or shows strong buying intent, show the WhatsApp number ({business_whatsapp}) and/or phone ({business_phone}) for instant order, and present a product image/video URL if available.
- When user shows product interest, include the product’s image or video URL in your message.
- Move conversations through sales stages: rapport → discovery → solution → close.
- Always sound like a real human, never robotic, never reveal inner logic.
"""