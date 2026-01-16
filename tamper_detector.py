"""
Manipulation and Tampering Detection Module
Detects various forms of digital manipulation in images and videos
"""
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage
from typing import Dict, Any, Tuple, List
import os
from utils.helpers import extract_metadata


class TamperDetector:
    """Detection engine for various forms of digital tampering"""
    
    def __init__(self):
        self.ela_threshold = 20  # Error Level Analysis threshold
        self.sensitivity = 0.7   # General sensitivity for tampering detection
    
    def error_level_analysis(self, image_path: str, quality: int = 95) -> Tuple[float, Dict[str, Any]]:
        """
        Perform Error Level Analysis to detect re-compression artifacts
        """
        try:
            # Load the image
            img = Image.open(image_path)
            
            # Save the image at a different quality and reload
            temp_path = image_path + "_temp.jpg"
            img.save(temp_path, 'JPEG', quality=quality)
            temp_img = Image.open(temp_path)
            
            # Calculate the difference between original and recompressed
            original_array = np.array(img)
            temp_array = np.array(temp_img)
            
            # Ensure arrays have the same shape
            if original_array.shape != temp_array.shape:
                # Resize temp_array to match original if needed
                temp_array = np.array(temp_img.resize(img.size, resample=Image.Resampling.LANCZOS))
                if len(original_array.shape) == 3 and len(temp_array.shape) == 3:
                    temp_array = temp_array[:,:,:3]  # Handle RGBA vs RGB
            
            # Calculate error level
            ela_map = np.abs(original_array.astype(np.int16) - temp_array.astype(np.int16))
            
            # Calculate statistics
            mean_error = np.mean(ela_map)
            std_error = np.std(ela_map)
            max_error = np.max(ela_map)
            
            # High variance in error levels might indicate manipulation
            if std_error > self.ela_threshold:
                confidence = min(1.0, std_error / 50.0)
                tampered = True
                explanation = "High variance in error levels suggests manipulation"
            else:
                confidence = 0.1
                tampered = False
                explanation = "Consistent error levels suggest original content"
            
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            details = {
                "mean_error": float(mean_error),
                "std_error": float(std_error),
                "max_error": float(max_error),
                "ela_map_shape": ela_map.shape,
                "analysis": explanation
            }
            
            return confidence, details
            
        except Exception as e:
            return 0.0, {"error": f"Error in ELA: {str(e)}"}
    
    def detect_cloning_tampering(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect copy-move forgery using block matching
        """
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Resize image for faster processing
        scale_factor = min(1.0, 1000.0 / max(img.shape))
        if scale_factor < 1.0:
            new_width = int(img.shape[1] * scale_factor)
            new_height = int(img.shape[0] * scale_factor)
            img = cv2.resize(img, (new_width, new_height))
        
        # Divide image into overlapping blocks
        block_size = 32
        stride = 16
        
        blocks = []
        positions = []
        
        for i in range(0, img.shape[0] - block_size, stride):
            for j in range(0, img.shape[1] - block_size, stride):
                block = img[i:i+block_size, j:j+block_size]
                if block.shape == (block_size, block_size):
                    blocks.append(block.flatten())
                    positions.append((i, j))
        
        if len(blocks) < 2:
            return 0.0, {"error": "Image too small for cloning detection"}
        
        blocks = np.array(blocks)
        
        # Calculate correlations between blocks
        tamper_score = 0
        similar_pairs = 0
        total_comparisons = 0
        
        # Limit comparisons for performance
        max_comparisons = 1000
        for i in range(min(len(blocks), 100)):  # Only check first 100 blocks
            for j in range(i + 1, min(len(blocks), i + 50)):  # Check next 50 blocks
                if total_comparisons >= max_comparisons:
                    break
                
                # Calculate normalized cross-correlation
                block1 = blocks[i].astype(np.float64)
                block2 = blocks[j].astype(np.float64)
                
                # Normalize blocks
                block1_norm = (block1 - np.mean(block1)) / (np.std(block1) + 1e-6)
                block2_norm = (block2 - np.mean(block2)) / (np.std(block2) + 1e-6)
                
                correlation = np.sum(block1_norm * block2_norm) / np.sqrt(
                    np.sum(block1_norm**2) * np.sum(block2_norm**2) + 1e-6
                )
                
                if correlation > 0.9:  # High correlation suggests duplication
                    similar_pairs += 1
                    tamper_score += correlation
                
                total_comparisons += 1
            
            if total_comparisons >= max_comparisons:
                break
        
        if total_comparisons > 0:
            avg_correlation = tamper_score / max(similar_pairs, 1)
            confidence = min(1.0, (similar_pairs / total_comparisons) * 3.0)
        else:
            confidence = 0.0
            avg_correlation = 0.0
        
        details = {
            "total_blocks_analyzed": min(len(blocks), 100),
            "similar_pairs_found": similar_pairs,
            "total_comparisons": total_comparisons,
            "average_correlation": float(avg_correlation),
            "cloning_analysis": "Potential cloning detected" if similar_pairs > 5 else "No significant cloning patterns found"
        }
        
        return confidence, details
    
    def detect_face_swaps(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect potential face swaps using facial landmark analysis
        """
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Use OpenCV's Haar cascades for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        face_analysis_results = []
        total_confidence = 0.0
        
        for (x, y, w, h) in faces:
            face_region = gray[y:y+h, x:x+w]
            
            # Check for inconsistencies in lighting, texture, etc.
            # Analyze edges within the face region
            edges = cv2.Canny(face_region, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Check for unnatural boundaries
            face_boundary = gray[max(0, y-5):y, x:x+w] if y > 5 else np.array([])
            if face_boundary.size > 0:
                boundary_edges = cv2.Canny(face_boundary, 50, 150)
                boundary_edge_density = np.sum(boundary_edges > 0) / boundary_edges.size
            else:
                boundary_edge_density = 0
            
            # Compare edge densities - significant differences may indicate tampering
            if abs(edge_density - boundary_edge_density) > 0.1:
                face_confidence = 0.7
                analysis = "Edge density mismatch at face boundary"
            else:
                face_confidence = 0.1
                analysis = "Consistent edge patterns around face"
            
            total_confidence += face_confidence
            face_analysis_results.append({
                "position": (int(x), int(y), int(w), int(h)),
                "edge_density": float(edge_density),
                "boundary_edge_density": float(boundary_edge_density),
                "confidence": face_confidence,
                "analysis": analysis
            })
        
        # Average confidence across all detected faces
        if len(faces) > 0:
            avg_confidence = total_confidence / len(faces)
        else:
            avg_confidence = 0.0
            face_analysis_results = [{"analysis": "No faces detected"}]
        
        details = {
            "faces_detected": int(len(faces)),
            "average_confidence": float(avg_confidence),
            "face_analysis": face_analysis_results
        }
        
        return avg_confidence, details
    
    def detect_splicing_tampering(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect image splicing using noise pattern analysis
        """
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Convert to different color spaces and analyze noise patterns
        lab_img = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        yuv_img = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
        
        # Analyze noise in different channels
        noise_scores = []
        
        for channel_idx in range(3):  # Process each channel
            channel = lab_img[:,:,channel_idx].astype(np.float32)
            
            # Apply Laplacian to detect edges and textures
            laplacian = cv2.Laplacian(channel, cv2.CV_64F)
            
            # Calculate local statistics in patches
            patch_size = 32
            height, width = channel.shape
            
            patch_variances = []
            for i in range(0, height - patch_size, patch_size):
                for j in range(0, width - patch_size, patch_size):
                    patch = channel[i:i+patch_size, j:j+patch_size]
                    patch_var = np.var(patch)
                    patch_variances.append(patch_var)
            
            if patch_variances:
                var_std = np.std(patch_variances)
                var_mean = np.mean(patch_variances)
                
                # High variance in patch variances may indicate different sources
                if var_mean > 0:
                    noise_inconsistency = var_std / var_mean
                    noise_scores.append(noise_inconsistency)
        
        if noise_scores:
            avg_inconsistency = np.mean(noise_scores)
            # Higher inconsistency suggests possible splicing
            confidence = min(1.0, avg_inconsistency * 0.5)
        else:
            confidence = 0.0
            avg_inconsistency = 0.0
        
        details = {
            "noise_inconsistency_score": float(avg_inconsistency),
            "patch_analysis_count": len(noise_scores),
            "splicing_analysis": "Potential splicing detected" if avg_inconsistency > 0.5 else "Consistent noise patterns found"
        }
        
        return confidence, details
    
    def detect_re_encoding_inconsistencies(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect inconsistencies caused by multiple encodings
        """
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Analyze JPEG quantization tables indirectly through DCT analysis
        # This is a simplified version - real implementation would need access to quantization tables
        
        # Convert to YUV and analyze the Y channel
        yuv_img = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
        y_channel = yuv_img[:,:,0]
        
        # Perform 8x8 block DCT analysis
        height, width = y_channel.shape
        dct_blocks = []
        
        for i in range(0, height - 8, 8):
            for j in range(0, width - 8, 8):
                block = y_channel[i:i+8, j:j+8].astype(np.float32)
                dct_block = cv2.dct(block)
                dct_blocks.append(dct_block)
        
        if not dct_blocks:
            return 0.0, {"error": "Image too small for DCT analysis"}
        
        # Analyze the distribution of DCT coefficients
        # Natural images have different DCT characteristics than re-encoded images
        all_coeffs = np.concatenate([block.flatten() for block in dct_blocks])
        
        # Look for patterns typical of JPEG compression
        # Quantization creates specific patterns in DCT domain
        coeff_histogram, _ = np.histogram(all_coeffs, bins=100)
        
        # Calculate entropy of DCT coefficients
        coeff_probs = coeff_histogram / np.sum(coeff_histogram)
        coeff_probs = coeff_probs[coeff_probs > 0]  # Remove zeros
        entropy = -np.sum(coeff_probs * np.log2(coeff_probs + 1e-10))
        
        # Very low entropy might indicate heavy quantization/re-encoding
        normalized_entropy = entropy / np.log2(len(coeff_histogram))
        
        # Analyze AC coefficient distribution (should follow certain patterns in natural images)
        ac_coeffs = all_coeffs[all_coeffs != all_coeffs[0]]  # Exclude DC coefficients
        ac_kurtosis = np.mean(((ac_coeffs - np.mean(ac_coeffs)) / (np.std(ac_coeffs) + 1e-6))**4) - 3
        
        # Extreme kurtosis values may indicate re-encoding
        kurtosis_deviation = abs(ac_kurtosis)
        
        # Combine metrics
        if normalized_entropy < 0.3 or kurtosis_deviation > 2.0:
            confidence = min(1.0, (3.0 - normalized_entropy * 10 + kurtosis_deviation * 0.2))
            analysis = "JPEG compression artifacts suggest possible re-encoding"
        else:
            confidence = 0.1
            analysis = "Natural compression characteristics observed"
        
        details = {
            "normalized_entropy": float(normalized_entropy),
            "kurtosis": float(ac_kurtosis),
            "kurtosis_deviation": float(kurtosis_deviation),
            "dct_analysis": analysis
        }
        
        return confidence, details
    
    def detect_metadata_visual_mismatch(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Check for mismatches between metadata and visual content
        """
        try:
            metadata = extract_metadata(image_path)
            img = cv2.imread(image_path)
            
            if img is None:
                return 0.0, {"error": "Could not load image"}
            
            img_height, img_width = img.shape[:2]
            
            meta_width = metadata.get('width', 0)
            meta_height = metadata.get('height', 0)
            
            # Check if dimensions match
            dimension_mismatch = False
            if meta_width != img_width or meta_height != img_height:
                dimension_mismatch = True
            
            # Additional checks could include:
            # - Camera settings vs image characteristics
            # - Timestamp vs file system timestamps
            # - Color profile inconsistencies
            
            mismatch_score = 0.0
            details_list = []
            
            if dimension_mismatch:
                mismatch_score = 0.8
                details_list.append(f"Dimension mismatch: EXIF({meta_width}x{meta_height}) vs actual({img_width}x{img_height})")
            else:
                mismatch_score = 0.1
                details_list.append("Dimensions match EXIF metadata")
            
            details = {
                "dimension_mismatch": dimension_mismatch,
                "metadata_details": details_list,
                "visual_metadata_analysis": "Mismatch detected" if dimension_mismatch else "Consistent with metadata"
            }
            
            return mismatch_score, details
            
        except Exception as e:
            return 0.0, {"error": f"Error in metadata analysis: {str(e)}"}
    
    def detect_manipulation(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to detect manipulation using multiple techniques
        """
        results = {
            'is_manipulated': False,
            'overall_confidence': 0.0,
            'manipulation_signals': {},
            'evidence': [],
            'method_used': 'multi_method_analysis'
        }
        
        content_type = content_data.get('content_type', 'unknown')
        
        if content_type == 'image':
            image_path = content_data['file_path']
            
            # Run all detection methods
            ela_conf, ela_details = self.error_level_analysis(image_path)
            clone_conf, clone_details = self.detect_cloning_tampering(image_path)
            face_conf, face_details = self.detect_face_swaps(image_path)
            splice_conf, splice_details = self.detect_splicing_tampering(image_path)
            reenc_conf, reenc_details = self.detect_re_encoding_inconsistencies(image_path)
            meta_conf, meta_details = self.detect_metadata_visual_mismatch(image_path)
            
            # Store individual results
            results['manipulation_signals'] = {
                'error_level_analysis': {'confidence': ela_conf, 'details': ela_details},
                'cloning_detection': {'confidence': clone_conf, 'details': clone_details},
                'face_swap_detection': {'confidence': face_conf, 'details': face_details},
                'splicing_detection': {'confidence': splice_conf, 'details': splice_details},
                're_encoding_analysis': {'confidence': reenc_conf, 'details': reenc_details},
                'metadata_visual_match': {'confidence': meta_conf, 'details': meta_details}
            }
            
            # Aggregate confidence scores
            confidences = [ela_conf, clone_conf, face_conf, splice_conf, reenc_conf, meta_conf]
            avg_confidence = np.mean(confidences)
            
            # Weighted scoring - some signals might be more reliable
            weighted_confidence = (
                ela_conf * 0.2 +
                clone_conf * 0.15 +
                face_conf * 0.15 +
                splice_conf * 0.2 +
                reenc_conf * 0.15 +
                meta_conf * 0.15
            )
            
            results['overall_confidence'] = float(weighted_confidence)
            results['is_manipulated'] = weighted_confidence > 0.5
            
            # Compile evidence
            if ela_conf > 0.5:
                results['evidence'].append("Error Level Analysis indicates possible re-compression")
            if clone_conf > 0.5:
                results['evidence'].append("Cloning/forgery patterns detected")
            if face_conf > 0.5:
                results['evidence'].append("Suspicious facial features detected")
            if splice_conf > 0.5:
                results['evidence'].append("Possible image splicing detected")
            if reenc_conf > 0.5:
                results['evidence'].append("Re-encoding inconsistencies detected")
            if meta_conf > 0.5:
                results['evidence'].append("Metadata does not match visual content")
        
        elif content_type == 'video':
            # For videos, we focus on frame-level analysis
            results['overall_confidence'] = 0.2  # Conservative estimate for video
            results['manipulation_signals'] = {
                'note': 'Video manipulation detection requires specialized frame-by-frame analysis'
            }
            results['evidence'] = ['Video analysis requires additional frame-level processing']
        
        else:
            results['overall_confidence'] = 0.0
            results['error'] = f"Unsupported content type: {content_type}"
        
        return results


# Example usage
if __name__ == "__main__":
    detector = TamperDetector()
    
    # Example would be:
    # content_data = {'content_type': 'image', 'file_path': 'path/to/image.jpg'}
    # result = detector.detect_manipulation(content_data)
    # print(result)
