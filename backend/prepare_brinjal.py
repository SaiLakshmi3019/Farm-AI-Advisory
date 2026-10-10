from datasets import load_dataset
from pathlib import Path
import random

OUTPUT = Path("vegetable_dataset")
TRAIN = OUTPUT / "train"
VAL = OUTPUT / "val"

ds = load_dataset(
    "Project-AgML/eggplant_disease_classification",
    split="train"
)

class_names = ds.features["label"].names

random.seed(42)

indices = list(range(len(ds)))
random.shuffle(indices)

split_index = int(len(indices) * 0.8)

train_indices = indices[:split_index]
val_indices = indices[split_index:]

for label_id, class_name in enumerate(class_names):
    safe_name = "Brinjal_" + class_name.replace(" ", "_")

    (TRAIN / safe_name).mkdir(parents=True, exist_ok=True)
    (VAL / safe_name).mkdir(parents=True, exist_ok=True)

def save_images(indices, folder):
    counters = {}

    for i in indices:
        item = ds[i]
        image = item["image"]
        label_id = item["label"]

        class_name = "Brinjal_" + class_names[label_id].replace(" ", "_")

        counters[class_name] = counters.get(class_name, 0) + 1

        filename = f"{counters[class_name]:05d}.jpg"
        output_path = folder / class_name / filename

        image.convert("RGB").save(output_path, quality=95)

save_images(train_indices, TRAIN)
save_images(val_indices, VAL)

print("BRINJAL DATASET READY")
print("Total:", len(ds))
print("Train:", len(train_indices))
print("Val:", len(val_indices))

for class_name in class_names:
    folder_name = "Brinjal_" + class_name.replace(" ", "_")

    train_count = len(list((TRAIN / folder_name).glob("*")))
    val_count = len(list((VAL / folder_name).glob("*")))

    print(f"{folder_name}: train={train_count}, val={val_count}")