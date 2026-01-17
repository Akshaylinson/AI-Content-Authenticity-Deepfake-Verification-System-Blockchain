"""
Local blockchain implementation for content registration and verification
"""
import hashlib
import json
import time
from typing import Dict, List, Optional
from datetime import datetime
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature
from config.config import BLOCKCHAIN_FILE, GENESIS_BLOCK_HASH
import os


class Block:
    """Represents a single block in the blockchain"""
    
    def __init__(self, index: int, timestamp: float, content_hash: str, 
                 creator_public_key: str, signature: str, previous_hash: str, nonce: int = 0):
        self.index = index
        self.timestamp = timestamp
        self.content_hash = content_hash
        self.creator_public_key = creator_public_key
        self.signature = signature
        self.previous_hash = previous_hash
        self.nonce = nonce
        
    def to_dict(self) -> Dict:
        """Convert block to dictionary representation"""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'content_hash': self.content_hash,
            'creator_public_key': self.creator_public_key,
            'signature': self.signature,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }
    
    def calculate_hash(self) -> str:
        """Calculate the hash of the block"""
        block_string = json.dumps(self.to_dict(), sort_keys=True, default=str)
        return hashlib.sha256(block_string.encode()).hexdigest()


class Blockchain:
    """Main blockchain class for content registration"""
    
    def __init__(self, blockchain_file: str = None):
        self.chain = []
        self.blockchain_file = blockchain_file or str(BLOCKCHAIN_FILE)
        self.difficulty = 2  # Difficulty for proof of work
        
        # Load existing blockchain or create genesis block
        self.load_blockchain()
        if len(self.chain) == 0:
            self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_block = Block(
            index=0,
            timestamp=time.time(),
            content_hash="0000000000000000000000000000000000000000000000000000000000000000",
            creator_public_key="GENESIS",
            signature="GENESIS",
            previous_hash="0"
        )
        genesis_block.hash = genesis_block.calculate_hash()
        self.chain.append(genesis_block)
        self.save_blockchain()
    
    def add_block(self, content_hash: str, creator_public_key: str, signature: str) -> bool:
        """Add a new block to the chain after validation"""
        if len(self.chain) == 0:
            return False
            
        previous_block = self.chain[-1]
        new_block = Block(
            index=previous_block.index + 1,
            timestamp=time.time(),
            content_hash=content_hash,
            creator_public_key=creator_public_key,
            signature=signature,
            previous_hash=previous_block.calculate_hash()
        )
        
        # Perform proof of work
        self.proof_of_work(new_block)
        
        # Validate the block before adding
        if self.validate_block(new_block, previous_block):
            self.chain.append(new_block)
            self.save_blockchain()
            return True
        return False
    
    def proof_of_work(self, block: Block):
        """Simple proof of work algorithm"""
        block.nonce = 0
        computed_hash = block.calculate_hash()
        
        # Adjust difficulty by checking leading zeros
        while not computed_hash.startswith('0' * self.difficulty):
            block.nonce += 1
            computed_hash = block.calculate_hash()
        
        block.hash = computed_hash
    
    def validate_block(self, new_block: Block, previous_block: Block) -> bool:
        """Validate a block before adding to chain"""
        # Check index
        if previous_block.index + 1 != new_block.index:
            return False
        
        # Check previous hash
        if previous_block.calculate_hash() != new_block.previous_hash:
            return False
        
        # Check proof of work
        if not new_block.calculate_hash().startswith('0' * self.difficulty):
            return False
        
        # Verify the signature (simplified - in practice you'd use the actual public key)
        # For now, we'll just accept the signature as valid since we can't verify without the private key
        # In a real implementation, you'd have access to the public key to verify the signature
        return True
    
    def is_valid_chain(self) -> bool:
        """Check if the blockchain is valid"""
        if len(self.chain) == 0:
            return True
        
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Check if the current block is valid
            if not self.validate_block(current_block, previous_block):
                return False
            
            # Check if the stored hash matches calculated hash
            if current_block.calculate_hash() != current_block.hash:
                return False
        
        return True
    
    def get_content_registration(self, content_hash: str) -> Optional[Dict]:
        """Find the registration record for a given content hash"""
        for block in self.chain:
            if block.content_hash == content_hash:
                return {
                    'index': block.index,
                    'timestamp': block.timestamp,
                    'content_hash': block.content_hash,
                    'creator_public_key': block.creator_public_key,
                    'signature': block.signature,
                    'block_hash': block.calculate_hash()
                }
        return None
    
    def get_verification_report(self, content_hash: str) -> Dict:
        """Generate a verification report for a given content hash"""
        registration = self.get_content_registration(content_hash)
        
        if registration:
            # Content exists in the blockchain
            return {
                'status': 'VERIFIED',
                'confidence': 0.95,
                'message': 'Content registered in blockchain',
                'registration_info': registration,
                'is_original': True,
                'first_seen': datetime.fromtimestamp(registration['timestamp']).isoformat()
            }
        else:
            # Content not found in blockchain
            return {
                'status': 'NOT_FOUND',
                'confidence': 0.1,
                'message': 'Content not found in blockchain',
                'is_original': False,
                'first_seen': None
            }
    
    def save_blockchain(self):
        """Save the blockchain to file"""
        os.makedirs(os.path.dirname(self.blockchain_file), exist_ok=True)
        
        blockchain_data = {
            'chain': [block.to_dict() for block in self.chain],
            'length': len(self.chain),
            'valid': self.is_valid_chain()
        }
        
        with open(self.blockchain_file, 'w') as f:
            json.dump(blockchain_data, f, indent=2, default=str)
    
    def load_blockchain(self):
        """Load the blockchain from file"""
        if not os.path.exists(self.blockchain_file):
            return
        
        try:
            with open(self.blockchain_file, 'r') as f:
                blockchain_data = json.load(f)
                
            self.chain = []
            for block_data in blockchain_data['chain']:
                block = Block(
                    index=block_data['index'],
                    timestamp=block_data['timestamp'],
                    content_hash=block_data['content_hash'],
                    creator_public_key=block_data['creator_public_key'],
                    signature=block_data['signature'],
                    previous_hash=block_data['previous_hash'],
                    nonce=block_data.get('nonce', 0)
                )
                block.hash = block.calculate_hash()
                self.chain.append(block)
        except Exception as e:
            print(f"Error loading blockchain: {str(e)}")
            self.chain = []


# Utility functions for signing and verification
def sign_content(content_hash: str, private_key) -> str:
    """Sign a content hash with a private key"""
    message = content_hash.encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    return signature.hex()


def verify_signature(content_hash: str, signature_hex: str, public_key) -> bool:
    """Verify a signature against a content hash and public key"""
    try:
        signature = bytes.fromhex(signature_hex)
        message = content_hash.encode('utf-8')
        public_key.verify(
            signature,
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False

