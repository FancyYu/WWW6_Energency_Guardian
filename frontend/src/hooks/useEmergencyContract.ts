/**
 * useEmergencyContract Hook - Emergency Guardian合约交互Hook
 */

import { useState, useCallback } from "react";
import {
  emergencyManagementService,
  zkProofVerifierService,
  EmergencyLevel,
  type UserConfig,
  type EmergencyProposal,
  type EmergencyProposalParams,
  type AIEmergencyProposalParams,
} from "../services/contracts";
import type { ContractCallOptions } from "../services/web3";

export interface UseEmergencyContractReturn {
  // 状态
  loading: boolean;
  error: string | null;

  // 查询方法
  getUserConfig: (userAddress?: string) => Promise<UserConfig | null>;
  getGuardians: (userAddress?: string) => Promise<string[] | null>;
  getEmergencyLevel: (userAddress?: string) => Promise<EmergencyLevel | null>;
  getProposal: (proposalId: string) => Promise<EmergencyProposal | null>;

  // 配置方法
  updateTimelockConfig: (
    emergencyTimelock: number,
    guardianChangeTimelock: number,
    gracePeriod: number,
    options?: ContractCallOptions
  ) => Promise<any>;
  setLevelSpecificTimelock: (
    level: EmergencyLevel,
    timelock: number,
    options?: ContractCallOptions
  ) => Promise<any>;
  addGuardian: (
    guardianAddress: string,
    zkProof: string,
    options?: ContractCallOptions
  ) => Promise<any>;
  removeGuardian: (
    guardianAddress: string,
    zkProof: string,
    options?: ContractCallOptions
  ) => Promise<any>;

  // 紧急操作方法
  proposeEmergency: (
    params: EmergencyProposalParams,
    options?: ContractCallOptions
  ) => Promise<any>;
  proposeEmergencyByAI: (
    params: AIEmergencyProposalParams,
    options?: ContractCallOptions
  ) => Promise<any>;
  executePayment: (
    proposalId: string,
    signatures: string[],
    options?: ContractCallOptions
  ) => Promise<any>;
  cancelProposal: (
    proposalId: string,
    reason: string,
    options?: ContractCallOptions
  ) => Promise<any>;

  // ZK证明验证方法
  verifyGuardianIdentity: (
    proof: string,
    publicInputHash: string
  ) => Promise<boolean | null>;
  verifyEmergencyProof: (
    proof: string,
    emergencyHash: string
  ) => Promise<boolean | null>;
  verifyExecutionAuthorization: (
    proof: string,
    executor: string,
    operationHash: string
  ) => Promise<boolean | null>;
}

export const useEmergencyContract = (): UseEmergencyContractReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 通用错误处理
  const handleError = (err: any, operation: string) => {
    const errorMessage =
      err instanceof Error ? err.message : `${operation} failed`;
    setError(errorMessage);
    console.error(`${operation} error:`, err);
    return null;
  };

  // 通用异步操作包装器
  const withLoading = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await operation();
    } catch (err) {
      return handleError(err, "Operation") as null;
    } finally {
      setLoading(false);
    }
  };

  // 查询方法
  const getUserConfig = useCallback(
    async (userAddress?: string): Promise<UserConfig | null> => {
      return withLoading(() =>
        emergencyManagementService.getUserConfig(userAddress)
      );
    },
    []
  );

  const getGuardians = useCallback(
    async (userAddress?: string): Promise<string[] | null> => {
      return withLoading(() =>
        emergencyManagementService.getGuardians(userAddress)
      );
    },
    []
  );

  const getEmergencyLevel = useCallback(
    async (userAddress?: string): Promise<EmergencyLevel | null> => {
      return withLoading(() =>
        emergencyManagementService.getEmergencyLevel(userAddress)
      );
    },
    []
  );

  const getProposal = useCallback(
    async (proposalId: string): Promise<EmergencyProposal | null> => {
      return withLoading(() =>
        emergencyManagementService.getProposal(proposalId)
      );
    },
    []
  );

  // 配置方法
  const updateTimelockConfig = useCallback(
    async (
      emergencyTimelock: number,
      guardianChangeTimelock: number,
      gracePeriod: number,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.updateTimelockConfig(
          emergencyTimelock,
          guardianChangeTimelock,
          gracePeriod,
          options
        )
      );
    },
    []
  );

  const setLevelSpecificTimelock = useCallback(
    async (
      level: EmergencyLevel,
      timelock: number,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.setLevelSpecificTimelock(
          level,
          timelock,
          options
        )
      );
    },
    []
  );

  const addGuardian = useCallback(
    async (
      guardianAddress: string,
      zkProof: string,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.addGuardian(
          guardianAddress,
          zkProof,
          options
        )
      );
    },
    []
  );

  const removeGuardian = useCallback(
    async (
      guardianAddress: string,
      zkProof: string,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.removeGuardian(
          guardianAddress,
          zkProof,
          options
        )
      );
    },
    []
  );

  // 紧急操作方法
  const proposeEmergency = useCallback(
    async (
      params: EmergencyProposalParams,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.proposeEmergency(params, options)
      );
    },
    []
  );

  const proposeEmergencyByAI = useCallback(
    async (
      params: AIEmergencyProposalParams,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.proposeEmergencyByAI(params, options)
      );
    },
    []
  );

  const executePayment = useCallback(
    async (
      proposalId: string,
      signatures: string[],
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.executePayment(
          proposalId,
          signatures,
          options
        )
      );
    },
    []
  );

  const cancelProposal = useCallback(
    async (
      proposalId: string,
      reason: string,
      options: ContractCallOptions = {}
    ) => {
      return withLoading(() =>
        emergencyManagementService.cancelProposal(proposalId, reason, options)
      );
    },
    []
  );

  // ZK证明验证方法
  const verifyGuardianIdentity = useCallback(
    async (proof: string, publicInputHash: string): Promise<boolean | null> => {
      return withLoading(() =>
        zkProofVerifierService.verifyGuardianIdentity(proof, publicInputHash)
      );
    },
    []
  );

  const verifyEmergencyProof = useCallback(
    async (proof: string, emergencyHash: string): Promise<boolean | null> => {
      return withLoading(() =>
        zkProofVerifierService.verifyEmergencyProof(proof, emergencyHash)
      );
    },
    []
  );

  const verifyExecutionAuthorization = useCallback(
    async (
      proof: string,
      executor: string,
      operationHash: string
    ): Promise<boolean | null> => {
      return withLoading(() =>
        zkProofVerifierService.verifyExecutionAuthorization(
          proof,
          executor,
          operationHash
        )
      );
    },
    []
  );

  return {
    loading,
    error,
    getUserConfig,
    getGuardians,
    getEmergencyLevel,
    getProposal,
    updateTimelockConfig,
    setLevelSpecificTimelock,
    addGuardian,
    removeGuardian,
    proposeEmergency,
    proposeEmergencyByAI,
    executePayment,
    cancelProposal,
    verifyGuardianIdentity,
    verifyEmergencyProof,
    verifyExecutionAuthorization,
  };
};
