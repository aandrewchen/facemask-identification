import os
import numpy as np
import cv2
import base64
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model = load_model('./face_mask_cnn.h5')

# Mapping for the class indices
class_labels = ["incorrect_mask", "with_mask", "without_mask"]

# Function to process the incoming image
def prepare_image(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert image to RGB format
    img = cv2.resize(img, (128, 128))  # Resize image to match the model input size
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    img = img / 255.0  # Normalize image to [0, 1] range
    return img

@app.route('/')
def home():
    return "Welcome to the Face Mask Detection App!"

# Define prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        logging.info("Received POST request at /predict")

        # Get the image data from the request
        data = request.get_json()
        logging.info("Request data: %s", data)

        image_data = data['image']

        # Convert the image data from base64 to numpy array
        img_data = image_data.split(",")[1]
        img_array = np.frombuffer(base64.b64decode(img_data), np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        # Preprocess the image
        processed_img = prepare_image(img)

        # Make the prediction using the trained model
        prediction = model.predict(processed_img)

        # Find the index of the class with the highest probability
        logging.info("Prediction scores: %s", prediction)
        predicted_class_index = np.argmax(prediction[0])

        # Map the index to the class label
        prediction_label = class_labels[predicted_class_index]

        # Log the prediction
        logging.info("Prediction: %s", prediction_label)

        return jsonify({'prediction': prediction_label})
    except Exception as e:
        logging.error("Error during prediction: %s", str(e))
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)