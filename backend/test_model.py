from transformers import pipeline
from PIL import Image
from pathlib import Path

MODEL_NAME = "Kathir56/plant-disease-tamilnadu"

print("Loading AI model...")
classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)

folder = Path("test_images")

images = list(folder.glob("*.jpg"))
images += list(folder.glob("*.jpeg"))
images += list(folder.glob("*.png"))

if not images:
    print("No images found in test_images folder.")
    exit()

print(f"\nFound {len(images)} images.\n")

for image_path in images:
    print("=" * 60)
    print("IMAGE:", image_path.name)

    try:
        image = Image.open(image_path).convert("RGB")

        results = classifier(image, top_k=5)

        for i, result in enumerate(results, 1):
            label = result["label"]
            confidence = result["score"] * 100

            print(
                f"{i}. {label} -> {confidence:.2f}%"
            )

    except Exception as e:
        print("ERROR:", e)

print("\nTesting completed.")