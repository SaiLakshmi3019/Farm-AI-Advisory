from pathlib import Path
import random
import shutil

SOURCE = Path("plantvillage")
OUTPUT = Path("new_dataset")

CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",

    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___healthy",
    "Corn_(maize)___Northern_Leaf_Blight",

    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___healthy",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
]

random.seed(42)

for class_name in CLASSES:
    source_dir = SOURCE / "raw" / "color" / class_name

    if not source_dir.exists():
        print(f"NOT FOUND: {source_dir}")
        continue

    images = [
        p for p in source_dir.iterdir()
        if p.suffix.lower() in [".jpg", ".jpeg", ".png"]
    ]

    random.shuffle(images)

    split_index = int(len(images) * 0.8)

    train_images = images[:split_index]
    val_images = images[split_index:]

    train_dir = OUTPUT / "train" / class_name
    val_dir = OUTPUT / "val" / class_name

    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)

    for image in train_images:
        shutil.copy2(image, train_dir / image.name)

    for image in val_images:
        shutil.copy2(image, val_dir / image.name)

    print(
        f"{class_name}: "
        f"{len(train_images)} train, "
        f"{len(val_images)} val"
    )

print("\nDONE")