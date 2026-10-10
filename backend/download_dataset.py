from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_REAL_API_KEY")

project = rf.workspace("plants-diseases").project(
    "plants_diseases_detection_using_yolov8"
)

dataset = project.version(1).download("yolo26")