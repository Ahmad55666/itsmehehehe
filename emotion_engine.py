import re

EMOTION_KEYWORDS = {
    "excited": [
        "excited", "can't wait", "amazing", "awesome", "love", "great", "stoked", 
        "woohoo", "perfect", "exactly what i need", "this is it", "fantastic"
    ],
    "frustrated": [
        "frustrated", "angry", "annoyed", "upset", "hate", "bad", "not working", 
        "wtf", "terrible", "worst", "horrible", "stupid"
    ],
    "hesitant": [
        "maybe", "not sure", "thinking", "wondering", "possibly", "idk", "i don't know",
        "hmm", "uncertain", "on the fence", "torn between", "hard to decide"
    ],
    "curious": [
        "curious", "interested", "want to know", "tell me", "what is", "how does", 
        "can you explain", "more info", "details", "learn more"
    ],
    "confused": [
        "confused", "don't get", "makes no sense", "lost", "unclear", "what?", 
        "wait what", "i don't understand", "huh", "explain again"
    ],
    "sarcasm": [
        "yeah right", "sure thing", "as if", "of course", "totally", "oh great",
        "because that's what i need", "just great", "wonderful", "fantastic" # context dependent
    ],
    "mood_swing": [
        "first i liked", "now i'm not sure", "changed my mind", "was excited but", 
        "maybe not", "actually", "wait", "on second thought"
    ],
    "strong_objection": [
        "too expensive", "don't like", "not interested", "no thanks", "never", 
        "hate this", "useless", "waste of money", "overpriced", "not worth it"
    ],
    "buying_interest": [
        "interested in buying", "want to purchase", "looking to buy", "ready to order",
        "how much", "what's the price", "cost", "affordable", "budget", "payment"
    ],
    "strong_interest": [
        "love this", "perfect", "exactly what i want", "this is great", "i like this",
        "looks good", "impressive", "nice", "beautiful", "stunning"
    ],
    "price_conscious": [
        "expensive", "cheap", "affordable", "budget", "cost", "price", "money",
        "deal", "discount", "sale", "offer", "payment plan"
    ],
    "social_proof_seeking": [
        "reviews", "what do others say", "popular", "bestseller", "recommended",
        "others bought", "testimonials", "feedback", "ratings"
    ]
}

BUYING_INTENT_PHRASES = [
    "i want to buy", "how to order", "can i purchase", "ready to buy",
    "i'll take it", "add to cart", "checkout", "order now", "buy this",
    "how much does it cost", "what's the price", "can i get this"
]

OBJECTION_PATTERNS = [
    r"too (expensive|costly|much|pricey)",
    r"(can't|cannot) afford",
    r"(don't|do not) (like|want|need)",
    r"not (interested|sure|ready)",
    r"maybe (later|another time)"
]

def detect_emotion(text):
    """Enhanced emotion detection for sales conversations"""
    t = text.lower().strip()
    found_emotions = []
    
    # Check for buying intent first (highest priority)
    buying_intent_score = 0
    for phrase in BUYING_INTENT_PHRASES:
        if phrase in t:
            buying_intent_score += 5
            found_emotions.append("buying_interest")
            break
    
    # Check for objection patterns
    for pattern in OBJECTION_PATTERNS:
        if re.search(pattern, t):
            found_emotions.append("strong_objection")
            break

    # Check for each emotion category
    for emotion, phrases in EMOTION_KEYWORDS.items():
        for phrase in phrases:
            # Use word boundaries for better matching
            if re.search(r'\b' + re.escape(phrase) + r'\b', t):
                found_emotions.append(emotion)
                break

    # Advanced emotion prioritization for sales
    if "buying_interest" in found_emotions:
        primary = "buying_interest"
    elif "strong_objection" in found_emotions:
        primary = "strong_objection"
    elif "strong_interest" in found_emotions:
        primary = "strong_interest"
    elif "price_conscious" in found_emotions:
        primary = "price_conscious"
    elif "sarcasm" in found_emotions:
        primary = "sarcasm"
    elif "confused" in found_emotions:
        primary = "confused"
    elif "mood_swing" in found_emotions:
        primary = "mood_swing"
    elif "frustrated" in found_emotions:
        primary = "frustrated"
    elif "hesitant" in found_emotions:
        primary = "hesitant"
    elif "excited" in found_emotions:
        primary = "excited"
    elif "curious" in found_emotions:
        primary = "curious"
    elif "social_proof_seeking" in found_emotions:
        primary = "social_proof_seeking"
    else:
        primary = "neutral"

    # Tone detection (more sophisticated)
    informal_patterns = [
        r"\b(idk|lol|omg|wtf|gonna|wanna|ain't|nah|yep|yup|gimme|dunno|lemme|bro|dude|sup|hey)\b",
        r"\b(i'm|you're|it's|they're|we're|can't|won't|don't|shouldn't|couldn't|wouldn't)\b",
        r"\b(yeah|ok|cool|nice|sweet|tight|sick|fire|lit|bet|facts)\b"
    ]
    
    formal_indicators = [
        r"\b(please|thank you|could you|would you|may i|appreciate|grateful|kindly)\b",
        r"(good morning|good afternoon|good evening)",
        r"\b(sir|madam|mr|ms|mrs)\b"
    ]
    
    tone = "neutral"
    
    # Check for formal language first
    for pattern in formal_indicators:
        if re.search(pattern, t):
            tone = "formal"
            break
    
    # Override with informal if found
    for pattern in informal_patterns:
        if re.search(pattern, t):
            tone = "informal"
            break

    # Detect filler/casual usage
    fillers = ["like", "just", "well", "actually", "literally", "seriously", "basically", "kinda", "sorta"]
    uses_filler = any(f" {f} " in f" {t} " for f in fillers)

    # Urgency detection
    urgency_keywords = ["asap", "quickly", "fast", "urgent", "soon", "right now", "immediately", "today"]
    has_urgency = any(kw in t for kw in urgency_keywords)

    return {
        "primary": primary,
        "all": found_emotions,
        "tone": tone,
        "uses_filler": uses_filler,
        "buying_intent_score": buying_intent_score,
        "has_urgency": has_urgency
    }

# Updated emotion keywords for sales contexts
SALES_EMOTION_KEYWORDS = {
    "ready_to_buy": [
        "i'll take it", "i want to buy", "ready to purchase", "let's do this",
        "sign me up", "sold", "count me in", "i'm convinced", "i'll get it"
    ],
    "price_shopping": [
        "how much", "what's the price", "cost", "expensive", "affordable", 
        "budget", "cheap", "deals", "discount", "sale price", "worth it"
    ],
    "comparing": [
        "vs", "compared to", "better than", "difference between", "which one",
        "alternatives", "options", "other choices", "similar products"
    ],
    "excited_interest": [
        "love this", "perfect", "exactly what i need", "amazing", "awesome",
        "this looks great", "i like this", "impressive", "wonderful"
    ],
    "hesitant": [
        "not sure", "maybe", "thinking about it", "let me think", "hmm",
        "i don't know", "uncertain", "on the fence", "torn"
    ],
    "objection": [
        "too expensive", "don't like", "not what i want", "not interested",
        "not for me", "doesn't fit", "wrong size", "wrong color"
    ],
    "confused": [
        "confused", "don't understand", "unclear", "what do you mean",
        "explain", "huh", "i don't get it", "can you clarify"
    ],
    "trust_building": [
        "reviews", "testimonials", "guarantee", "warranty", "return policy",
        "others say", "recommendations", "trustworthy", "reliable"
    ],
    "urgency": [
        "need it now", "asap", "urgent", "quickly", "today", "right away",
        "immediately", "can't wait", "time sensitive"
    ],
    "casual_browsing": [
        "just looking", "browsing", "window shopping", "checking out",
        "seeing what's available", "not buying today"
    ]
}

BUYING_INTENT_PATTERNS = [
    r"(i want to|i need to|i'll|i will|gonna|going to).*(buy|purchase|get|order)",
    r"(how do i|where can i).*(buy|purchase|order|get)",
    r"(ready to|want to|need to).*(buy|purchase|order)",
    r"(add to cart|checkout|place order|make purchase)"
]

def detect_sales_emotion(text):
    """
    Enhanced emotion detection specifically for sales conversations
    """
    t = text.lower().strip()
    found_emotions = []
    confidence_scores = {}
    
    # Check for buying intent patterns first (highest priority)
    buying_intent_score = 0
    for pattern in BUYING_INTENT_PATTERNS:
        if re.search(pattern, t):
            buying_intent_score += 10
            found_emotions.append("ready_to_buy")
            break
    
    # Check each emotion category
    for emotion, phrases in SALES_EMOTION_KEYWORDS.items():
        score = 0
        for phrase in phrases:
            # Use word boundaries for better matching
            if re.search(r'\b' + re.escape(phrase) + r'\b', t):
                score += 5
                if emotion not in found_emotions:
                    found_emotions.append(emotion)
                break
        confidence_scores[emotion] = score
    
    # Advanced prioritization for sales context
    if "ready_to_buy" in found_emotions or buying_intent_score > 0:
        primary = "ready_to_buy"
    elif "price_shopping" in found_emotions:
        primary = "price_shopping"
    elif "objection" in found_emotions:
        primary = "objection"
    elif "excited_interest" in found_emotions:
        primary = "excited_interest"
    elif "comparing" in found_emotions:
        primary = "comparing"
    elif "trust_building" in found_emotions:
        primary = "trust_building"
    elif "urgency" in found_emotions:
        primary = "urgency"
    elif "confused" in found_emotions:
        primary = "confused"
    elif "hesitant" in found_emotions:
        primary = "hesitant"
    elif "casual_browsing" in found_emotions:
        primary = "casual_browsing"
    else:
        primary = "neutral"

    # Detect conversation tone
    formal_indicators = [
        r"\b(please|thank you|could you|would you|may i|sir|madam)\b",
        r"(good morning|good afternoon|good evening)"
    ]
    
    casual_indicators = [
        r"\b(hey|hi|sup|yo|yeah|yep|nah|ok|cool|awesome|lol|omg)\b",
        r"\b(gonna|wanna|gotta|kinda|sorta|dunno)\b"
    ]
    
    tone = "neutral"
    for pattern in formal_indicators:
        if re.search(pattern, t):
            tone = "formal"
            break
    
    for pattern in casual_indicators:
        if re.search(pattern, t):
            tone = "casual"
            break

    return {
        "primary": primary,
        "all_emotions": found_emotions,
        "tone": tone,
        "buying_intent_score": buying_intent_score,
        "confidence_scores": confidence_scores,
        "message_length": len(text.split())
    }