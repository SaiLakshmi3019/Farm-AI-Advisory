from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

from database import create_tables
from auth import router as auth_router
from detection import router as detection_router


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

create_tables()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Farm AI Advisory System",
    description=(
        "AI-powered crop disease detection, agricultural advisory "
        "and RAG-based farmer chatbot."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# EXISTING ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(detection_router)


# ============================================================
# CHATBOT REQUEST MODEL
# ============================================================

class ChatRequest(BaseModel):
    message: str


# ============================================================
# AGRICULTURAL KNOWLEDGE BASE
# ============================================================

KNOWLEDGE_BASE = [
    {
        "topic": "Tomato Early Blight",
        "keywords": [
            "early blight",
            "tomato early blight",
            "symptoms of tomato early blight",
            "control tomato early blight",
            "brown circular spots",
        ],
        "answer": (
            "Tomato Early Blight is a fungal disease. Common symptoms "
            "include brown circular spots, especially on older leaves. "
            "Remove badly affected leaves, avoid overhead watering, "
            "improve air circulation, maintain field sanitation, and "
            "follow local agricultural guidance for suitable fungicide use."
        ),
    },
    {
        "topic": "Tomato Late Blight",
        "keywords": [
            "late blight",
            "tomato late blight",
            "control tomato late blight",
            "potato late blight",
        ],
        "answer": (
            "Late Blight can spread rapidly under cool and wet conditions. "
            "Symptoms may include dark or water-soaked lesions. Remove "
            "severely affected plant material, improve air circulation, "
            "avoid prolonged leaf wetness, and follow local agricultural "
            "recommendations for disease control."
        ),
    },
    {
        "topic": "Tomato Diseases",
        "keywords": [
            "tomato diseases",
            "common tomato diseases",
            "tomato disease",
            "diseased tomato",
        ],
        "answer": (
            "Common tomato problems include Early Blight, Late Blight, "
            "Bacterial Spot, Leaf Mold, Septoria Leaf Spot, Spider Mites "
            "and viral diseases. For better identification, inspect the "
            "leaves, stem and fruit, and upload a clear crop image to the "
            "Crop Detection module."
        ),
    },
    {
        "topic": "Brown Spots",
        "keywords": [
            "brown spots",
            "brown spots on tomato leaves",
            "brown spot on leaves",
            "spots on tomato leaves",
        ],
        "answer": (
            "Brown spots on tomato leaves may be associated with Early "
            "Blight or other leaf-spot diseases. Check the shape and "
            "pattern of the spots, inspect both sides of the leaf, "
            "remove badly affected leaves, and avoid overhead irrigation."
        ),
    },
    {
        "topic": "Disease Prevention",
        "keywords": [
            "prevent crop diseases",
            "prevent diseases",
            "disease prevention",
            "protect crop from diseases",
            "prevent crop disease",
        ],
        "answer": (
            "To reduce crop disease risk, use healthy planting material, "
            "maintain proper plant spacing, avoid excessive leaf wetness, "
            "remove infected plant material, maintain field sanitation, "
            "and monitor crops regularly."
        ),
    },
    {
        "topic": "Pest Management",
        "keywords": [
            "pest",
            "pests",
            "pest control",
            "control pests",
            "manage pests",
            "manage pest",
            "insects on plants",
        ],
        "answer": (
            "For pest management, first identify the insect correctly. "
            "Inspect both sides of leaves and young shoots, monitor pest "
            "levels, remove heavily affected plant parts when practical, "
            "encourage beneficial insects, and use integrated pest "
            "management practices."
        ),
    },
    {
        "topic": "Aphids",
        "keywords": [
            "aphids",
            "aphid",
            "manage aphids",
            "control aphids",
        ],
        "answer": (
            "Aphids are small sap-sucking insects that often attack young "
            "leaves and shoots. Inspect new growth regularly, remove "
            "heavily infested parts when practical, encourage natural "
            "predators, and use locally recommended control measures "
            "when necessary."
        ),
    },
    {
        "topic": "Mites",
        "keywords": [
            "mites",
            "mite",
            "manage mites",
            "control mites",
            "spider mites",
        ],
        "answer": (
            "Mites can cause yellowing, stippling and leaf damage, "
            "especially during hot and dry conditions. Inspect the "
            "underside of leaves, maintain suitable irrigation, and "
            "use locally recommended control measures when infestation "
            "is confirmed."
        ),
    },
    {
        "topic": "Integrated Pest Management",
        "keywords": [
            "integrated pest management",
            "ipm",
            "natural pest control",
        ],
        "answer": (
            "Integrated Pest Management combines correct pest "
            "identification, crop monitoring, cultural practices, "
            "biological control, physical control, and careful pesticide "
            "use only when necessary."
        ),
    },
    {
        "topic": "Irrigation",
        "keywords": [
            "irrigation",
            "watering",
            "water my crops",
            "how often should i water",
            "how much water",
            "best time to irrigate",
        ],
        "answer": (
            "Water requirements depend on crop type, soil type, weather, "
            "rainfall and growth stage. Maintain suitable soil moisture "
            "and avoid both severe dryness and waterlogging. Check soil "
            "moisture before irrigation."
        ),
    },
    {
        "topic": "Overwatering",
        "keywords": [
            "overwatering",
            "over watering",
            "prevent overwatering",
            "too much water",
        ],
        "answer": (
            "Overwatering may cause yellow leaves, poor root health and "
            "waterlogging. Check soil moisture before irrigation and "
            "ensure proper drainage so excess water can leave the root zone."
        ),
    },
    {
        "topic": "Water Stress",
        "keywords": [
            "water stress",
            "signs of water stress",
            "water stress symptoms",
        ],
        "answer": (
            "Water stress may cause wilting, leaf curling, poor growth "
            "or leaf discoloration. Check soil moisture and irrigation "
            "frequency and adjust watering according to crop requirements "
            "and weather conditions."
        ),
    },
    {
        "topic": "Fertilizer",
        "keywords": [
            "fertilizer",
            "fertiliser",
            "suitable fertilizer",
            "which fertilizer",
            "apply fertilizer",
            "when should i apply fertilizer",
        ],
        "answer": (
            "Fertilizer requirements depend on crop type, soil condition "
            "and growth stage. Use soil testing where possible and apply "
            "nutrients according to crop recommendations instead of "
            "applying excessive fertilizer."
        ),
    },
    {
        "topic": "NPK",
        "keywords": [
            "npk",
            "npk fertilizer",
            "what is npk",
        ],
        "answer": (
            "NPK stands for Nitrogen, Phosphorus and Potassium. These "
            "nutrients support different aspects of plant growth. The "
            "correct NPK ratio and application rate depend on the crop "
            "and soil condition."
        ),
    },
    {
        "topic": "Yellow Leaves",
        "keywords": [
            "yellow leaves",
            "leaves turning yellow",
            "why are my leaves turning yellow",
            "yellow leaf",
        ],
        "answer": (
            "Yellow leaves can result from nutrient deficiency, "
            "overwatering, underwatering, root problems or disease. "
            "Check soil moisture, inspect the leaves and roots, and "
            "consider soil testing before applying fertilizer."
        ),
    },
    {
        "topic": "Soil Nutrients",
        "keywords": [
            "soil nutrients",
            "improve soil nutrients",
            "soil health",
            "healthy soil",
            "improve soil",
        ],
        "answer": (
            "Healthy soil supports strong crop growth. Maintain organic "
            "matter, avoid unnecessary chemical inputs, provide balanced "
            "nutrients, maintain suitable soil moisture, and prevent "
            "waterlogging. Soil testing can help identify nutrient needs."
        ),
    },
]


# ============================================================
# RAG RETRIEVAL
# ============================================================

def retrieve_documents(query: str):
    query = query.lower().strip()

    scored_documents = []

    query_words = set(
        re.findall(r"[a-zA-Z0-9]+", query)
    )

    for document in KNOWLEDGE_BASE:
        score = 0

        # Exact keyword matching
        for keyword in document["keywords"]:
            keyword_lower = keyword.lower()

            if keyword_lower in query:
                score += 10

        # Individual word matching
        searchable_text = " ".join(
            [
                document["topic"],
                *document["keywords"],
            ]
        ).lower()

        document_words = set(
            re.findall(
                r"[a-zA-Z0-9]+",
                searchable_text
            )
        )

        score += len(
            query_words.intersection(document_words)
        )

        if score > 0:
            scored_documents.append(
                (score, document)
            )

    scored_documents.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [
        document
        for _, document in scored_documents[:3]
    ]


# ============================================================
# CHATBOT ENDPOINT
# ============================================================

@app.post("/chat")
@app.post("/chat/")
def chat(request: ChatRequest):

    question = request.message.strip()

    if not question:
        return {
            "answer": "Please enter a farming question.",
            "sources": [],
        }

    documents = retrieve_documents(question)

    if documents:

        primary_document = documents[0]

        answer = primary_document["answer"]

        sources = [
            document["topic"]
            for document in documents
        ]

        return {
            "answer": answer,
            "sources": sources,
        }

    # General tomato fallback
    if "tomato" in question.lower():

        return {
            "answer": (
                "Tomato crops can have problems such as Early Blight, "
                "Late Blight, Bacterial Spot, Leaf Mold, Septoria Leaf "
                "Spot, Spider Mites and viral diseases. Upload a clear "
                "tomato image in Crop Detection for more specific analysis."
            ),
            "sources": ["Tomato crop knowledge"],
        }

    # General fallback
    return {
        "answer": (
            "I could not find a matching topic in the current "
            "agricultural knowledge base. Try asking about tomato "
            "disease, early blight, late blight, pests, aphids, "
            "mites, irrigation, water stress, fertilizer, NPK, "
            "yellow leaves or soil."
        ),
        "sources": [],
    }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Farm AI Advisory System is running!"
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }