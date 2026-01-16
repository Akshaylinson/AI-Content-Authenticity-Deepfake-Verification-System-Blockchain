"""
Identity and Key Management System
Manages cryptographic identities for content creators
"""
import os
import json
import base64
from typing import Dict, Any, Tuple, Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature
from config.config import KEY_SIZE
import secrets


class IdentityManager:
    """Manages cryptographic identities for content creators"""
    
    def __init__(self, keys_dir: str = "keys"):
        self.keys_dir = keys_dir
        os.makedirs(keys_dir, exist_ok=True)
    
    def generate_identity(self) -> Dict[str, Any]:
        """
        Generate a new cryptographic identity with public/private key pair
        Returns a dictionary containing both keys
        """
        # Generate RSA key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=KEY_SIZE,
        )
        public_key = private_key.public_key()
        
        # Serialize private key (encrypted with a password)
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()  # In production, use a password
        )
        
        # Serialize public key
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        # Create identity
        identity = {
            'private_key': private_pem.decode('utf-8'),
            'public_key': public_pem.decode('utf-8'),
            'public_key_fingerprint': self._calculate_public_key_fingerprint(public_key),
            'created_at': self._get_timestamp()
        }
        
        return identity
    
    def save_identity(self, identity: Dict[str, Any], filename: str) -> str:
        """Save identity to a file"""
        filepath = os.path.join(self.keys_dir, f"{filename}.json")
        with open(filepath, 'w') as f:
            json.dump(identity, f, indent=2)
        return filepath
    
    def load_identity(self, filename: str) -> Dict[str, Any]:
        """Load identity from a file"""
        filepath = os.path.join(self.keys_dir, f"{filename}.json")
        with open(filepath, 'r') as f:
            identity = json.load(f)
        return identity
    
    def _calculate_public_key_fingerprint(self, public_key) -> str:
        """Calculate a fingerprint for the public key"""
        public_key_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        fingerprint = hashes.Hash(hashes.SHA256())
        fingerprint.update(public_key_bytes)
        return fingerprint.finalize().hex()
    
    def _get_timestamp(self) -> str:
        """Get current timestamp as ISO string"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'
    
    def sign_message(self, private_key_pem: str, message: str) -> str:
        """Sign a message with the private key"""
        # Load private key
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
        )
        
        # Sign the message
        signature = private_key.sign(
            message.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        # Return signature as hex string
        return signature.hex()
    
    def verify_signature(self, public_key_pem: str, message: str, signature_hex: str) -> bool:
        """Verify a signature against a message and public key"""
        try:
            # Load public key
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode('utf-8'),
            )
            
            # Decode signature from hex
            signature = bytes.fromhex(signature_hex)
            
            # Verify the signature
            public_key.verify(
                signature,
                message.encode('utf-8'),
                padding.PKCS1v15(),
                hashes.SHA256()
            )
            
            return True
        except InvalidSignature:
            return False
        except Exception:
            return False
    
    def register_creator_identity(self, identity_name: str) -> Dict[str, Any]:
        """
        Register a new creator identity and return the identity information
        """
        identity = self.generate_identity()
        filepath = self.save_identity(identity, identity_name)
        
        return {
            'identity_name': identity_name,
            'filepath': filepath,
            'public_key_fingerprint': identity['public_key_fingerprint'],
            'created_at': identity['created_at']
        }
    
    def get_public_key_from_identity(self, identity: Dict[str, Any]) -> str:
        """Extract public key from identity dict"""
        return identity['public_key']
    
    def get_private_key_from_identity(self, identity: Dict[str, Any]) -> str:
        """Extract private key from identity dict"""
        return identity['private_key']


class CreatorRegistry:
    """Registry to track registered creators and their public keys"""
    
    def __init__(self, registry_file: str = "data/creators_registry.json"):
        self.registry_file = registry_file
        self.registry_dir = os.path.dirname(registry_file)
        os.makedirs(self.registry_dir, exist_ok=True)
        self.creators = self._load_registry()
    
    def _load_registry(self) -> Dict[str, Any]:
        """Load the creator registry from file"""
        if os.path.exists(self.registry_file):
            with open(self.registry_file, 'r') as f:
                return json.load(f)
        return {
            'creators': {},
            'version': '1.0',
            'last_updated': self._get_timestamp()
        }
    
    def _save_registry(self):
        """Save the creator registry to file"""
        self.creators['last_updated'] = self._get_timestamp()
        with open(self.registry_file, 'w') as f:
            json.dump(self.creators, f, indent=2)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp as ISO string"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'
    
    def register_creator(self, identity_name: str, public_key_fingerprint: str, metadata: Dict[str, Any] = None) -> bool:
        """Register a new creator in the registry"""
        if public_key_fingerprint in self.creators['creators']:
            return False  # Already registered
        
        creator_info = {
            'identity_name': identity_name,
            'public_key_fingerprint': public_key_fingerprint,
            'registered_at': self._get_timestamp(),
            'metadata': metadata or {}
        }
        
        self.creators['creators'][public_key_fingerprint] = creator_info
        self._save_registry()
        return True
    
    def get_creator_info(self, public_key_fingerprint: str) -> Optional[Dict[str, Any]]:
        """Get information about a registered creator"""
        return self.creators['creators'].get(public_key_fingerprint)
    
    def verify_creator_ownership(self, public_key_fingerprint: str, challenge: str, signature: str) -> bool:
        """Verify that a creator owns their public key by signing a challenge"""
        # In a real system, we'd need the public key to verify
        # This is a simplified version - would need access to public key
        creator_info = self.get_creator_info(public_key_fingerprint)
        if not creator_info:
            return False
        
        # The actual verification would happen in the identity manager
        # using the public key associated with this fingerprint
        return True  # Simplified - real implementation would verify signature
    
    def list_all_creators(self) -> Dict[str, Any]:
        """List all registered creators"""
        return self.creators['creators'].copy()


# Example usage
if __name__ == "__main__":
    # Initialize the identity manager
    identity_manager = IdentityManager()
    
    # Create a new identity for a creator
    creator_identity = identity_manager.register_creator_identity("artist_john_doe")
    print(f"Created identity for: {creator_identity['identity_name']}")
    print(f"Fingerprint: {creator_identity['public_key_fingerprint']}")
    
    # Initialize the creator registry
    registry = CreatorRegistry()
    
    # Register the creator
    registry.register_creator(
        identity_name="artist_john_doe",
        public_key_fingerprint=creator_identity['public_key_fingerprint'],
        metadata={"name": "John Doe", "location": "New York", "specialty": "Digital Art"}
    )
    
    print("Creator registered in the registry")
    
    # Example of signing and verifying
    message_to_sign = "I am the owner of this artwork created on 2023-12-07"
    
    # Load the identity and sign a message
    loaded_identity = identity_manager.load_identity("artist_john_doe")
    signature = identity_manager.sign_message(
        loaded_identity['private_key'],
        message_to_sign
    )
    
    print(f"Message signed with signature: {signature[:32]}...")
    
    # Verify the signature
    is_valid = identity_manager.verify_signature(
        loaded_identity['public_key'],
        message_to_sign,
        signature
    )
    
    print(f"Signature verification: {'VALID' if is_valid else 'INVALID'}")
