"""
AI Generation Detection Engine
Implements multi-signal detection for identifying AI-generated content
"""
import numpy as np
import cv2
from PIL import Image
import pywt
from scipy import stats
from typing import Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')


class AIGenerationDetector:
    """Multi-signal detector for AI-generated content"""
    
    def __init__(self):
        self.frequency_threshold = 0.6
        self.noise_threshold = 0.6
        self.artifact_threshold = 0.6
        self.inconsistency_threshold = 0.7
    
    def detect_frequency_artifacts(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect frequency domain artifacts typical in AI-generated images
        Uses FFT to identify unnatural frequency patterns
        """
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Apply FFT
        f_transform = np.fft.fft2(img)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.log(np.abs(f_shift) + 1)
        
        # Look for grid-like patterns or unnatural regularities in frequency domain
        # AI-generated images often have unnatural frequency distributions
        mean_val = np.mean(magnitude_spectrum)
        std_val = np.std(magnitude_spectrum)
        
        # Calculate regularity in frequency spectrum (AI images often have very regular patterns)
        # Compare to expected distribution for natural images
        hist, _ = np.histogram(magnitude_spectrum.flatten(), bins=50)
        uniformity_score = 1 - (np.std(hist) / (np.mean(hist) + 1e-6))
        
        # Higher uniformity suggests more artificial patterns
        confidence = min(1.0, uniformity_score * 1.5)
        
        details = {
            "mean_magnitude": float(mean_val),
            "std_magnitude": float(std_val),
            "uniformity_score": float(uniformity_score),
            "frequency_pattern_analysis": "Regular patterns detected" if uniformity_score > 0.5 else "Natural variation observed"
        }
        
        return confidence, details
    
    def detect_noise_residual_patterns(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Analyze noise residual patterns that differ between real and AI-generated images
        """
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Convert to float and normalize
        img_float = img.astype(np.float32) / 255.0
        
        # Apply JPEG compression simulation to extract residuals
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 95]
        _, img_jpeg = cv2.imencode('.jpg', (img_float * 255).astype(np.uint8), encode_param)
        img_decoded = cv2.imdecode(img_jpeg, cv2.IMREAD_COLOR).astype(np.float32) / 255.0
        
        # Calculate residual (difference between original and compressed)
        residual = img_float - img_decoded
        
        # AI-generated images often have very uniform or structured residuals
        residual_std = np.std(residual)
        residual_mean = np.mean(np.abs(residual))
        
        # Analyze spatial correlation in residuals
        # Real images typically have more random residual patterns
        # AI images often have structured residuals
        corr_x = np.corrcoef(residual[:, :-1].flatten(), residual[:, 1:].flatten())[0, 1]
        corr_y = np.corrcoef(residual[:-1, :].flatten(), residual[1:, :].flatten())[0, 1]
        
        # High correlation in residuals suggests artificial origin
        correlation_score = (abs(corr_x) + abs(corr_y)) / 2
        confidence = min(1.0, correlation_score * 1.2)
        
        details = {
            "residual_mean": float(residual_mean),
            "residual_std": float(residual_std),
            "correlation_x": float(corr_x),
            "correlation_y": float(corr_y),
            "correlation_score": float(correlation_score),
            "noise_pattern_analysis": "Structured noise patterns detected" if correlation_score > 0.3 else "Random noise patterns observed"
        }
        
        return confidence, details
    
    def detect_gan_fingerprints(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect GAN-specific fingerprints and artifacts
        """
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Convert to YUV color space to analyze chrominance and luminance separately
        img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
        y_channel = img_yuv[:,:,0].astype(np.float32)
        
        # Analyze wavelet coefficients for GAN artifacts
        coeffs = pywt.dwt2(y_channel, 'db4')
        cA, (cH, cV, cD) = coeffs
        
        # GAN images often show unusual patterns in wavelet coefficients
        # Calculate statistics on detail coefficients
        h_energy = np.sum(cH**2) / cH.size
        v_energy = np.sum(cV**2) / cV.size
        d_energy = np.sum(cD**2) / cD.size
        
        # Calculate entropy of coefficients (AI images often have lower entropy)
        def calculate_entropy(coeffs):
            # Flatten and create histogram
            flat_coeffs = coeffs.flatten()
            hist, _ = np.histogram(flat_coeffs, bins=256)
            hist = hist[hist > 0]  # Remove zero values
            prob = hist / np.sum(hist)
            entropy = -np.sum(prob * np.log2(prob + 1e-10))
            return entropy
        
        h_entropy = calculate_entropy(cH)
        v_entropy = calculate_entropy(cV)
        d_entropy = calculate_entropy(cD)
        
        # Lower entropy in detail coefficients may indicate artificial origin
        avg_entropy = (h_entropy + v_entropy + d_entropy) / 3
        # Normalize based on expected range
        entropy_score = 1 - (avg_entropy / 8.0)  # Assuming max entropy ~8 for 8-bit
        entropy_score = max(0, entropy_score)
        
        details = {
            "horizontal_energy": float(h_energy),
            "vertical_energy": float(v_energy),
            "diagonal_energy": float(d_energy),
            "horizontal_entropy": float(h_entropy),
            "vertical_entropy": float(v_entropy),
            "diagonal_entropy": float(d_entropy),
            "average_entropy": float(avg_entropy),
            "entropy_score": float(entropy_score),
            "gan_fingerprint_analysis": "Low entropy patterns detected" if entropy_score > 0.6 else "Natural entropy levels observed"
        }
        
        # Confidence based on entropy (lower entropy suggests AI generation)
        confidence = min(1.0, entropy_score * 1.5)
        
        return confidence, details
    
    def detect_diffusion_artifacts(self, image_path: str) -> Tuple[float, Dict[str, Any]]:
        """
        Detect artifacts specific to diffusion models
        """
        img = cv2.imread(image_path)
        if img is None:
            return 0.0, {"error": "Could not load image"}
        
        # Convert to LAB color space for better analysis of lightness variations
        img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_channel = img_lab[:,:,0].astype(np.float32)
        
        # Look for characteristic patterns in lightness channel
        # Diffusion models sometimes show subtle periodic patterns
        
        # Calculate local variance in small patches
        patch_size = 8
        height, width = l_channel.shape
        variances = []
        
        for i in range(0, height - patch_size, patch_size):
            for j in range(0, width - patch_size, patch_size):
                patch = l_channel[i:i+patch_size, j:j+patch_size]
                patch_var = np.var(patch)
                variances.append(patch_var)
        
        # Calculate statistics of patch variances
        var_mean = np.mean(variances)
        var_std = np.std(variances)
        
        # AI images may show more uniform patch variances
        # Calculate coefficient of variation (std/mean)
        cv = var_std / (var_mean + 1e-6)
        
        # Low coefficient of variation suggests uniformity typical of AI generation
        uniformity_score = max(0, 1 - cv)  # More uniform = higher score
        confidence = min(1.0, uniformity_score * 1.5)
        
        details = {
            "patch_variance_mean": float(var_mean),
            "patch_variance_std": float(var_std),
            "coefficient_of_variation": float(cv),
            "uniformity_score": float(uniformity_score),
            "diffusion_artifact_analysis": "Uniform patch characteristics detected" if uniformity_score > 0.4 else "Variable patch characteristics observed"
        }
        
        return confidence, details
    
    def analyze_frame_consistency(self, video_frames: list) -> Tuple[float, Dict[str, Any]]:
        """
        Analyze consistency across video frames for AI generation signs
        """
        if len(video_frames) < 2:
            return 0.0, {"error": "Need at least 2 frames for consistency analysis"}
        
        inconsistencies = []
        
        for i in range(1, len(video_frames)):
            frame1 = video_frames[i-1]
            frame2 = video_frames[i]
            
            # Calculate structural similarity (SSIM) between frames
            # Low SSIM might indicate inconsistency
            gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
            
            # Simple difference metric
            diff = cv2.absdiff(gray1, gray2)
            diff_ratio = np.sum(diff > 30) / (gray1.shape[0] * gray1.shape[1])
            
            # Also calculate histogram similarity
            hist1 = cv2.calcHist([gray1], [0], None, [256], [0, 256])
            hist2 = cv2.calcHist([gray2], [0], None, [256], [0, 256])
            
            # Compare histograms using correlation
            hist_corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
            
            # Combine metrics
            inconsistency_score = (1 - hist_corr) * 0.7 + diff_ratio * 0.3
            inconsistencies.append(inconsistency_score)
        
        avg_inconsistency = np.mean(inconsistencies)
        
        # Very high or very low inconsistency can be suspicious
        # Natural videos have moderate inconsistency
        if avg_inconsistency < 0.1 or avg_inconsistency > 0.8:
            confidence = min(1.0, avg_inconsistency * 1.5)
        else:
            confidence = 0.1  # Low confidence in AI generation
        
        details = {
            "frame_count": len(video_frames),
            "average_inconsistency": float(avg_inconsistency),
            "inconsistency_std": float(np.std(inconsistencies)),
            "min_inconsistency": float(min(inconsistencies)),
            "max_inconsistency": float(max(inconsistencies)),
            "frame_consistency_analysis": "Abnormal frame-to-frame consistency detected" if avg_inconsistency < 0.1 or avg_inconsistency > 0.8 else "Normal frame-to-frame consistency observed"
        }
        
        return confidence, details
    
    def detect_ai_generated(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to detect if content is AI-generated using multiple signals
        """
        results = {
            'is_ai_generated': False,
            'overall_confidence': 0.0,
            'detection_signals': {},
            'evidence': [],
            'method_used': 'multi_signal_analysis'
        }
        
        content_type = content_data.get('content_type', 'unknown')
        
        if content_type == 'image':
            image_path = content_data['file_path']
            
            # Run all detection methods
            freq_conf, freq_details = self.detect_frequency_artifacts(image_path)
            noise_conf, noise_details = self.detect_noise_residual_patterns(image_path)
            gan_conf, gan_details = self.detect_gan_fingerprints(image_path)
            diff_conf, diff_details = self.detect_diffusion_artifacts(image_path)
            
            # Store individual results
            results['detection_signals'] = {
                'frequency_analysis': {'confidence': freq_conf, 'details': freq_details},
                'noise_analysis': {'confidence': noise_conf, 'details': noise_details},
                'gan_fingerprint': {'confidence': gan_conf, 'details': gan_details},
                'diffusion_artifact': {'confidence': diff_conf, 'details': diff_details}
            }
            
            # Aggregate confidence scores
            confidences = [freq_conf, noise_conf, gan_conf, diff_conf]
            avg_confidence = np.mean(confidences)
            
            # Weighted scoring - some signals might be more reliable
            weighted_confidence = (
                freq_conf * 0.25 +
                noise_conf * 0.25 +
                gan_conf * 0.25 +
                diff_conf * 0.25
            )
            
            results['overall_confidence'] = float(weighted_confidence)
            results['is_ai_generated'] = weighted_confidence > 0.5
            
            # Compile evidence
            if freq_conf > 0.5:
                results['evidence'].append("Unnatural frequency domain patterns detected")
            if noise_conf > 0.5:
                results['evidence'].append("Suspicious noise residual patterns detected")
            if gan_conf > 0.5:
                results['evidence'].append("GAN fingerprint patterns detected")
            if diff_conf > 0.5:
                results['evidence'].append("Diffusion model artifacts detected")
        
        elif content_type == 'video':
            # For videos, we also check frame consistency
            frame_samples = content_data.get('frame_sample_hashes', [])
            if frame_samples:
                # Extract actual frames for analysis (assuming they're available somehow)
                # This is a simplified approach - in practice, we'd need access to the actual frames
                # Here we'll simulate using the frame hashes
                # In a real implementation, we'd have the actual frame data
                pass
            
            # For now, treat video similarly to image but include frame consistency
            # In a real system, we'd need to extract frames from the video for analysis
            results['overall_confidence'] = 0.3  # Conservative estimate for video
            results['detection_signals'] = {
                'note': 'Video analysis requires actual frame data extraction for full analysis'
            }
        
        else:
            results['overall_confidence'] = 0.0
            results['error'] = f"Unsupported content type: {content_type}"
        
        return results


# Example usage
if __name__ == "__main__":
    detector = AIGenerationDetector()
    
    # Example would be:
    # content_data = {'content_type': 'image', 'file_path': 'path/to/image.jpg'}
    # result = detector.detect_ai_generated(content_data)
    # print(result)
