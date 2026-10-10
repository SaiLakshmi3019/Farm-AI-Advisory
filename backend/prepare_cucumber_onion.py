from datasets import load_dataset
from pathlib import Path
import random

OUTPUT = Path("vegetable_dataset")
TRAIN = OUTPUT / "train"
VAL = OUTPUT / "val"

random.seed(42)


def prepare_dataset(dataset_name, crop_name):
    print(f"\nLoading {crop_name} dataset...")

    ds = load_dataset(dataset_name, split="train")
    class_names = ds.features["label"].names

    indices = list(range(len(ds)))
    random.shuffle(indices)

    split_index = int(len(indices) * 0.8)

    train_indices = indices[:split_index]
    val_indices = indices[split_index:]

    for label_id, class_name in enumerate(class_names):
        safe_name = (
            crop_name + "_" +
            class_name.replace(" ", "_")
            .replace("/", "_")
        )

        (TRAIN / safe_name).mkdir(parents=True, exist_ok=True)
        (VAL / safe_name).mkdir(parents=True, exist_ok=True)

    def save_images(indices, folder):
        counters = {}

        for i in indices:
            item = ds[i]

            image = item["image"]
            label_id = item["label"]

            safe_name = (
                crop_name + "_" +
                class_names[label_id]
                .replace(" ", "_")
                .replace("/", "_")
            )

            counters[safe_name] = counters.get(safe_name, 0) + 1

            filename = f"{counters[safe_name]:05d}.jpg"

            output_path = folder / safe_name / filename

            image.convert("RGB").save(
                output_path,
                quality=95
            )

    save_images(train_indices, TRAIN)
    save_images(val_indices, VAL)

    print(f"\n{crop_name} READY")
    print("Total:", len(ds))
    print("Train:", len(train_indices))
    print("Val:", len(val_indices))

    for class_name in class_names:

        folder_name = (
            crop_name + "_" +
            class_name.replace(" ", "_")
            .replace("/", "_")
        )

        train_count = len(
            list((TRAIN / folder_name).glob("*"))
        )

        val_count = len(
            list((VAL / folder_name).glob("*"))
        )

        print(
            f"{folder_name}: "
            f"train={train_count}, "
            f"val={val_count}"
        )


# CUCUMBER
prepare_dataset(
    "Project-AgML/cucumber_disease_classification",
    "Cucumber"
)


# ONION
prepare_dataset(
    "Project-AgML/COLD_onion_leaf_disease_classification",
    "Onion"
)

print("\n================================")
print("CUCUMBER + ONION DATASETS READY")
print("================================")