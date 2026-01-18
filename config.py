"""
Configuration settings for the AI Content Authenticity Verification System
"""

import os
from pathlib import Path

# Base configuration
BASE_DIR = Path(__file__).resolve().parent.parent

# Data storage paths
DATA_DIR = BASE_DIR / "data"
BLOCKCHAIN_DIR = DATA_DIR / "blockchain"
CONTENT_DIR = DATA_DIR / "content"
CACHE_DIR = DATA_DIR / "cache"

# Model paths
MODELS_DIR = BASE_DIR / "models"

# Blockchain configuration
BLOCKCHAIN_FILE = BLOCKCHAIN_DIR / "ledger.json"
GENESIS_BLOCK_HASH = "genesis_block_hash_placeholder"

# Verification thresholds
AI_DETECTION_THRESHOLD = 0.7  # Confidence threshold for AI detection
MANIPULATION_THRESHOLD = 0.6  # Confidence threshold for manipulation detection
VERIFICATION_CONFIDENCE_MIN = 0.5  # Minimum confidence for verification

# Supported file formats
SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']
SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.mkv']

# Processing settings
MAX_CONTENT_SIZE = 50 * 1024 * 1024  # 50MB max file size
FRAME_SAMPLE_RATE = 0.1  # Sample 10% of frames for video analysis

# Security settings
HASH_ALGORITHM = 'sha256'
SIGNATURE_ALGORITHM = 'RSA-SHA256'
KEY_SIZE = 2048  # RSA key size in bits

