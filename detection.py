from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database import get_connection
from transformers import pipeline
from PIL import Image, ImageOps

from pathlib import Path
import os
import uuid


router = APIRouter(
    prefix="/detection",
    tags=["Crop Detection"]
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads" / "crops"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# AI MODEL
# ============================================================

MODEL_NAME = "Kathir56/plant-disease-tamilnadu"

print("Loading multi-crop disease model...")

classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)

print("Multi-crop disease model loaded successfully.")


# ============================================================
# AI SETTINGS
# ============================================================

# The model must be reasonably confident before we accept it.
CONFIDENCE_THRESHOLD = 0.45

# Difference between top prediction and second prediction.
MARGIN_THRESHOLD = 0.08

# Original + horizontally flipped image should agree.
REQUIRE_CONSISTENCY = True


# ============================================================
# DISPLAY NAME HELPERS
# ============================================================

def clean_crop_name(raw_crop: str):

    name = raw_crop.strip()

    replacements = {
        "Pepper,_bell": "Bell Pepper",
        "Corn_(maize)": "Corn",
        "Cherry_(including_sour)": "Cherry",
        "Apple": "Apple",
        "Blueberry": "Blueberry",
        "Grape": "Grape",
        "Orange": "Orange",
        "Peach": "Peach",
        "Potato": "Potato",
        "Raspberry": "Raspberry",
        "Soybean": "Soybean",
        "Squash": "Squash",
        "Strawberry": "Strawberry",
        "Tomato": "Tomato",
        "Corn": "Corn",
    }

    return replacements.get(
        name,
        name.replace("_", " ")
    )


def clean_disease_name(raw_disease: str):

    disease = raw_disease.strip()

    disease = disease.replace("_", " ")
    disease = disease.replace(",", " ")

    # Remove multiple spaces
    disease = " ".join(
        disease.split()
    )

    if disease.lower() == "healthy":
        return "Healthy"

    # Friendly display names
    replacements = {
        "early blight": "Early Blight",
        "late blight": "Late Blight",
        "bacterial spot": "Bacterial Spot",
        "black rot": "Black Rot",
        "powdery mildew": "Powdery Mildew",
        "leaf scorch": "Leaf Scorch",
        "leaf mold": "Leaf Mold",
        "septoria leaf spot": "Septoria Leaf Spot",
        "spider mites": "Spider Mites",
        "target spot": "Target Spot",
        "tomato mosaic virus": "Tomato Mosaic Virus",
        "tomato yellow leaf curl virus":
            "Tomato Yellow Leaf Curl Virus",
        "common rust": "Common Rust",
        "northern leaf blight":
            "Northern Leaf Blight",
        "cercospora leaf spot gray leaf spot":
            "Cercospora Leaf Spot / Gray Leaf Spot",
        "esca black measles":
            "Esca / Black Measles",
        "isariopsis leaf spot":
            "Isariopsis Leaf Spot",
        "haunglongbing citrus greening":
            "Citrus Greening",
        "scab": "Scab",
        "rust": "Rust",
        "leaf blight": "Leaf Blight",
    }

    lower = disease.lower()

    return replacements.get(
        lower,
        disease.title()
    )


# ============================================================
# RESULT PARSER
# ============================================================

def parse_prediction_label(label: str):

    if "___" in label:

        raw_crop, raw_disease = label.split(
            "___",
            1
        )

    else:

        raw_crop = label
        raw_disease = "Unknown condition"


    crop = clean_crop_name(
        raw_crop
    )

    disease = clean_disease_name(
        raw_disease
    )

    return crop, disease


# ============================================================
# SEVERITY
# ============================================================

def get_severity(disease: str):

    disease_lower = disease.lower()

    if disease == "Healthy":
        return "Low"

    high_keywords = [
        "late blight",
        "black rot",
        "bacterial canker",
        "citrus greening",
        "mosaic virus",
        "yellow leaf curl",
        "esca",
    ]

    for keyword in high_keywords:

        if keyword in disease_lower:
            return "High"


    medium_keywords = [
        "early blight",
        "bacterial spot",
        "powdery mildew",
        "leaf mold",
        "leaf scorch",
        "septoria",
        "rust",
        "target spot",
        "leaf spot",
        "gray leaf",
        "scab",
    ]

    for keyword in medium_keywords:

        if keyword in disease_lower:
            return "Medium"


    return "Medium"


# ============================================================
# RECOMMENDATIONS
# ============================================================

def get_recommendation(
    crop: str,
    disease: str
):

    if disease == "Healthy":

        return (
            f"{crop} leaf appears healthy. Continue balanced "
            "irrigation, appropriate nutrition, field sanitation "
            "and regular crop monitoring."
        )


    recommendations = {

        "Early Blight": (
            "Remove severely affected leaves, avoid prolonged "
            "leaf wetness, improve air circulation and follow "
            "local agricultural guidance for suitable disease "
            "control."
        ),

        "Late Blight": (
            "Remove severely affected plant material, reduce "
            "prolonged leaf wetness, improve airflow and follow "
            "local agricultural guidance for disease management."
        ),

        "Bacterial Spot": (
            "Remove severely affected material, maintain field "
            "sanitation, avoid handling wet plants and use healthy "
            "planting material."
        ),

        "Black Rot": (
            "Remove affected plant material, maintain good field "
            "sanitation, improve airflow and follow locally "
            "recommended disease-management practices."
        ),

        "Powdery Mildew": (
            "Improve airflow, avoid excessive humidity around "
            "the foliage, remove severely affected leaves and "
            "follow local agricultural guidance for control."
        ),

        "Leaf Scorch": (
            "Check irrigation and environmental stress, maintain "
            "appropriate soil moisture and remove severely "
            "damaged material where appropriate."
        ),

        "Leaf Mold": (
            "Improve ventilation, reduce prolonged leaf moisture "
            "and remove severely affected leaves."
        ),

        "Septoria Leaf Spot": (
            "Remove affected leaves, maintain field sanitation, "
            "avoid overhead watering and improve air circulation."
        ),

        "Spider Mites": (
            "Inspect the underside of leaves, maintain suitable "
            "plant moisture and follow locally recommended "
            "integrated pest-management practices."
        ),

        "Target Spot": (
            "Remove severely infected leaves, maintain field "
            "sanitation and reduce prolonged leaf wetness."
        ),

        "Tomato Mosaic Virus": (
            "Remove severely infected plants where appropriate, "
            "sanitize tools and use healthy planting material."
        ),

        "Tomato Yellow Leaf Curl Virus": (
            "Monitor whitefly populations, remove severely "
            "affected plants where appropriate and follow local "
            "crop-protection guidance."
        ),

        "Common Rust": (
            "Remove severely affected leaves where appropriate, "
            "maintain good airflow and follow locally recommended "
            "fungicide guidance."
        ),

        "Northern Leaf Blight": (
            "Remove heavily affected plant material where "
            "appropriate, reduce prolonged leaf wetness and "
            "follow local crop-protection guidance."
        ),

        "Cercospora Leaf Spot / Gray Leaf Spot": (
            "Remove severely affected leaves, maintain field "
            "sanitation, improve airflow and follow local crop "
            "protection guidance."
        ),

        "Rust": (
            "Monitor the crop regularly, remove severely affected "
            "material where appropriate, improve airflow and "
            "follow local disease-management guidance."
        ),

        "Scab": (
            "Maintain field sanitation, remove affected material "
            "where appropriate and follow locally recommended "
            "disease-control practices."
        ),
    }


    return recommendations.get(
        disease,
        (
            f"The image indicates {disease} on {crop}. "
            "Monitor the crop carefully, remove severely affected "
            "material where appropriate, maintain field sanitation "
            "and follow local agricultural guidance."
        )
    )


# ============================================================
# FULL PROBABILITY PREDICTION
# ============================================================

def get_all_predictions(image):

    results = classifier(
        image,
        top_k=None
    )

    # Transformers normally returns a list.
    if not isinstance(results, list):

        raise RuntimeError(
            "Unexpected classification output."
        )

    cleaned = []

    for item in results:

        cleaned.append({
            "label": item["label"],
            "score": float(item["score"])
        })

    cleaned.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return cleaned


# ============================================================
# CONSISTENT PREDICTION
# ============================================================

def analyze_image(image):

    # Original image
    original_predictions = (
        get_all_predictions(image)
    )

    # Horizontally flipped image
    flipped = ImageOps.mirror(
        image
    )

    flipped_predictions = (
        get_all_predictions(flipped)
    )


    original_map = {
        item["label"]: item["score"]
        for item in original_predictions
    }

    flipped_map = {
        item["label"]: item["score"]
        for item in flipped_predictions
    }


    # --------------------------------------------------------
    # Average confidence across original + flipped
    # --------------------------------------------------------

    labels = set(
        original_map.keys()
    ) | set(
        flipped_map.keys()
    )

    averaged = []

    for label in labels:

        score_original = (
            original_map.get(label, 0.0)
        )

        score_flipped = (
            flipped_map.get(label, 0.0)
        )

        average_score = (
            score_original
            + score_flipped
        ) / 2.0

        averaged.append({
            "label": label,
            "score": average_score
        })


    averaged.sort(
        key=lambda x: x["score"],
        reverse=True
    )


    if not averaged:

        raise RuntimeError(
            "No prediction was returned."
        )


    top1 = averaged[0]

    if len(averaged) > 1:
        top2 = averaged[1]

    else:
        top2 = {
            "label": "",
            "score": 0.0
        }


    confidence = float(
        top1["score"]
    )

    second_confidence = float(
        top2["score"]
    )

    margin = (
        confidence
        - second_confidence
    )


    # --------------------------------------------------------
    # Consistency check
    # --------------------------------------------------------

    original_top = (
        original_predictions[0]["label"]
    )

    flipped_top = (
        flipped_predictions[0]["label"]
    )

    consistent = (
        original_top
        == flipped_top
    )


    return {
        "label": top1["label"],
        "confidence": confidence,
        "second_confidence":
            second_confidence,
        "margin": margin,
        "consistent": consistent,
        "top5": averaged[:5],
    }


# ============================================================
# ANALYZE ENDPOINT
# ============================================================

@router.post("/analyze")
async def analyze_crop(
    farmer_id: int = Form(...),
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # FILE VALIDATION
    # --------------------------------------------------------

    if not file.content_type:

        raise HTTPException(
            status_code=400,
            detail="File type could not be determined."
        )


    if not file.content_type.startswith(
        "image/"
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )


    extension = os.path.splitext(
        file.filename or ""
    )[1]


    if not extension:

        extension = ".jpg"


    filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR / filename
    )


    image_data = await file.read()


    if not image_data:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )


    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            image_data
        )


    # --------------------------------------------------------
    # IMAGE OPEN
    # --------------------------------------------------------

    try:

        image = Image.open(
            file_path
        ).convert("RGB")

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image."
        )


    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    try:

        prediction = analyze_image(
            image
        )


        label = prediction["label"]

        confidence = prediction[
            "confidence"
        ]

        second_confidence = prediction[
            "second_confidence"
        ]

        margin = prediction[
            "margin"
        ]

        consistent = prediction[
            "consistent"
        ]


        # ----------------------------------------------------
        # ACCEPT / REJECT
        # ----------------------------------------------------

        confidence_is_low = (
            confidence
            < CONFIDENCE_THRESHOLD
        )

        margin_is_low = (
            margin
            < MARGIN_THRESHOLD
        )

        consistency_failed = (
            REQUIRE_CONSISTENCY
            and not consistent
        )


        if (
            confidence_is_low
            or margin_is_low
            or consistency_failed
        ):

            crop_type = (
                "Unknown / Unsupported"
            )

            disease = (
                "Could not confidently identify"
            )

            severity = "Unknown"

            recommendation = (
                "The AI could not confidently identify "
                "this leaf from the supported crop and "
                "disease classes. Please upload a clear "
                "leaf image with good lighting and minimal "
                "background."
            )

        else:

            crop_type, disease = (
                parse_prediction_label(
                    label
                )
            )

            severity = get_severity(
                disease
            )

            recommendation = (
                get_recommendation(
                    crop_type,
                    disease
                )
            )


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}"
        )


    # --------------------------------------------------------
    # DATABASE
    # --------------------------------------------------------

    connection = get_connection()

    try:

        cursor = connection.execute(
            """
            INSERT INTO detections
            (
                farmer_id,
                image_name,
                crop_type,
                disease,
                pest,
                weed,
                confidence,
                severity,
                recommendation
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                farmer_id,
                filename,
                crop_type,
                disease,
                "Not specifically detected",
                "Not specifically detected",
                confidence,
                severity,
                recommendation
            )
        )

        connection.commit()

        detection_id = (
            cursor.lastrowid
        )

    finally:

        connection.close()


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "detection_id":
            detection_id,

        "image_name":
            filename,

        "crop_type":
            crop_type,

        "disease":
            disease,

        "pest":
            "Not specifically detected",

        "weed":
            "Not specifically detected",

        "confidence":
            round(
                confidence,
                4
            ),

        "severity":
            severity,

        "recommendation":
            recommendation,

        "model_class":
            label,

        "second_confidence":
            round(
                second_confidence,
                4
            ),

        "prediction_margin":
            round(
                margin,
                4
            ),

        "prediction_consistent":
            consistent,

        "top_predictions":
            prediction["top5"],
    }


# ============================================================
# HISTORY
# ============================================================

@router.get("/history/{farmer_id}")
def get_history(
    farmer_id: int
):

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            SELECT
                id,
                image_name,
                crop_type,
                disease,
                pest,
                weed,
                confidence,
                severity,
                recommendation,
                created_at
            FROM detections
            WHERE farmer_id = ?
            ORDER BY id DESC
            """,
            (farmer_id,)
        ).fetchall()


        return [
            dict(row)
            for row in rows
        ]

    finally:

        connection.close()