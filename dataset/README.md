# OceanWatch Sentinel - AI Verification Dataset

This dataset is designed for training AI models to verify and detect ocean hazards in images, based on the TinyCamML Flood-Model approach.

## Dataset Structure

```
dataset/
├── README.md
├── data/
│   ├── raw/
│   │   ├── real_images/
│   │   │   ├── tsunami/
│   │   │   ├── storm_surge/
│   │   │   ├── high_waves/
│   │   │   ├── flooding/
│   │   │   ├── debris/
│   │   │   ├── pollution/
│   │   │   ├── erosion/
│   │   │   ├── wildlife/
│   │   │   └── other/
│   │   └── ai_generated/
│   │       ├── tsunami/
│   │       ├── storm_surge/
│   │       ├── high_waves/
│   │       ├── flooding/
│   │       ├── debris/
│   │       ├── pollution/
│   │       ├── erosion/
│   │       ├── wildlife/
│   │       └── other/
│   ├── processed/
│   │   ├── train/
│   │   ├── validation/
│   │   └── test/
│   └── annotations/
│       ├── real_images_annotations.json
│       ├── ai_generated_annotations.json
│       └── verification_labels.json
├── models/
│   ├── hazard_detection_model.tflite
│   ├── ai_detection_model.tflite
│   └── verification_model.tflite
├── notebooks/
│   ├── 01_data_collection.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_model_training.ipynb
│   ├── 04_model_quantization.ipynb
│   └── 05_model_evaluation.ipynb
├── src/
│   ├── data_collection.py
│   ├── preprocessing.py
│   ├── model_training.py
│   ├── model_quantization.py
│   └── evaluation.py
└── requirements.txt
```

## Dataset Categories

### Real Images
- **Tsunami**: Real tsunami events, warning signs, evacuation areas
- **Storm Surge**: Coastal flooding from storms, high water levels
- **High Waves**: Large waves, rough seas, wave damage
- **Flooding**: Coastal flooding, waterlogged areas, flood damage
- **Debris**: Marine debris, floating objects, beach cleanup
- **Pollution**: Oil spills, water contamination, environmental damage
- **Erosion**: Coastal erosion, cliff collapses, beach loss
- **Wildlife**: Marine wildlife issues, stranded animals, habitat damage
- **Other**: Miscellaneous ocean hazards

### AI-Generated Images
- Synthetic images for each hazard category
- Generated using DALL-E, Midjourney, Stable Diffusion
- Used for training AI detection models

## Annotation Format

```json
{
  "image_id": "tsunami_001.jpg",
  "file_path": "data/raw/real_images/tsunami/tsunami_001.jpg",
  "hazard_type": "tsunami",
  "is_real": true,
  "verification_status": "verified",
  "confidence": 0.95,
  "location": {
    "lat": 12.345678,
    "lng": 98.765432,
    "city": "Pandharpur",
    "district": "Solapur",
    "state": "Maharashtra",
    "country": "India"
  },
  "metadata": {
    "source": "user_upload",
    "timestamp": "2024-01-15T10:30:00Z",
    "file_size": 2048576,
    "dimensions": [1920, 1080],
    "format": "JPEG"
  },
  "ai_detection": {
    "is_ai_generated": false,
    "confidence": 0.92,
    "indicators": []
  },
  "hazard_detection": {
    "detected_types": ["tsunami", "flooding"],
    "confidence": 0.88,
    "scenario_match": true
  }
}
```

## Model Architecture

Based on TinyCamML approach:
- **Input**: 224x224x3 RGB images
- **Backbone**: MobileNetV2 (quantized)
- **Output**: Multi-task predictions
  - Hazard type classification (9 classes)
  - AI generation detection (binary)
  - Verification confidence (regression)

## Training Pipeline

1. **Data Collection**: Gather real and AI-generated images
2. **Preprocessing**: Resize, normalize, augment
3. **Model Training**: Train on hazard detection and AI detection
4. **Quantization**: Convert to TensorFlow Lite for deployment
5. **Evaluation**: Test on validation set

## Usage

```python
# Load the trained model
import tensorflow as tf

# Load TensorFlow Lite model
interpreter = tf.lite.Interpreter(model_path="models/verification_model.tflite")
interpreter.allocate_tensors()

# Run inference
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Preprocess image
image = preprocess_image(image_path)
interpreter.set_tensor(input_details[0]['index'], image)

# Run inference
interpreter.invoke()

# Get results
hazard_prediction = interpreter.get_tensor(output_details[0]['index'])
ai_detection = interpreter.get_tensor(output_details[1]['index'])
confidence = interpreter.get_tensor(output_details[2]['index'])
```

## Performance Metrics

- **Hazard Detection Accuracy**: >90%
- **AI Detection Accuracy**: >95%
- **Model Size**: <2MB (quantized)
- **Inference Time**: <100ms on mobile devices
- **Confidence Threshold**: 0.7

## Contributing

1. Add new images to appropriate category folders
2. Update annotations with metadata
3. Retrain models with new data
4. Evaluate performance improvements

## References

- [TinyCamML Flood-Model](https://github.com/TinyCamML/Flood-Model.git)
- [TensorFlow Lite](https://www.tensorflow.org/lite)
- [MobileNetV2](https://arxiv.org/abs/1801.04381)

