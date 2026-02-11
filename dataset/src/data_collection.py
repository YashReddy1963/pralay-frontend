"""
OceanWatch Sentinel - Data Collection Module

This module handles data collection for AI verification and detection models.
Based on TinyCamML Flood-Model approach for ocean hazard detection.
"""

import os
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np
from PIL import Image
import pandas as pd
from pathlib import Path


class OceanHazardDataCollector:
    """Collects and organizes ocean hazard images for AI training."""
    
    def __init__(self, base_path: str = "dataset/data"):
        self.base_path = Path(base_path)
        self.raw_path = self.base_path / "raw"
        self.processed_path = self.base_path / "processed"
        self.annotations_path = self.base_path / "annotations"
        
        # Create directory structure
        self._create_directories()
        
        # Hazard types
        self.hazard_types = [
            "tsunami", "storm_surge", "high_waves", "flooding",
            "debris", "pollution", "erosion", "wildlife", "other"
        ]
        
        # Image categories
        self.categories = ["real_images", "ai_generated"]
        
    def _create_directories(self):
        """Create the directory structure for the dataset."""
        for category in ["real_images", "ai_generated"]:
            for hazard_type in self.hazard_types:
                (self.raw_path / category / hazard_type).mkdir(parents=True, exist_ok=True)
        
        for split in ["train", "validation", "test"]:
            (self.processed_path / split).mkdir(parents=True, exist_ok=True)
        
        self.annotations_path.mkdir(parents=True, exist_ok=True)
    
    def collect_from_user_uploads(self, image_paths: List[str], 
                                hazard_types: List[str],
                                locations: List[Dict],
                                is_real: bool = True) -> List[Dict]:
        """
        Collect images from user uploads and organize them.
        
        Args:
            image_paths: List of image file paths
            hazard_types: List of hazard types for each image
            locations: List of location dictionaries
            is_real: Whether images are real or AI-generated
            
        Returns:
            List of annotation dictionaries
        """
        annotations = []
        category = "real_images" if is_real else "ai_generated"
        
        for i, (image_path, hazard_type, location) in enumerate(
            zip(image_paths, hazard_types, locations)
        ):
            if hazard_type not in self.hazard_types:
                hazard_type = "other"
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{hazard_type}_{timestamp}_{i:03d}.jpg"
            
            # Destination path
            dest_path = self.raw_path / category / hazard_type / filename
            
            # Copy and resize image
            self._process_image(image_path, dest_path)
            
            # Create annotation
            annotation = self._create_annotation(
                filename, dest_path, hazard_type, location, is_real
            )
            annotations.append(annotation)
        
        return annotations
    
    def collect_from_web_sources(self, urls: List[str], 
                               hazard_types: List[str],
                               locations: List[Dict]) -> List[Dict]:
        """
        Collect images from web sources (news articles, social media, etc.).
        
        Args:
            urls: List of image URLs
            hazard_types: List of hazard types
            locations: List of location dictionaries
            
        Returns:
            List of annotation dictionaries
        """
        annotations = []
        
        for i, (url, hazard_type, location) in enumerate(
            zip(urls, hazard_types, locations)
        ):
            try:
                # Download image
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                
                # Generate filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{hazard_type}_web_{timestamp}_{i:03d}.jpg"
                
                # Save path
                dest_path = self.raw_path / "real_images" / hazard_type / filename
                
                # Save image
                with open(dest_path, 'wb') as f:
                    f.write(response.content)
                
                # Process image
                self._process_image(dest_path, dest_path)
                
                # Create annotation
                annotation = self._create_annotation(
                    filename, dest_path, hazard_type, location, True
                )
                annotation["source"] = "web"
                annotation["url"] = url
                annotations.append(annotation)
                
            except Exception as e:
                print(f"Failed to download {url}: {e}")
                continue
        
        return annotations
    
    def generate_ai_images(self, prompt_templates: Dict[str, List[str]], 
                          num_images_per_type: int = 10) -> List[Dict]:
        """
        Generate AI images for training AI detection models.
        
        Args:
            prompt_templates: Dictionary of hazard types to prompt templates
            num_images_per_type: Number of images to generate per type
            
        Returns:
            List of annotation dictionaries
        """
        annotations = []
        
        for hazard_type, prompts in prompt_templates.items():
            if hazard_type not in self.hazard_types:
                continue
            
            for i in range(num_images_per_type):
                # Select random prompt
                prompt = np.random.choice(prompts)
                
                # Generate AI image (placeholder - would use DALL-E, Midjourney, etc.)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{hazard_type}_ai_{timestamp}_{i:03d}.jpg"
                
                # Save path
                dest_path = self.raw_path / "ai_generated" / hazard_type / filename
                
                # Generate placeholder image (in real implementation, call AI service)
                self._generate_placeholder_ai_image(dest_path, prompt)
                
                # Create annotation
                annotation = self._create_annotation(
                    filename, dest_path, hazard_type, {}, False
                )
                annotation["ai_prompt"] = prompt
                annotation["source"] = "ai_generated"
                annotations.append(annotation)
        
        return annotations
    
    def _process_image(self, src_path: str, dest_path: Path):
        """Process and save image with proper formatting."""
        try:
            # Load image
            image = cv2.imread(str(src_path))
            if image is None:
                raise ValueError(f"Could not load image: {src_path}")
            
            # Resize to standard size (224x224 for MobileNet)
            image = cv2.resize(image, (224, 224))
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Save as JPEG
            pil_image = Image.fromarray(image)
            pil_image.save(dest_path, "JPEG", quality=95)
            
        except Exception as e:
            print(f"Error processing image {src_path}: {e}")
    
    def _generate_placeholder_ai_image(self, dest_path: Path, prompt: str):
        """Generate a placeholder AI image (for demonstration)."""
        # Create a random colored image as placeholder
        image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        # Add some text to indicate it's AI-generated
        cv2.putText(image, "AI Generated", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(image, prompt[:20], (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Save image
        pil_image = Image.fromarray(image)
        pil_image.save(dest_path, "JPEG", quality=95)
    
    def _create_annotation(self, filename: str, file_path: Path, 
                          hazard_type: str, location: Dict, 
                          is_real: bool) -> Dict:
        """Create annotation dictionary for an image."""
        # Get image metadata
        image = Image.open(file_path)
        width, height = image.size
        file_size = file_path.stat().st_size
        
        return {
            "image_id": filename,
            "file_path": str(file_path),
            "hazard_type": hazard_type,
            "is_real": is_real,
            "verification_status": "pending",
            "confidence": 0.0,
            "location": location,
            "metadata": {
                "source": "user_upload",
                "timestamp": datetime.now().isoformat(),
                "file_size": file_size,
                "dimensions": [width, height],
                "format": "JPEG"
            },
            "ai_detection": {
                "is_ai_generated": not is_real,
                "confidence": 0.0,
                "indicators": []
            },
            "hazard_detection": {
                "detected_types": [hazard_type],
                "confidence": 0.0,
                "scenario_match": True
            }
        }
    
    def save_annotations(self, annotations: List[Dict], 
                        filename: str = "annotations.json"):
        """Save annotations to JSON file."""
        file_path = self.annotations_path / filename
        
        with open(file_path, 'w') as f:
            json.dump(annotations, f, indent=2)
        
        print(f"Saved {len(annotations)} annotations to {file_path}")
    
    def load_annotations(self, filename: str = "annotations.json") -> List[Dict]:
        """Load annotations from JSON file."""
        file_path = self.annotations_path / filename
        
        if not file_path.exists():
            return []
        
        with open(file_path, 'r') as f:
            annotations = json.load(f)
        
        return annotations
    
    def create_dataset_split(self, annotations: List[Dict], 
                           train_ratio: float = 0.7,
                           val_ratio: float = 0.15,
                           test_ratio: float = 0.15):
        """Create train/validation/test splits."""
        # Shuffle annotations
        np.random.shuffle(annotations)
        
        # Calculate split indices
        total = len(annotations)
        train_end = int(total * train_ratio)
        val_end = int(total * (train_ratio + val_ratio))
        
        # Split annotations
        train_annotations = annotations[:train_end]
        val_annotations = annotations[train_end:val_end]
        test_annotations = annotations[val_end:]
        
        # Save splits
        self.save_annotations(train_annotations, "train_annotations.json")
        self.save_annotations(val_annotations, "validation_annotations.json")
        self.save_annotations(test_annotations, "test_annotations.json")
        
        print(f"Dataset split created:")
        print(f"  Train: {len(train_annotations)} images")
        print(f"  Validation: {len(val_annotations)} images")
        print(f"  Test: {len(test_annotations)} images")
        
        return train_annotations, val_annotations, test_annotations


def main():
    """Example usage of the data collector."""
    collector = OceanHazardDataCollector()
    
    # Example: Collect from user uploads
    image_paths = ["path/to/image1.jpg", "path/to/image2.jpg"]
    hazard_types = ["tsunami", "flooding"]
    locations = [
        {"lat": 12.345, "lng": 98.765, "city": "Pandharpur", "district": "Solapur"},
        {"lat": 13.456, "lng": 99.876, "city": "Mumbai", "district": "Mumbai"}
    ]
    
    annotations = collector.collect_from_user_uploads(
        image_paths, hazard_types, locations, is_real=True
    )
    
    # Example: Generate AI images
    prompt_templates = {
        "tsunami": [
            "A massive tsunami wave approaching a coastal city",
            "Tsunami warning signs on a beach",
            "Evacuation route signs during tsunami alert"
        ],
        "flooding": [
            "Coastal flooding with water covering streets",
            "Flooded beach area with debris",
            "High water levels during storm surge"
        ]
    }
    
    ai_annotations = collector.generate_ai_images(prompt_templates, num_images_per_type=5)
    
    # Combine all annotations
    all_annotations = annotations + ai_annotations
    
    # Save annotations
    collector.save_annotations(all_annotations)
    
    # Create dataset split
    collector.create_dataset_split(all_annotations)


if __name__ == "__main__":
    main()

