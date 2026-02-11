"""
OceanWatch Sentinel - Model Training Module

This module handles training of AI models for ocean hazard detection and verification.
Based on TinyCamML Flood-Model approach with MobileNetV2 backbone.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import tensorflow_model_optimization as tfmot
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import cv2
from PIL import Image


class OceanHazardModelTrainer:
    """Trains AI models for ocean hazard detection and verification."""
    
    def __init__(self, data_path: str = "dataset/data", model_path: str = "dataset/models"):
        self.data_path = Path(data_path)
        self.model_path = Path(model_path)
        self.model_path.mkdir(parents=True, exist_ok=True)
        
        # Model parameters
        self.input_shape = (224, 224, 3)
        self.num_hazard_classes = 9
        self.batch_size = 32
        self.epochs = 100
        self.learning_rate = 0.001
        
        # Hazard types
        self.hazard_types = [
            "tsunami", "storm_surge", "high_waves", "flooding",
            "debris", "pollution", "erosion", "wildlife", "other"
        ]
        
        # Create label mappings
        self.hazard_to_idx = {hazard: idx for idx, hazard in enumerate(self.hazard_types)}
        self.idx_to_hazard = {idx: hazard for hazard, idx in self.hazard_to_idx.items()}
    
    def create_model(self, num_classes: int = 9, include_ai_detection: bool = True) -> keras.Model:
        """
        Create the ocean hazard detection model.
        
        Args:
            num_classes: Number of hazard classes
            include_ai_detection: Whether to include AI detection head
            
        Returns:
            Compiled Keras model
        """
        # Base MobileNetV2 model
        base_model = MobileNetV2(
            input_shape=self.input_shape,
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model layers
        base_model.trainable = False
        
        # Add custom layers
        x = base_model.output
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.2)(x)
        
        # Hazard classification head
        hazard_output = layers.Dense(128, activation='relu')(x)
        hazard_output = layers.Dropout(0.3)(hazard_output)
        hazard_output = layers.Dense(num_classes, activation='softmax', name='hazard_classification')(hazard_output)
        
        # AI detection head (binary classification)
        if include_ai_detection:
            ai_output = layers.Dense(64, activation='relu')(x)
            ai_output = layers.Dropout(0.2)(ai_output)
            ai_output = layers.Dense(1, activation='sigmoid', name='ai_detection')(ai_output)
            
            # Create model with multiple outputs
            model = models.Model(
                inputs=base_model.input,
                outputs=[hazard_output, ai_output]
            )
            
            # Compile with multiple losses
            model.compile(
                optimizer=optimizers.Adam(learning_rate=self.learning_rate),
                loss={
                    'hazard_classification': 'categorical_crossentropy',
                    'ai_detection': 'binary_crossentropy'
                },
                loss_weights={
                    'hazard_classification': 1.0,
                    'ai_detection': 0.5
                },
                metrics={
                    'hazard_classification': 'accuracy',
                    'ai_detection': 'accuracy'
                }
            )
        else:
            # Single output model
            model = models.Model(
                inputs=base_model.input,
                outputs=hazard_output
            )
            
            model.compile(
                optimizer=optimizers.Adam(learning_rate=self.learning_rate),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
        
        return model
    
    def prepare_data(self, annotations: List[Dict]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare training data from annotations.
        
        Args:
            annotations: List of annotation dictionaries
            
        Returns:
            Tuple of (images, hazard_labels, ai_labels)
        """
        images = []
        hazard_labels = []
        ai_labels = []
        
        for annotation in annotations:
            try:
                # Load image
                image_path = annotation['file_path']
                image = cv2.imread(image_path)
                if image is None:
                    continue
                
                # Resize and normalize
                image = cv2.resize(image, (224, 224))
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                image = image.astype(np.float32) / 255.0
                
                images.append(image)
                
                # Hazard label (one-hot encoding)
                hazard_type = annotation['hazard_type']
                hazard_idx = self.hazard_to_idx.get(hazard_type, 8)  # Default to 'other'
                hazard_label = np.zeros(self.num_hazard_classes)
                hazard_label[hazard_idx] = 1
                hazard_labels.append(hazard_label)
                
                # AI detection label
                is_real = annotation['is_real']
                ai_label = 0 if is_real else 1
                ai_labels.append(ai_label)
                
            except Exception as e:
                print(f"Error processing {annotation.get('image_id', 'unknown')}: {e}")
                continue
        
        return np.array(images), np.array(hazard_labels), np.array(ai_labels)
    
    def create_data_generators(self, train_annotations: List[Dict], 
                             val_annotations: List[Dict],
                             test_annotations: List[Dict]) -> Tuple[ImageDataGenerator, ImageDataGenerator, ImageDataGenerator]:
        """
        Create data generators for training, validation, and testing.
        
        Args:
            train_annotations: Training annotations
            val_annotations: Validation annotations
            test_annotations: Test annotations
            
        Returns:
            Tuple of data generators
        """
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )
        
        # No augmentation for validation and test
        val_datagen = ImageDataGenerator()
        test_datagen = ImageDataGenerator()
        
        return train_datagen, val_datagen, test_datagen
    
    def train_model(self, train_annotations: List[Dict], 
                   val_annotations: List[Dict],
                   model_name: str = "ocean_hazard_model") -> keras.Model:
        """
        Train the ocean hazard detection model.
        
        Args:
            train_annotations: Training annotations
            val_annotations: Validation annotations
            model_name: Name for saving the model
            
        Returns:
            Trained Keras model
        """
        print("Preparing training data...")
        
        # Prepare data
        X_train, y_hazard_train, y_ai_train = self.prepare_data(train_annotations)
        X_val, y_hazard_val, y_ai_val = self.prepare_data(val_annotations)
        
        print(f"Training data shape: {X_train.shape}")
        print(f"Validation data shape: {X_val.shape}")
        
        # Create model
        model = self.create_model(include_ai_detection=True)
        print("Model created successfully!")
        
        # Create callbacks
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            callbacks.ModelCheckpoint(
                filepath=str(self.model_path / f"{model_name}_best.h5"),
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        # Train model
        print("Starting training...")
        history = model.fit(
            X_train,
            {'hazard_classification': y_hazard_train, 'ai_detection': y_ai_train},
            validation_data=(X_val, {'hazard_classification': y_hazard_val, 'ai_detection': y_ai_val}),
            epochs=self.epochs,
            batch_size=self.batch_size,
            callbacks=callbacks_list,
            verbose=1
        )
        
        # Save model
        model.save(str(self.model_path / f"{model_name}.h5"))
        
        # Save training history
        with open(str(self.model_path / f"{model_name}_history.json"), 'w') as f:
            json.dump(history.history, f, indent=2)
        
        # Plot training history
        self.plot_training_history(history, model_name)
        
        return model
    
    def quantize_model(self, model: keras.Model, 
                      quantize_aware_training: bool = True) -> tf.lite.Interpreter:
        """
        Quantize the model for deployment on mobile devices.
        
        Args:
            model: Trained Keras model
            quantize_aware_training: Whether to use quantization-aware training
            
        Returns:
            Quantized TensorFlow Lite interpreter
        """
        if quantize_aware_training:
            # Apply quantization-aware training
            quantize_model = tfmot.quantization.keras.quantize_model
            model = quantize_model(model)
        
        # Convert to TensorFlow Lite
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Set representative dataset for quantization
        def representative_data_gen():
            for _ in range(100):
                data = np.random.random((1, 224, 224, 3)).astype(np.float32)
                yield [data]
        
        converter.representative_dataset = representative_data_gen
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.uint8
        converter.inference_output_type = tf.uint8
        
        # Convert and save
        tflite_model = converter.convert()
        
        tflite_path = self.model_path / "ocean_hazard_model.tflite"
        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)
        
        print(f"Quantized model saved to {tflite_path}")
        print(f"Model size: {len(tflite_model) / 1024 / 1024:.2f} MB")
        
        # Create interpreter
        interpreter = tf.lite.Interpreter(model_path=str(tflite_path))
        interpreter.allocate_tensors()
        
        return interpreter
    
    def evaluate_model(self, model: keras.Model, 
                      test_annotations: List[Dict]) -> Dict:
        """
        Evaluate the trained model on test data.
        
        Args:
            model: Trained Keras model
            test_annotations: Test annotations
            
        Returns:
            Evaluation metrics dictionary
        """
        print("Preparing test data...")
        X_test, y_hazard_test, y_ai_test = self.prepare_data(test_annotations)
        
        print("Evaluating model...")
        results = model.evaluate(
            X_test,
            {'hazard_classification': y_hazard_test, 'ai_detection': y_ai_test},
            verbose=1
        )
        
        # Get predictions
        predictions = model.predict(X_test)
        hazard_pred = predictions[0] if isinstance(predictions, list) else predictions
        ai_pred = predictions[1] if isinstance(predictions, list) else None
        
        # Convert predictions to class labels
        hazard_pred_labels = np.argmax(hazard_pred, axis=1)
        hazard_true_labels = np.argmax(y_hazard_test, axis=1)
        
        # Calculate metrics
        metrics = {
            'hazard_accuracy': results[1] if isinstance(results, list) else results[1],
            'ai_accuracy': results[3] if isinstance(results, list) and len(results) > 3 else None,
            'hazard_classification_report': classification_report(
                hazard_true_labels, hazard_pred_labels, 
                target_names=self.hazard_types
            ),
            'hazard_confusion_matrix': confusion_matrix(
                hazard_true_labels, hazard_pred_labels
            )
        }
        
        # Plot confusion matrix
        self.plot_confusion_matrix(
            metrics['hazard_confusion_matrix'], 
            self.hazard_types,
            "hazard_confusion_matrix"
        )
        
        return metrics
    
    def plot_training_history(self, history: keras.callbacks.History, model_name: str):
        """Plot training history."""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Hazard classification loss
        axes[0, 0].plot(history.history['hazard_classification_loss'])
        axes[0, 0].plot(history.history['val_hazard_classification_loss'])
        axes[0, 0].set_title('Hazard Classification Loss')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Loss')
        axes[0, 0].legend(['Train', 'Validation'])
        
        # Hazard classification accuracy
        axes[0, 1].plot(history.history['hazard_classification_accuracy'])
        axes[0, 1].plot(history.history['val_hazard_classification_accuracy'])
        axes[0, 1].set_title('Hazard Classification Accuracy')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Accuracy')
        axes[0, 1].legend(['Train', 'Validation'])
        
        # AI detection loss
        axes[1, 0].plot(history.history['ai_detection_loss'])
        axes[1, 0].plot(history.history['val_ai_detection_loss'])
        axes[1, 0].set_title('AI Detection Loss')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Loss')
        axes[1, 0].legend(['Train', 'Validation'])
        
        # AI detection accuracy
        axes[1, 1].plot(history.history['ai_detection_accuracy'])
        axes[1, 1].plot(history.history['val_ai_detection_accuracy'])
        axes[1, 1].set_title('AI Detection Accuracy')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Accuracy')
        axes[1, 1].legend(['Train', 'Validation'])
        
        plt.tight_layout()
        plt.savefig(str(self.model_path / f"{model_name}_training_history.png"))
        plt.show()
    
    def plot_confusion_matrix(self, cm: np.ndarray, class_names: List[str], title: str):
        """Plot confusion matrix."""
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=class_names, yticklabels=class_names)
        plt.title(f'Confusion Matrix - {title}')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(str(self.model_path / f"{title}.png"))
        plt.show()


def main():
    """Example usage of the model trainer."""
    trainer = OceanHazardModelTrainer()
    
    # Load annotations
    with open("dataset/annotations/train_annotations.json", 'r') as f:
        train_annotations = json.load(f)
    
    with open("dataset/annotations/validation_annotations.json", 'r') as f:
        val_annotations = json.load(f)
    
    with open("dataset/annotations/test_annotations.json", 'r') as f:
        test_annotations = json.load(f)
    
    # Train model
    model = trainer.train_model(train_annotations, val_annotations)
    
    # Quantize model
    interpreter = trainer.quantize_model(model)
    
    # Evaluate model
    metrics = trainer.evaluate_model(model, test_annotations)
    
    print("Training completed!")
    print(f"Hazard Classification Accuracy: {metrics['hazard_accuracy']:.4f}")
    if metrics['ai_accuracy']:
        print(f"AI Detection Accuracy: {metrics['ai_accuracy']:.4f}")


if __name__ == "__main__":
    main()

