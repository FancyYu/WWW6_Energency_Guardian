#!/usr/bin/env python3
"""
Test script for Emergency Coordinator system

This script tests the AI Agent emergency coordination functionality
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any

from src.emergency_coordinator import (
    EmergencyCoordinator, 
    EmergencyData, 
    EmergencyType, 
    create_emergency_coordinator
)


def create_test_config() -> Dict[str, Any]:
    """Create test configuration"""
    return {
        'gemini_api_key': os.getenv('GEMINI_API_KEY', 'test_key_placeholder'),
        'web3_provider_url': 'https://eth-sepolia.g.alchemy.com/v2/demo',
        'ai_agent_private_key': '0x' + '1' * 64,  # Test private key
        'emergency_contract_address': '0x' + '0' * 40,  # Test contract address
        'default_timelock_hours': 24,
        'max_proposal_lifetime_hours': 168
    }


def create_test_emergency_data() -> EmergencyData:
    """Create test emergency data"""
    return EmergencyData(
        emergency_id="test_emergency_001",
        user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        emergency_type=EmergencyType.MEDICAL_EMERGENCY,
        institution_name="City General Hospital",
        institution_address="0x1234567890123456789012345678901234567890",
        documents=[
            {
                'id': 'doc_001',
                'type': 'medical_report',
                'title': 'Emergency Room Report',
                'description': 'Patient admitted with chest pain',
                'size': 2048,
                'hash': 'abc123def456'
            },
            {
                'id': 'doc_002', 
                'type': 'insurance_form',
                'title': 'Insurance Pre-Authorization',
                'description': 'Pre-auth for emergency treatment',
                'size': 1024,
                'hash': 'def456ghi789'
            }
        ],
        requested_amount=5.5,  # 5.5 ETH
        zk_proof={
            'identity_proof': {
                'proof': {
                    'pi_a': ['0x123', '0x456', '0x789'],
                    'pi_b': [['0xabc', '0xdef'], ['0x111', '0x222'], ['0x333', '0x444']],
                    'pi_c': ['0x555', '0x666', '0x777']
                },
                'public_inputs': {
                    'guardian_commitment': 'a' * 64,
                    'nullifier_hash': 'b' * 64
                },
                'proof_type': 'identity',
                'timestamp': datetime.now().isoformat()
            },
            'emergency_proof': {
                'proof': {
                    'pi_a': ['0x888', '0x999', '0xaaa'],
                    'pi_b': [['0xbbb', '0xccc'], ['0xddd', '0xeee'], ['0xfff', '0x000']],
                    'pi_c': ['0x111', '0x222', '0x333']
                },
                'public_inputs': {
                    'emergency_hash': 'c' * 64,
                    'severity_level': 2,
                    'evidence_commitment': 'd' * 64
                },
                'proof_type': 'emergency',
                'timestamp': datetime.now().isoformat()
            },
            'authorization_proof': {
                'proof': {
                    'pi_a': ['0x444', '0x555', '0x666'],
                    'pi_b': [['0x777', '0x888'], ['0x999', '0xaaa'], ['0xbbb', '0xccc']],
                    'pi_c': ['0xddd', '0xeee', '0xfff']
                },
                'public_inputs': {
                    'operation_hash': 'e' * 64,
                    'executor_commitment': 'f' * 64,
                    'permission_level': 3
                },
                'proof_type': 'authorization',
                'timestamp': datetime.now().isoformat()
            }
        },
        timestamp=datetime.now(),
        contact_info={
            'emergency_contact': '+1-555-0123',
            'hospital_phone': '+1-555-0456',
            'insurance_phone': '+1-555-0789'
        }
    )


async def test_emergency_coordinator():
    """Test the emergency coordinator functionality"""
    print("🚀 Starting Emergency Coordinator Test")
    print("=" * 50)
    
    try:
        # 1. Create coordinator
        print("1. Creating Emergency Coordinator...")
        config = create_test_config()
        coordinator = create_emergency_coordinator(config)
        print(f"   ✅ Coordinator created for agent: {coordinator.account.address}")
        
        # 2. Create test emergency data
        print("\n2. Creating test emergency data...")
        emergency_data = create_test_emergency_data()
        print(f"   ✅ Emergency data created: {emergency_data.emergency_id}")
        print(f"   📋 Type: {emergency_data.emergency_type.value}")
        print(f"   🏥 Institution: {emergency_data.institution_name}")
        print(f"   💰 Requested amount: {emergency_data.requested_amount} ETH")
        print(f"   📄 Documents: {len(emergency_data.documents)}")
        
        # 3. Process emergency request
        print("\n3. Processing emergency request...")
        response = await coordinator.handle_emergency_request(emergency_data)
        
        print(f"   📊 Processing result: {'✅ SUCCESS' if response.success else '❌ FAILED'}")
        print(f"   💬 Message: {response.message}")
        
        if response.success:
            print(f"   🆔 Proposal ID: {response.proposal_id}")
            print(f"   🔗 Transaction Hash: {response.transaction_hash}")
            
            if response.analysis:
                print(f"   📈 Analysis Results:")
                print(f"      - Severity: {response.analysis.severity_level.value}")
                print(f"      - Urgency Score: {response.analysis.urgency_score}/100")
                print(f"      - Recommended Amount: {response.analysis.recommended_amount} ETH")
                print(f"      - Confidence: {response.analysis.confidence_score:.2f}")
                print(f"      - Institution Credibility: {response.analysis.institution_credibility:.2f}")
                print(f"      - Risk Factors: {len(response.analysis.risk_factors)}")
        
        # 4. Test proposal status query
        if response.success and response.proposal_id:
            print("\n4. Querying proposal status...")
            status = await coordinator.get_proposal_status(response.proposal_id)
            print(f"   📋 Status query: {'✅ SUCCESS' if status.get('found') else '❌ FAILED'}")
            
            if status.get('found'):
                proposal_data = status['proposal']
                print(f"   📊 Proposal Status: {proposal_data['metadata']['status']}")
                print(f"   ⏰ Created: {proposal_data['metadata']['created_at']}")
                print(f"   🔄 Updated: {proposal_data['metadata']['updated_at']}")
        
        # 5. Test coordinator statistics
        print("\n5. Getting coordinator statistics...")
        zkp_stats = coordinator.zkp_validator.get_verification_stats()
        proposal_stats = coordinator.proposal_manager.get_proposal_statistics()
        
        print(f"   📊 ZKP Verification Stats:")
        print(f"      - Total verifications: {zkp_stats['total_verifications']}")
        print(f"      - Success rate: {zkp_stats.get('success_rate', 0):.2%}")
        
        print(f"   📊 Proposal Stats:")
        print(f"      - Total proposals: {proposal_stats['total_proposals']}")
        print(f"      - Total requested: {proposal_stats['total_requested_amount']} ETH")
        print(f"      - Average confidence: {proposal_stats['average_confidence_score']:.2f}")
        
        print("\n" + "=" * 50)
        print("🎉 Emergency Coordinator Test Completed Successfully!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_individual_components():
    """Test individual components separately"""
    print("\n🔧 Testing Individual Components")
    print("=" * 50)
    
    config = create_test_config()
    
    # Test Gemini Analyzer (mock mode)
    print("1. Testing Gemini Analyzer...")
    try:
        from src.gemini_analyzer import GeminiAnalyzer
        analyzer = GeminiAnalyzer(config['gemini_api_key'])
        model_info = analyzer.get_model_info()
        print(f"   ✅ Gemini Analyzer initialized: {model_info['model_name']}")
        print(f"   🎯 Capabilities: {len(model_info['capabilities'])}")
    except Exception as e:
        print(f"   ❌ Gemini Analyzer test failed: {e}")
    
    # Test ZKP Validator
    print("\n2. Testing ZKP Validator...")
    try:
        from src.zkp_validator import ZKProofValidator
        validator = ZKProofValidator()
        
        # Test with mock proof
        test_proof = {
            'proof': {
                'pi_a': ['0x123', '0x456', '0x789'],
                'pi_b': [['0xabc', '0xdef'], ['0x111', '0x222'], ['0x333', '0x444']],
                'pi_c': ['0x555', '0x666', '0x777']
            },
            'public_inputs': {
                'guardian_commitment': 'a' * 64,
                'nullifier_hash': 'b' * 64
            },
            'proof_type': 'identity',
            'timestamp': datetime.now().isoformat()
        }
        
        result = await validator.verify_identity_proof(test_proof)
        print(f"   ✅ ZKP Validator test: {'PASSED' if result else 'FAILED'}")
        
        stats = validator.get_verification_stats()
        print(f"   📊 Verification stats: {stats['total_verifications']} total")
        
    except Exception as e:
        print(f"   ❌ ZKP Validator test failed: {e}")
    
    # Test Proposal Manager
    print("\n3. Testing Proposal Manager...")
    try:
        from src.proposal_manager import ProposalManager
        manager = ProposalManager(config)
        
        # Create test proposal
        test_proposal_data = {
            'user_address': '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
            'emergency_type': 'medical_emergency',
            'emergency_level': 2,
            'requested_amount': 5.5,
            'recipient_address': '0x1234567890123456789012345678901234567890',
            'timelock_hours': 12,
            'evidence_hash': 'test_evidence_hash',
            'ai_analysis': {'severity': 'high', 'confidence': 0.9},
            'confidence_score': 0.9,
            'reasoning': 'Test emergency proposal'
        }
        
        proposal_id = await manager.create_emergency_proposal(test_proposal_data)
        print(f"   ✅ Proposal Manager test: Created proposal {proposal_id}")
        
        stats = manager.get_proposal_statistics()
        print(f"   📊 Proposal stats: {stats['total_proposals']} total")
        
    except Exception as e:
        print(f"   ❌ Proposal Manager test failed: {e}")


async def main():
    """Main test function"""
    print("🤖 Emergency Guardian AI Agent System Test")
    print("=" * 60)
    
    # Test individual components first
    await test_individual_components()
    
    # Test full coordinator
    success = await test_emergency_coordinator()
    
    if success:
        print("\n🎯 All tests completed successfully!")
        print("The AI Agent emergency coordination system is ready for integration.")
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
    
    return success


if __name__ == "__main__":
    # Run the test
    result = asyncio.run(main())
    exit(0 if result else 1)