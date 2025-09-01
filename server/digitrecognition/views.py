from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import base64
import cv2
import numpy as np
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "knn.pkl")
with open(MODEL_PATH, "rb") as f:
    knn_model = pickle.load(f)

def get_prediction(img):
    # if background is white and digit is black
    # img = cv2.bitwise_not(img)

    # resize to 8x8
    img_resized = cv2.resize(img, (28, 28), interpolation=cv2.INTER_AREA)
    # scale image using same scaler as training data
    img_scaled = img_resized / 255.0

    # flatten into 1D array
    img_flatten = img_scaled.flatten().reshape(1, -1)

    # prediction
    prediction = knn_model.predict(img_flatten)
    return prediction[0]


@api_view(['POST'])
@permission_classes([AllowAny])
def predict_digit(request):
    data = request.data.get('img', None)

    if "," in data:
        data = data.split(",")[1]
    
    img_bytes = base64.b64decode(data)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    prediction = get_prediction(img)

    return Response({"predicted_digit": prediction})