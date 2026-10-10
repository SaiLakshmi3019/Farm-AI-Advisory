from io import BytesIO
from pathlib import Path
import sqlite3
import uuid

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

from database import get_connection

router = APIRouter(prefix="/detection", tags=["Crop Detection"])

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = (
    BASE_DIR / "runs" / "classify" / "final-farm-disease"
    / "weights" / "best.pt"
)

MAX_FILE_SIZE = 10 * 1024 * 1024
MIN_IMAGE_SIZE = 160

_model = None

# Supported classes from the existing 27-class model.
def normalize_label(label):
    label = str(label).strip()

    if "___" in label:
        crop, condition = label.split("___", 1)
    else:
        crop, separator, condition = label.partition("_")
        if not separator:
            condition = "unknown"

    crop = crop.replace("__", " ").replace("_", " ").strip()
    crop = " ".join(crop.split())

    # Pepper class labels contain an extra underscore.
    if crop.lower() in ("pepper bell", "pepper"):
        crop = "Pepper"

    condition = condition.replace("_", " ").strip()
    condition = " ".join(condition.split())

    if condition.lower() == "healthy":
        disease = "Healthy"
    else:
        disease = condition.replace("  ", " ").strip()

    return crop, disease


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(
                f"Model file not found: {MODEL_PATH}"
            )

        _model = YOLO(str(MODEL_PATH))

        if not getattr(_model, "names", None):
            raise RuntimeError("The model has no class names.")

    return _model


def get_advice(crop, disease):
    if disease.lower() == "healthy":
        return (
            f"{crop} appears healthy. Continue regular watering, "
            "balanced nutrition, field monitoring, and preventive care."
        )

    name = disease.lower()

    if "early blight" in name:
        return (
            "Remove badly affected leaves, avoid wetting foliage, "
            "improve airflow, and seek locally approved treatment advice."
        )

    if "late blight" in name:
        return (
            "Inspect nearby plants, avoid overhead irrigation, remove "
            "severely affected material safely, and consult an agricultural "
            "officer about locally approved treatment."
        )

    if "rust" in name:
        return (
            "Monitor nearby leaves, remove heavily affected plant material "
            "where appropriate, and ask an agricultural officer for "
            "crop-specific management advice."
        )

    if "bacterial" in name:
        return (
            "Avoid handling wet plants, sanitize tools, remove severely "
            "affected material where appropriate, and obtain local "
            "agricultural advice before treatment."
        )

    if "virus" in name or "mosaic" in name or "curl" in name:
        return (
            "Check for insect vectors and nearby symptomatic plants. "
            "Remove severely affected plants only when advised, and "
            "consult an agricultural officer about management."
        )

    if "spider mite" in name:
        return (
            "Inspect the undersides of leaves for mites and webbing. "
            "Monitor the infestation and seek locally approved control "
            "advice before applying any pesticide."
        )

    if "leaf mold" in name or "leaf spot" in name or "leaf blight" in name:
        return (
            "Remove severely affected leaves when appropriate, improve "
            "air circulation, avoid prolonged leaf wetness, and obtain "
            "crop-specific treatment advice."
        )

    if "scab" in name or "black rot" in name or "esca" in name:
        return (
            "Inspect the plant and nearby plants for symptoms. Remove "
            "affected material where appropriate and consult a local "
            "agricultural expert for crop-specific management."
        )

    return (
        "Monitor the crop and nearby plants, maintain good field hygiene, "
        "and confirm the diagnosis with a local agricultural expert before "
        "using any treatment."
    )


def get_severity(confidence, disease):
    if disease.lower() == "healthy":
        return "Low"

    # This is a confidence-based display estimate, not a measurement
    # of actual disease severity in the field.
    if confidence >= 0.85:
        return "High"
    if confidence >= 0.60:
        return "Medium"
    return "Low"


def save_detection(
    farmer_id,
    image_name,
    crop_type,
    disease,
    confidence,
    severity,
    recommendation,
):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
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
                image_name,
                crop_type,
                disease,
                None,
                None,
                float(confidence),
                severity,
                recommendation,
            ),
        )

        connection.commit()

        try:
            detection_id = cursor.lastrowid
        except Exception:
            detection_id = None

        return detection_id

    except (sqlite3.Error, Exception) as exc:
        if connection is not None:
            try:
                connection.rollback()
            except Exception:
                pass

        # Detection results can still be returned if database saving fails.
        print(f"Could not save detection to database: {exc}")
        return None

    finally:
        if connection is not None:
            connection.close()


@router.get("/model-info")
def model_info():
    try:
        model = get_model()
        names = model.names

        if isinstance(names, dict):
            classes = [str(names[k]) for k in sorted(names)]
        else:
            classes = [str(name) for name in names]

        crops = sorted({
            normalize_label(label)[0] for label in classes
        })

        return {
            "success": True,
            "model": MODEL_PATH.name,
            "class_count": len(classes),
            "supported_crops": crops,
            "classes": classes,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load model: {exc}",
        )


@router.post("/analyze")
async def analyze_crop(
    file: UploadFile = File(...),
    farmer_id: int = Form(1),
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPG, PNG, or WEBP crop image.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image size must be 10 MB or less.",
        )

    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid image. Please upload a valid crop photo.",
        )
    finally:
        await file.close()

    width, height = image.size

    if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be at least 160 x 160 pixels.",
        )

    try:
        model = get_model()

        results = model.predict(
            source=image,
            imgsz=224,
            device="cpu",
            verbose=False,
        )

        if not results:
            raise RuntimeError("The model returned no predictions.")

        result = results[0]

        if result.probs is None:
            raise RuntimeError(
                "The selected model is not a classification model."
            )

        top_index = int(result.probs.top1)
        confidence = float(result.probs.top1conf.item())

        names = model.names
        if isinstance(names, dict):
            raw_label = names[top_index]
        else:
            raw_label = names[top_index]

        crop_type, disease = normalize_label(raw_label)

        severity = get_severity(confidence, disease)
        recommendation = get_advice(crop_type, disease)

        detection_id = save_detection(
            farmer_id=farmer_id,
            image_name=file.filename or "crop_image",
            crop_type=crop_type,
            disease=disease,
            confidence=confidence,
            severity=severity,
            recommendation=recommendation,
        )

        return {
            "success": True,
            "message": "Crop image analyzed successfully.",
            "detection_id": detection_id,
            "crop_type": crop_type,
            "disease": disease,
            "pest": None,
            "weed": None,
            "confidence": round(confidence * 100, 2),
            "confidence_score": round(confidence, 4),
            "severity": severity,
            "recommendation": recommendation,
            "image_name": file.filename or "crop_image",
            "model_class": str(raw_label),
            "note": (
                "This is an AI image-classification result. "
                "Confidence is not the same as disease severity. "
                "Confirm important diagnoses with an agricultural expert."
            ),
        }

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Crop analysis error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Crop analysis failed: {exc}",
        )


@router.get("/history/{farmer_id}")
def detection_history(farmer_id: int):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        rows = cursor.execute(
            """
            SELECT *
            FROM detections
            WHERE farmer_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 50
            """,
            (farmer_id,),
        ).fetchall()

        return {
            "success": True,
            "history": [dict(row) for row in rows],
        }

    except Exception as exc:
        print(f"Detection history error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Could not load detection history: {exc}",
        )

    finally:
        if connection is not None:
            connection.close()
