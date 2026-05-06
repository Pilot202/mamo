import tensorflow as tf
import numpy as np
import os
import cv2
import tempfile

IMG_SIZE = 384

# Configuration
CLASS_NAMES = ["Normal", "Benign", "Malignant"]

# Model is located in backend/ root. This file is in backend/app/services/
# So we need to go up two levels.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "mammography_densenet121_final1.keras")


def read_grayscale_image(path: str) -> np.ndarray:
    """Read image in grayscale format."""
    image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError(f"Could not read image: {path}")
    return image


def crop_breast_roi(image: np.ndarray, threshold: int = 8, pad: int = 12) -> np.ndarray:
    """Remove black borders and scanner background while preserving breast tissue."""
    if image.ndim != 2:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    mask = image > threshold
    if not np.any(mask):
        return image

    ys, xs = np.where(mask)
    y1, y2 = max(ys.min() - pad, 0), min(ys.max() + pad, image.shape[0] - 1)
    x1, x2 = max(xs.min() - pad, 0), min(xs.max() + pad, image.shape[1] - 1)
    return image[y1:y2 + 1, x1:x2 + 1]


def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, tile_grid_size=(8, 8)) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization."""
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(image.astype(np.uint8))


def median_filter(image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """Apply median filter for noise reduction."""
    return cv2.medianBlur(image.astype(np.uint8), kernel_size)


def bilateral_filter(image: np.ndarray, diameter: int = 7, sigma_color: int = 45, sigma_space: int = 45) -> np.ndarray:
    """Apply bilateral filter to preserve edges while reducing noise."""
    return cv2.bilateralFilter(image.astype(np.uint8), diameter, sigma_color, sigma_space)


def unsharp_mask(image: np.ndarray, amount: float = 1.2, radius: int = 5) -> np.ndarray:
    """Apply unsharp masking for subtle sharpening."""
    blurred = cv2.GaussianBlur(image.astype(np.uint8), (radius, radius), 0)
    sharpened = cv2.addWeighted(image.astype(np.uint8), 1 + amount, blurred, -amount, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)


def mammogram_filter_pipeline(image: np.ndarray) -> np.ndarray:
    """Recommended default for noisy mammograms: crop, denoise, enhance contrast, lightly sharpen."""
    image = crop_breast_roi(image)
    image = median_filter(image, kernel_size=5)
    image = bilateral_filter(image, diameter=7, sigma_color=45, sigma_space=45)
    image = apply_clahe(image, clip_limit=2.0, tile_grid_size=(8, 8))
    image = unsharp_mask(image, amount=0.6, radius=5)
    return image


def preprocess_mammogram_np(path_bytes) -> np.ndarray:
    """
    Preprocesses a mammogram image using the DenseNet121 pipeline.
    Expects path_bytes to be the file path encoded as UTF-8.
    """
    path = path_bytes.decode("utf-8")
    image = read_grayscale_image(path)
    image = mammogram_filter_pipeline(image)
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    return image.astype(np.float32)

class PredictionService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            print(f"Loading model from {MODEL_PATH}...")
            self.model = tf.keras.models.load_model(MODEL_PATH)
            print("Model loaded successfully.")
        else:
            print(f"Error: Model file not found at {MODEL_PATH}")

    def predict(self, image_bytes):
        """
        Predicts the class of a mammogram image from uploaded bytes.
        Uses DenseNet121 with mammography-specific preprocessing pipeline.
        """
        if not self.model:
            raise Exception("Model not loaded")

        try:
            # Save uploaded bytes to temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(image_bytes)
                tmp_path = tmp_file.name
            
            try:
                # Preprocess using the DenseNet preprocessing pipeline
                image_array = preprocess_mammogram_np(str(tmp_path).encode("utf-8"))
                
                # Add batch dimension
                image_batch = image_array[None, ...]
                
                # Get predictions
                probs = self.model.predict(image_batch, verbose=0)[0]
                pred_idx = int(np.argmax(probs))
                pred_class = CLASS_NAMES[pred_idx]
                confidence = float(probs[pred_idx])
                
                # Create a dictionary of probabilities
                probabilities = {class_name: float(prob) for class_name, prob in zip(CLASS_NAMES, probs)}

                return {
                    "class": pred_class,
                    "confidence": confidence,
                    "probabilities": probabilities
                }
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")

prediction_service = PredictionService()
