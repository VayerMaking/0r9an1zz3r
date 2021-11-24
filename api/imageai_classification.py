from imageai.Classification import ImageClassification
import os

execution_path = os.getcwd()

prediction = ImageClassification()
prediction.setModelTypeAsMobileNetV2()
prediction.setModelPath(os.path.join(
    execution_path, "models/mobilenet_v2.h5"))
prediction.loadModel()

predictions, probabilities = prediction.classifyImage(
    os.path.join(execution_path, "uploads/shutterstock_648907024.jpg"), result_count=10)
for eachPrediction, eachProbability in zip(predictions, probabilities):
    print(eachPrediction, " : ", eachProbability)
