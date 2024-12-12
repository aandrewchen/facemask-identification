import numpy as np
import cv2
import base64
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

from utils.prepare_image import prepare_image

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

model = load_model('./face_mask_cnn.h5')

class_labels = ["incorrect_mask", "with_mask", "without_mask"]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        image_data = data['image']

        img_data = image_data.split(",")[1]
        img_array = np.frombuffer(base64.b64decode(img_data), np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        # Change image data to format that the model can use
        processed_img = prepare_image(img)

        prediction = model.predict(processed_img)
        predicted_class_index = np.argmax(prediction[0])

        prediction_label = class_labels[predicted_class_index]

        return jsonify({'prediction': prediction_label})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)