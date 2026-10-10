from pathlib import Path
import random
import shutil


BASE = Path(__file__).resolve().parent

SOURCE_TRAIN = BASE / "dataset" / "train"
SOURCE_VAL = BASE / "dataset" / "val"

OUTPUT = BASE / "crop_gate_dataset"

OTHER_SOURCE = BASE / "gate_other"


random.seed(42)


# Remove old gate dataset
if OUTPUT.exists():
    shutil.rmtree(OUTPUT)


for split in ["train", "val"]:
    for crop in ["Tomato", "Potato", "Pepper", "Other"]:
        (OUTPUT / split / crop).mkdir(
            parents=True,
            exist_ok=True
        )


def collect_crop_images(source_dir, prefix):
    files = []

    for class_dir in source_dir.iterdir():

        if not class_dir.is_dir():
            continue

        if class_dir.name.lower().startswith(
            prefix.lower()
        ):

            for file in class_dir.rglob("*"):

                if file.suffix.lower() in {
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp"
                }:

                    files.append(file)

    return files


# ---------------------------------------------------------
# TARGET CROPS
# ---------------------------------------------------------

for crop in ["Tomato", "Potato", "Pepper"]:

    train_files = collect_crop_images(
        SOURCE_TRAIN,
        crop
    )

    val_files = collect_crop_images(
        SOURCE_VAL,
        crop
    )

    random.shuffle(train_files)
    random.shuffle(val_files)

    # Keep gate model small and fast
    train_files = train_files[:600]
    val_files = val_files[:150]

    print(
        f"{crop}: "
        f"{len(train_files)} train, "
        f"{len(val_files)} val"
    )

    for index, file in enumerate(train_files):

        destination = (
            OUTPUT
            / "train"
            / crop
            / f"{crop}_{index}{file.suffix.lower()}"
        )

        shutil.copy2(
            file,
            destination
        )

    for index, file in enumerate(val_files):

        destination = (
            OUTPUT
            / "val"
            / crop
            / f"{crop}_{index}{file.suffix.lower()}"
        )

        shutil.copy2(
            file,
            destination
        )


# ---------------------------------------------------------
# OTHER
# ---------------------------------------------------------

other_files = []

for file in OTHER_SOURCE.rglob("*"):

    if file.suffix.lower() in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }:

        other_files.append(file)


random.shuffle(other_files)

# Use up to 600 Other images
train_other = other_files[:500]
val_other = other_files[500:650]

print(
    f"Other: "
    f"{len(train_other)} train, "
    f"{len(val_other)} val"
)


for index, file in enumerate(train_other):

    destination = (
        OUTPUT
        / "train"
        / "Other"
        / f"other_{index}{file.suffix.lower()}"
    )

    shutil.copy2(
        file,
        destination
    )


for index, file in enumerate(val_other):

    destination = (
        OUTPUT
        / "val"
        / "Other"
        / f"other_{index}{file.suffix.lower()}"
    )

    shutil.copy2(
        file,
        destination
    )


print()
print("===================================")
print("Crop Gate dataset created!")
print("===================================")
print(OUTPUT)