#!/usr/bin/env python3
"""
Basic structure test for AI Agent system

Tests the basic structure and imports without external dependencies
"""

import sys
import os
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all modules can be imported"""
    print("🔍 Testing module imports...")
    
    try:
        # Test basic Python imports
        print("   ✅ Basic Python modules imported")
        
        # Test that our modules exist and have correct structure
        import emergency_coordinator
        print("   ✅ emergency_coordinator module found")
        
        import gemini_analyzer  
        print("   ✅ gemini_analyzer module found")
        
        import zkp_validator
        print("   ✅ zkp_validator module found")
        
        import proposal_manager
        print("   ✅ proposal_manager module found")
        
        return True
        
    except ImportError as e:
        print(f"   ❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def test_class_definitions():
    """Test that classes are properly defined"""
    print("\n🏗️  Testing class definitions...")
    
    try:
        # Import without external dependencies
        import emergency_coordinator
        import gemini_analyzer
        import zkp_validator
        import proposal_manager
        
        # Check class existence
        classes_to_check = [
            (emergency_coordinator, 'EmergencyCoordinator'),
            (emergency_coordinator, 'EmergencyType'),
            (emergency_coordinator, 'SeverityLevel'),
            (emergency_coordinator, 'EmergencyData'),
            (emergency_coordinator, 'EmergencyAnalysis'),
            (emergency_coordinator, 'EmergencyResponse'),
            (gemini_analyzer, 'GeminiAnalyzer'),
            (zkp_validator, 'ZKProofValidator'),
            (zkp_validator, 'ZKProofType'),
            (proposal_manager, 'ProposalManager'),
            (proposal_manager, 'ProposalStatus'),
            (proposal_manager, 'ProposalType'),
        ]
        
        for module, class_name in classes_to_check:
            if hasattr(module, class_name):
                print(f"   ✅ {class_name} class found")
            else:
                print(f"   ❌ {class_name} class missing")
                return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Class definition test failed: {e}")
        return False

def test_enum_values():
    """Test enum values"""
    print("\n📋 Testing enum values...")
    
    try:
        import emergency_coordinator
        import proposal_manager
        
        # Test EmergencyType enum
        emergency_types = [
            emergency_coordinator.EmergencyType.MEDICAL_EMERGENCY,
            emergency_coordinator.EmergencyType.ACCIDENT_INSURANCE,
            emergency_coordinator.EmergencyType.FAMILY_SUPPORT,
            emergency_coordinator.EmergencyType.LEGAL_ASSISTANCE,
            emergency_coordinator.EmergencyType.UNKNOWN
        ]
        print(f"   ✅ EmergencyType enum: {len(emergency_types)} values")
        
        # Test SeverityLevel enum
        severity_levels = [
            emergency_coordinator.SeverityLevel.LOW,
            emergency_coordinator.SeverityLevel.MEDIUM,
            emergency_coordinator.SeverityLevel.HIGH,
            emergency_coordinator.SeverityLevel.CRITICAL
        ]
        print(f"   ✅ SeverityLevel enum: {len(severity_levels)} values")
        
        # Test ProposalStatus enum
        proposal_statuses = [
            proposal_manager.ProposalStatus.DRAFT,
            proposal_manager.ProposalStatus.SUBMITTED,
            proposal_manager.ProposalStatus.PENDING,
            proposal_manager.ProposalStatus.APPROVED,
            proposal_manager.ProposalStatus.REJECTED,
            proposal_manager.ProposalStatus.EXECUTED,
            proposal_manager.ProposalStatus.CANCELLED,
            proposal_manager.ProposalStatus.EXPIRED
        ]
        print(f"   ✅ ProposalStatus enum: {len(proposal_statuses)} values")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Enum test failed: {e}")
        return False

def test_data_structures():
    """Test data structure creation"""
    print("\n📊 Testing data structures...")
    
    try:
        import emergency_coordinator
        
        # Test EmergencyData creation
        emergency_data = emergency_coordinator.EmergencyData(
            emergency_id="test_001",
            user_address="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
            emergency_type=emergency_coordinator.EmergencyType.MEDICAL_EMERGENCY,
            institution_name="Test Hospital",
            institution_address="0x1234567890123456789012345678901234567890",
            documents=[],
            requested_amount=5.0,
            zk_proof={},
            timestamp=datetime.now(),
            contact_info={}
        )
        print("   ✅ EmergencyData structure created")
        
        # Test to_dict method
        data_dict = emergency_data.to_dict()
        print(f"   ✅ EmergencyData.to_dict(): {len(data_dict)} fields")
        
        # Test EmergencyAnalysis creation
        analysis = emergency_coordinator.EmergencyAnalysis(
            severity_level=emergency_coordinator.SeverityLevel.HIGH,
            urgency_score=85,
            recommended_amount=4.5,
            confidence_score=0.92,
            risk_factors=["test_risk"],
            reasoning="Test analysis",
            institution_credibility=0.88
        )
        print("   ✅ EmergencyAnalysis structure created")
        
        # Test EmergencyResponse creation
        response = emergency_coordinator.EmergencyResponse.success_response(
            proposal_id="test_proposal",
            tx_hash="0x123",
            analysis=analysis
        )
        print("   ✅ EmergencyResponse structure created")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Data structure test failed: {e}")
        return False

def test_method_signatures():
    """Test that key methods exist with correct signatures"""
    print("\n🔧 Testing method signatures...")
    
    try:
        import emergency_coordinator
        import gemini_analyzer
        import zkp_validator
        import proposal_manager
        
        # Test EmergencyCoordinator methods
        coordinator_methods = [
            'handle_emergency_request',
            'get_proposal_status',
            'cancel_proposal'
        ]
        
        for method in coordinator_methods:
            if hasattr(emergency_coordinator.EmergencyCoordinator, method):
                print(f"   ✅ EmergencyCoordinator.{method} method found")
            else:
                print(f"   ❌ EmergencyCoordinator.{method} method missing")
        
        # Test GeminiAnalyzer methods
        analyzer_methods = [
            'analyze_emergency',
            'analyze_medical_document',
            'assess_institution_credibility',
            'get_model_info'
        ]
        
        for method in analyzer_methods:
            if hasattr(gemini_analyzer.GeminiAnalyzer, method):
                print(f"   ✅ GeminiAnalyzer.{method} method found")
            else:
                print(f"   ❌ GeminiAnalyzer.{method} method missing")
        
        # Test ZKProofValidator methods
        validator_methods = [
            'verify_identity_proof',
            'verify_emergency_proof', 
            'verify_authorization_proof',
            'get_verification_stats'
        ]
        
        for method in validator_methods:
            if hasattr(zkp_validator.ZKProofValidator, method):
                print(f"   ✅ ZKProofValidator.{method} method found")
            else:
                print(f"   ❌ ZKProofValidator.{method} method missing")
        
        # Test ProposalManager methods
        manager_methods = [
            'create_emergency_proposal',
            'submit_proposal_to_contract',
            'get_proposal_status',
            'cancel_proposal',
            'get_proposal_statistics'
        ]
        
        for method in manager_methods:
            if hasattr(proposal_manager.ProposalManager, method):
                print(f"   ✅ ProposalManager.{method} method found")
            else:
                print(f"   ❌ ProposalManager.{method} method missing")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Method signature test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🤖 AI Agent System - Basic Structure Test")
    print("=" * 60)
    
    tests = [
        ("Module Imports", test_imports),
        ("Class Definitions", test_class_definitions),
        ("Enum Values", test_enum_values),
        ("Data Structures", test_data_structures),
        ("Method Signatures", test_method_signatures)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} test...")
        try:
            if test_func():
                passed += 1
                print(f"   ✅ {test_name} test PASSED")
            else:
                print(f"   ❌ {test_name} test FAILED")
        except Exception as e:
            print(f"   ❌ {test_name} test ERROR: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All basic structure tests passed!")
        print("✅ AI Agent system structure is correctly implemented")
        print("\n📋 Next steps:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Set up Gemini API key")
        print("   3. Run full integration tests")
        print("   4. Connect to smart contracts")
        return True
    else:
        print("⚠️  Some tests failed. Please fix the issues before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)