from transformers import pipeline
from pathlib import Path

MODEL_NAME = "Kathir56/plant-disease-tamilnadu"

IMAGE_DIR = Path("backend") / "uploads" / "crops"

print("Loading multi-crop AI model...")

classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)

# Find uploaded images
image_files = []

for extension in ["*.jpg", "*.jpeg", "*.png", "*.webp"]:
    image_files.extend(
        IMAGE_DIR.glob(extension)
    )

if not image_files:
    print()
    print("ERROR: No uploaded images found.")
    print("Upload one leaf image through the website first.")
    raise SystemExit(1)

# Most recently uploaded image
image_path = max(
    image_files,
    key=lambda file: file.stat().st_mtime
)

print("Analyzing:")
print(image_path)

results = classifier(
    str(image_path),
    top_k=5
)

print()
print("Prediction Results")
print("=" * 50)

for item in results:
    print(
        f"{item['label']} : "
        f"{item['score'] * 100:.2f}%"
    )