"""
Main entry point for the AI Content Authenticity Verification System
"""
import argparse
import sys
import os
from verification_engine.verifier import VerificationEngine
from identity.identity_manager import IdentityManager
from blockchain.blockchain import Blockchain
from utils.security import SecurityMeasures, ThreatModel
import json


def print_system_info():
    """Print system information and capabilities"""
    print("=" * 60)
    print("AI Content Authenticity Verification System")
    print("Local-First, Zero-Cost Solution")
    print("=" * 60)
    print("System Capabilities:")
    print("- Content ingestion for images and videos")
    print("- Multi-signal AI generation detection")
    print("- Manipulation and tampering detection")
    print("- Blockchain-based content registration")
    print("- Cryptographic identity management")
    print("- Comprehensive verification reporting")
    print("- Local web interface")
    print("=" * 60)


def test_system():
    """Test the complete system with sample operations"""
    print("\nTesting System Components...\n")
    
    # Initialize system components
    verifier = VerificationEngine()
    identity_manager = IdentityManager()
    blockchain = Blockchain()
    security = SecurityMeasures()
    
    print("✓ Verification engine initialized")
    print("✓ Identity manager initialized") 
    print("✓ Blockchain initialized")
    print("✓ Security measures loaded")
    
    # Test threat model
    threat_model = ThreatModel()
    threats = threat_model.get_threat_assessment()
    print(f"✓ Threat model loaded with {len(threats['threat_model'])} identified threats")
    
    # Test identity creation
    print("\nTesting identity creation...")
    try:
        identity_info = identity_manager.register_creator_identity("test_creator")
        print(f"✓ Created test identity: {identity_info['identity_name']}")
    except Exception as e:
        print(f"✗ Failed to create identity: {e}")
    
    # Test blockchain genesis
    print(f"\nBlockchain status:")
    print(f"- Chain length: {len(blockchain.chain)}")
    print(f"- Is valid: {blockchain.is_valid_chain()}")
    
    # Test security measures
    print(f"\nSecurity measures:")
    nonce = security.generate_nonce()
    print(f"- Generated nonce: {nonce[:16]}...")
    
    print("\nSystem test completed successfully!")


def run_web_server():
    """Start the web interface"""
    from ui.app import app
    print("\nStarting web server...")
    print("Access the system at: http://127.0.0.1:5000")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        app.run(debug=True, host='127.0.0.1', port=5000)
    except KeyboardInterrupt:
        print("\nWeb server stopped.")


def verify_single_file(file_path):
    """Verify a single file"""
    if not os.path.exists(file_path):
        print(f"Error: File does not exist: {file_path}")
        return
    
    print(f"Verifying file: {file_path}")
    
    try:
        verifier = VerificationEngine()
        result = verifier.verify_content(file_path)
        
        print("\nVerification Result:")
        print("=" * 40)
        print(f"Content Type: {result['content_info']['content_type']}")
        print(f"SHA-256 Hash: {result['content_info']['sha256_hash']}")
        print(f"Overall Confidence: {result['overall_confidence']:.2f}")
        print(f"Is Authentic: {result['is_authentic']}")
        print(f"Authenticity Level: {result['final_assessment']['authenticity_level']}")
        print(f"Primary Method: {result['primary_method']}")
        
        print(f"\nDetailed Assessment:")
        print(f"- Description: {result['final_assessment']['authenticity_description']}")
        print(f"- Confidence Level: {result['final_assessment']['confidence_level']}")
        
        print(f"\nEvidence Found:")
        for evidence in result['evidence']:
            print(f"- {evidence}")
        
        print(f"\nAI Generation Detection Confidence: {result['ai_generation_detection']['overall_confidence']:.2f}")
        print(f"Tampering Detection Confidence: {result['tampering_detection']['overall_confidence']:.2f}")
        print(f"Blockchain Status: {result['blockchain_verification']['status']}")
        
    except Exception as e:
        print(f"Error verifying file: {e}")


def register_content(file_path, identity_name):
    """Register content in the blockchain"""
    if not os.path.exists(file_path):
        print(f"Error: File does not exist: {file_path}")
        return
    
    print(f"Registering content: {file_path}")
    
    try:
        verifier = VerificationEngine()
        identity_manager = IdentityManager()
        
        # Load or create identity
        try:
            identity = identity_manager.load_identity(identity_name)
        except FileNotFoundError:
            print(f"Identity '{identity_name}' not found, creating new one...")
            identity_info = identity_manager.register_creator_identity(identity_name)
            identity = identity_manager.load_identity(identity_name)
        
        # Register content
        result = verifier.register_original_content(file_path, identity)
        
        print("\nRegistration Result:")
        print("=" * 40)
        print(f"Status: {result['status']}")
        print(f"Message: {result['message']}")
        print(f"Content Hash: {result['content_hash']}")
        print(f"Registration Confirmed: {result['registration_confirmed']}")
        
    except Exception as e:
        print(f"Error registering content: {e}")


def show_limitations():
    """Display system limitations and constraints"""
    print("\n" + "=" * 60)
    print("SYSTEM LIMITATIONS AND CONSTRAINTS")
    print("=" * 60)
    
    limitations = [
        "1. AI Detection Accuracy:",
        "   - Current models have ~70-85% accuracy on known datasets",
        "   - Performance degrades on novel AI generation techniques",
        "   - May produce false positives on heavily processed real content",
        "   - Cannot guarantee detection of all AI-generated content",
        
        "\n2. Blockchain Limitations:",
        "   - Local blockchain doesn't provide global consensus",
        "   - Registration only proves existence from the time of registration",
        "   - Does not prevent content from being created elsewhere first",
        "   - Relies on users registering original content voluntarily",
        
        "\n3. Technical Constraints:",
        "   - Processing large videos may be slow on consumer hardware",
        "   - Memory requirements increase with content size",
        "   - Some detection methods require significant computational resources",
        
        "\n4. Security Considerations:",
        "   - Local keys can be compromised if device is compromised",
        "   - No protection against deep fake videos of real people",
        "   - Sophisticated attackers may develop countermeasures",
        "   - Replay attacks possible without network-level protections",
        
        "\n5. Scope Limitations:",
        "   - Cannot verify physical authenticity of depicted scenes",
        "   - Cannot prove consent of depicted individuals",
        "   - Cannot detect all forms of digital manipulation",
        "   - Effectiveness depends on quality of original content",
        
        "\n6. Operational Constraints:",
        "   - Requires content to be registered to prove originality",
        "   - Near-duplicate detection is limited without large databases",
        "   - Performance varies based on content complexity",
        "   - Accuracy improves with more diverse training data"
    ]
    
    for item in limitations:
        print(item)
    
    print("\nDespite these limitations, the system provides valuable")
    print("protection against common forms of AI-generated and manipulated content.")
    print("=" * 60)


def show_future_upgrade_path():
    """Display future upgrade possibilities"""
    print("\n" + "=" * 60)
    print("FUTURE UPGRADE PATH")
    print("=" * 60)
    
    upgrades = [
        "1. Public Blockchain Integration:",
        "   - Sync local blockchain to public networks",
        "   - Cross-reference with global registries",
        "   - Implement distributed consensus mechanisms",
        
        "\n2. Advanced Detection Models:",
        "   - Integrate state-of-the-art forensic models",
        "   - Implement ensemble methods for improved accuracy",
        "   - Add real-time model updates",
        
        "\n3. Enhanced Features:",
        "   - Watermarking integration",
        "   - C2PA (Content Authenticity Initiative) compatibility",
        "   - Advanced biometric verification",
        "   - Metadata provenance tracking",
        
        "\n4. Scalability Improvements:",
        "   - Distributed processing for large volumes",
        "   - Cloud integration options",
        "   - API for third-party integrations",
        
        "\n5. Security Enhancements:",
        "   - Hardware security module integration",
        "   - Advanced threat detection",
        "   - Anomaly detection for unusual patterns"
    ]
    
    for item in upgrades:
        print(item)
    
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='AI Content Authenticity Verification System')
    parser.add_argument('--test', action='store_true', help='Run system tests')
    parser.add_argument('--web', action='store_true', help='Start web server')
    parser.add_argument('--verify', type=str, help='Verify a single file')
    parser.add_argument('--register', nargs=2, metavar=('FILE', 'IDENTITY'), 
                       help='Register content with identity')
    parser.add_argument('--show-limitations', action='store_true', 
                       help='Show system limitations')
    parser.add_argument('--show-upgrades', action='store_true', 
                       help='Show future upgrade path')
    
    args = parser.parse_args()
    
    print_system_info()
    
    if args.test:
        test_system()
    elif args.web:
        run_web_server()
    elif args.verify:
        verify_single_file(args.verify)
    elif args.register:
        register_content(args.register[0], args.register[1])
    elif args.show_limitations:
        show_limitations()
    elif args.show_upgrades:
        show_future_upgrade_path()
    else:
        # Default: show help and system info
        print("\nUsage examples:")
        print("  python main.py --test                    # Run system tests")
        print("  python main.py --web                     # Start web server")
        print("  python main.py --verify path/to/file     # Verify a file")
        print("  python main.py --register path/to/file identity_name  # Register content")
        print("  python main.py --show-limitations        # Show system limitations")
        print("  python main.py --show-upgrades          # Show upgrade path")
        print("\nFor detailed help: python main.py --help")


if __name__ == "__main__":
    main()
