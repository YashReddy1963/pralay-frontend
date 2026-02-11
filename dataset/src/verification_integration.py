"""
OceanWatch Sentinel - Verification Integration Module

This module integrates the trained AI models with the verification system.
Replaces the simulated verification with real AI model predictions.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import cv2
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import requests
from datetime import datetime


class AIVerificationService:
    """AI-powered verification service for ocean hazard images."""
    
    def __init__(self, model_path: str = "dataset/models"):
        self.model_path = Path(model_path)
        self.models = {}
        self.hazard_types = [
            "tsunami", "storm_surge", "high_waves", "flooding",
            "debris", "pollution", "erosion", "wildlife", "other"
        ]
        self.hazard_to_idx = {hazard: idx for idx, hazard in enumerate(self.hazard_types)}
        self.idx_to_hazard = {idx: hazard for hazard, idx in self.hazard_to_idx.items()}
        
        # Load models
        self._load_models()
    
    def _load_models(self):
        """Load the trained AI models."""
        try:
            # Load TensorFlow Lite model for deployment
            tflite_path = self.model_path / "ocean_hazard_model.tflite"
            if tflite_path.exists():
                self.models['tflite'] = tf.lite.Interpreter(model_path=str(tflite_path))
                self.models['tflite'].allocate_tensors()
                print("TensorFlow Lite model loaded successfully")
            
            # Load Keras model for detailed analysis
            keras_path = self.model_path / "ocean_hazard_model.h5"
            if keras_path.exists():
                self.models['keras'] = keras.models.load_model(str(keras_path))
                print("Keras model loaded successfully")
            
            if not self.models:
                print("Warning: No models found. Using fallback verification.")
                
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Using fallback verification.")
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for AI model input.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Preprocessed image array
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Resize to model input size
            image = cv2.resize(image, (224, 224))
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Normalize to [0, 1]
            image = image.astype(np.float32) / 255.0
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            print(f"Error preprocessing image {image_path}: {e}")
            return None
    
    def predict_with_tflite(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Run prediction using TensorFlow Lite model.
        
        Args:
            image: Preprocessed image array
            
        Returns:
            Prediction results dictionary
        """
        if 'tflite' not in self.models:
            return self._fallback_prediction()
        
        try:
            interpreter = self.models['tflite']
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            
            # Set input tensor
            interpreter.set_tensor(input_details[0]['index'], image.astype(np.uint8))
            
            # Run inference
            interpreter.invoke()
            
            # Get outputs
            hazard_output = interpreter.get_tensor(output_details[0]['index'])
            ai_output = interpreter.get_tensor(output_details[1]['index'])
            
            # Process results
            hazard_pred = np.argmax(hazard_output[0])
            hazard_confidence = np.max(hazard_output[0])
            ai_confidence = ai_output[0][0]
            
            return {
                'hazard_type': self.idx_to_hazard[hazard_pred],
                'hazard_confidence': float(hazard_confidence),
                'is_ai_generated': ai_confidence > 0.5,
                'ai_confidence': float(ai_confidence),
                'all_hazard_scores': hazard_output[0].tolist()
            }
            
        except Exception as e:
            print(f"Error in TFLite prediction: {e}")
            return self._fallback_prediction()
    
    def predict_with_keras(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Run prediction using Keras model for detailed analysis.
        
        Args:
            image: Preprocessed image array
            
        Returns:
            Detailed prediction results
        """
        if 'keras' not in self.models:
            return self._fallback_prediction()
        
        try:
            model = self.models['keras']
            predictions = model.predict(image)
            
            # Handle multi-output model
            if isinstance(predictions, list):
                hazard_output = predictions[0]
                ai_output = predictions[1]
            else:
                hazard_output = predictions
                ai_output = None
            
            # Process hazard prediction
            hazard_pred = np.argmax(hazard_output[0])
            hazard_confidence = np.max(hazard_output[0])
            
            # Process AI detection
            if ai_output is not None:
                ai_confidence = ai_output[0][0]
                is_ai_generated = ai_confidence > 0.5
            else:
                ai_confidence = 0.5
                is_ai_generated = False
            
            # Get top 3 hazard predictions
            top_indices = np.argsort(hazard_output[0])[-3:][::-1]
            top_predictions = [
                {
                    'hazard_type': self.idx_to_hazard[idx],
                    'confidence': float(hazard_output[0][idx])
                }
                for idx in top_indices
            ]
            
            return {
                'hazard_type': self.idx_to_hazard[hazard_pred],
                'hazard_confidence': float(hazard_confidence),
                'is_ai_generated': is_ai_generated,
                'ai_confidence': float(ai_confidence),
                'top_predictions': top_predictions,
                'all_hazard_scores': hazard_output[0].tolist()
            }
            
        except Exception as e:
            print(f"Error in Keras prediction: {e}")
            return self._fallback_prediction()
    
    def _fallback_prediction(self) -> Dict[str, Any]:
        """Fallback prediction when models are not available."""
        return {
            'hazard_type': 'other',
            'hazard_confidence': 0.5,
            'is_ai_generated': False,
            'ai_confidence': 0.5,
            'top_predictions': [
                {'hazard_type': 'other', 'confidence': 0.5}
            ],
            'all_hazard_scores': [0.1] * len(self.hazard_types)
        }
    
    def verify_image(self, image_path: str, selected_hazard_type: str = None) -> Dict[str, Any]:
        """
        Verify an image using AI models.
        
        Args:
            image_path: Path to the image file
            selected_hazard_type: Expected hazard type (optional)
            
        Returns:
            Verification results dictionary
        """
        # Preprocess image
        image = self.preprocess_image(image_path)
        if image is None:
            return {
                'status': 'error',
                'message': 'Failed to preprocess image',
                'confidence': 0.0
            }
        
        # Run prediction
        if 'tflite' in self.models:
            prediction = self.predict_with_tflite(image)
        elif 'keras' in self.models:
            prediction = self.predict_with_keras(image)
        else:
            prediction = self._fallback_prediction()
        
        # Determine verification status
        status = 'verified'
        message = 'Image verified successfully'
        
        # Check AI generation
        if prediction['is_ai_generated']:
            status = 'failed'
            message = 'AI-generated image detected - only real photos are accepted'
        
        # Check hazard type match
        elif selected_hazard_type and prediction['hazard_type'] != selected_hazard_type:
            status = 'failed'
            message = f'Image content does not match selected hazard type. Detected: {prediction["hazard_type"]}'
        
        # Check confidence threshold
        elif prediction['hazard_confidence'] < 0.7:
            status = 'failed'
            message = 'Low confidence in hazard detection - please check image quality'
        
        # Overall confidence
        overall_confidence = (prediction['hazard_confidence'] + (1 - prediction['ai_confidence'])) / 2
        
        return {
            'status': status,
            'message': message,
            'confidence': overall_confidence,
            'hazard_detection': {
                'detected_type': prediction['hazard_type'],
                'confidence': prediction['hazard_confidence'],
                'top_predictions': prediction.get('top_predictions', [])
            },
            'ai_detection': {
                'is_ai_generated': prediction['is_ai_generated'],
                'confidence': prediction['ai_confidence']
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def batch_verify_images(self, image_paths: List[str], 
                          selected_hazard_types: List[str] = None) -> List[Dict[str, Any]]:
        """
        Verify multiple images in batch.
        
        Args:
            image_paths: List of image file paths
            selected_hazard_types: List of expected hazard types
            
        Returns:
            List of verification results
        """
        results = []
        
        for i, image_path in enumerate(image_paths):
            selected_type = selected_hazard_types[i] if selected_hazard_types else None
            result = self.verify_image(image_path, selected_type)
            result['image_path'] = image_path
            results.append(result)
        
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models."""
        info = {
            'models_loaded': list(self.models.keys()),
            'hazard_types': self.hazard_types,
            'model_path': str(self.model_path)
        }
        
        if 'tflite' in self.models:
            interpreter = self.models['tflite']
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            
            info['tflite'] = {
                'input_shape': input_details[0]['shape'],
                'input_type': str(input_details[0]['dtype']),
                'output_count': len(output_details)
            }
        
        if 'keras' in self.models:
            model = self.models['keras']
            info['keras'] = {
                'input_shape': model.input_shape,
                'output_shape': model.output_shape,
                'parameters': model.count_params()
            }
        
        return info


def integrate_with_report_hazard(verification_service: AIVerificationService, 
                               image_file: Any) -> Dict[str, Any]:
    """
    Integrate AI verification with the ReportHazard component.
    
    Args:
        verification_service: AI verification service instance
        image_file: File object from the form
        
    Returns:
        Verification results compatible with ReportHazard
    """
    try:
        # Save temporary file
        temp_path = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        with open(temp_path, 'wb') as f:
            f.write(image_file.read())
        
        # Verify image
        result = verification_service.verify_image(temp_path)
        
        # Clean up
        os.remove(temp_path)
        
        # Format for ReportHazard component
        return {
            'status': result['status'],
            'checks': {
                'isImage': True,
                'fileSize': len(image_file.read()),
                'isRealImage': not result['ai_detection']['is_ai_generated'],
                'hazardTypeMatch': result['status'] == 'verified',
                'scenarioMatch': result['status'] == 'verified',
                'contentAnalysis': result['confidence'] > 0.7,
                'hazardRelevant': result['hazard_detection']['confidence'] > 0.5
            },
            'aiDetection': result['ai_detection'],
            'hazardMatching': {
                'matchesSelectedType': result['status'] == 'verified',
                'detectedHazardTypes': [result['hazard_detection']['detected_type']],
                'confidence': result['hazard_detection']['confidence'],
                'scenarioMatch': result['status'] == 'verified'
            },
            'confidence': result['confidence'],
            'message': result['message'],
            'timestamp': result['timestamp']
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'checks': {},
            'aiDetection': {},
            'hazardMatching': {},
            'confidence': 0.0,
            'message': f'Verification failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }


def main():
    """Example usage of the AI verification service."""
    # Initialize service
    service = AIVerificationService()
    
    # Get model info
    info = service.get_model_info()
    print("Model Information:")
    print(json.dumps(info, indent=2))
    
    # Example verification
    image_path = "dataset/data/raw/real_images/tsunami/tsunami_001.jpg"
    if os.path.exists(image_path):
        result = service.verify_image(image_path, "tsunami")
        print("\nVerification Result:")
        print(json.dumps(result, indent=2))
    else:
        print(f"Example image not found: {image_path}")


if __name__ == "__main__":
    main()






