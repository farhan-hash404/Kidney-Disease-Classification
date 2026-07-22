import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


class PredictionPipeline:
    def __init__(self, filename):
        self.filename = filename

    def predict(self):
        model_path = os.path.join("artifacts", "training", "model.h5")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        model = load_model(model_path)
        test_image = image.load_img(self.filename, target_size=(224, 224))
        test_image = image.img_to_array(test_image)
        test_image = np.expand_dims(test_image, axis=0)
        test_image = test_image / 255.0
        
        result = np.argmax(model.predict(test_image), axis=1)

        if result[0] == 1:
            prediction = 'Kidney Tumor'
        else:
            prediction = 'Normal'
            
        return [{"image": prediction}]
