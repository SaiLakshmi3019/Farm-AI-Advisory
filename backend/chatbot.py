from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["RAG Chatbot"])


class ChatRequest(BaseModel):
    message: str


KNOWLEDGE = {
    "early blight": (
        "Tomato Early Blight is a fungal disease that causes brown "
        "spots on leaves. Remove badly affected leaves, avoid overhead "
        "watering, improve air circulation, and follow local fungicide guidance."
    ),
    "late blight": (
        "Late Blight can spread rapidly in cool and wet conditions. "
        "Remove severely affected plant material, avoid prolonged leaf wetness, "
        "and follow local agricultural recommendations."
    ),
    "pest": (
        "For pest management, identify the insect first, inspect the "
        "underside of leaves, monitor pest levels, and use integrated pest "
        "management practices."
    ),
    "irrigation": (
        "Water requirements depend on crop, soil, weather, and growth stage. "
        "Maintain suitable soil moisture and avoid both waterlogging and severe dryness."
    ),
    "fertilizer": (
        "Fertilizer requirements depend on the crop and soil condition. "
        "Use soil testing where possible and apply nutrients according to crop needs."
    ),
}


@router.post("/")
def chat(request: ChatRequest):
    question = request.message.lower().strip()

    if not question:
        return {
            "answer": "Please enter a farming question.",
            "sources": []
        }

    for keyword, answer in KNOWLEDGE.items():
        if keyword in question:
            return {
                "answer": answer,
                "sources": [keyword]
            }

    if "tomato" in question and "disease" in question:
        return {
            "answer": (
                "Common tomato problems include Early Blight, Late Blight, "
                "Bacterial Spot, Leaf Mold, and viral diseases. "
                "Upload a clear crop image in Crop Detection for further analysis."
            ),
            "sources": ["tomato disease knowledge"]
        }

    return {
        "answer": (
            "I could not find a matching topic in the agricultural knowledge base. "
            "Try asking about early blight, late blight, pests, irrigation, or fertilizer."
        ),
        "sources": []
    }
