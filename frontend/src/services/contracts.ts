/**
 * Contracts Service - 智能合约交互服务
 *
 * 提供与Emergency Guardian智能合约的交互接口
 */

import { Contract, ethers } from "ethers";
import { web3Service } from "./web3";
import type { ContractCallOptions } from "./web3";

// 合约地址配置 (根据网络动态配置)
export const CONTRACT_ADDRESSES = {
  mainnet: {
    emergencyManagement: "0x0000000000000000000000000000000000000000", // 待部署
    zkProofVerifier: "0x0000000000000000000000000000000000000000", // 待部署
  },
  sepolia: {
    emergencyManagement: "0x0000000000000000000000000000000000000000", // 测试合约地址
    zkProofVerifier: "0x0000000000000000000000000000000000000000", // 测试合约地址
  },
  goerli: {
    emergencyManagement: "0x0000000000000000000000000000000000000000", // 测试合约地址
    zkProofVerifier: "0x0000000000000000000000000000000000000000", // 测试合约地址
  },
  localhost: {
    emergencyManagement: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // 本地开发地址
    zkProofVerifier: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // 本地开发地址
  },
} as const;

// Emergency Management 合约 ABI (简化版)
export const EMERGENCY_MANAGEMENT_ABI = [
  // 查询函数
  "function getUserConfig(address user) view returns (tuple(uint256 emergencyTimelock, uint256 guardianChangeTimelock, uint256 gracePeriod, bool dynamicAdjustment))",
  "function getGuardians(address user) view returns (address[])",
  "function getEmergencyLevel(address user) view returns (uint8)",
  "function getProposal(bytes32 proposalId) view returns (tuple(address user, uint8 emergencyLevel, uint256 amount, address recipient, uint256 timelock, bytes32 evidenceHash, bool executed, uint256 createdAt))",

  // 配置函数
  "function updateTimelockConfig(uint256 emergencyTimelock, uint256 guardianChangeTimelock, uint256 gracePeriod)",
  "function setLevelSpecificTimelock(uint8 level, uint256 timelock)",
  "function setDynamicTimelockAdjustment(bool enabled, uint256 baseRiskScore)",
  "function addGuardian(address guardian, bytes zkProof)",
  "function removeGuardian(address guardian, bytes zkProof)",

  // 紧急操作函数
  "function proposeEmergency(uint8 emergencyLevel, uint256 amount, address recipient, bytes32 evidenceHash, bytes zkProof)",
  "function proposeEmergencyByAI(address user, uint8 emergencyLevel, uint256 amount, address recipient, bytes32 evidenceHash, bytes aiAnalysis, bytes zkProof)",
  "function executePayment(bytes32 proposalId, bytes[] signatures)",
  "function executePaymentWithMultiSig(address to, uint256 amount, bytes[] signatures, bytes zkProof)",
  "function cancelProposal(bytes32 proposalId, string reason)",

  // 事件
  "event EmergencyProposed(bytes32 indexed proposalId, address indexed user, uint8 emergencyLevel, uint256 amount, address recipient)",
  "event PaymentExecuted(bytes32 indexed proposalId, address indexed recipient, uint256 amount)",
  "event GuardianAdded(address indexed user, address indexed guardian)",
  "event GuardianRemoved(address indexed user, address indexed guardian)",
  "event TimelockConfigUpdated(address indexed user, uint256 emergencyTimelock, uint256 guardianChangeTimelock)",
] as const;

// ZK Proof Verifier 合约 ABI
export const ZK_PROOF_VERIFIER_ABI = [
  "function verifyGuardianIdentity(bytes proof, bytes32 publicInputHash) view returns (bool)",
  "function verifyEmergencyProof(bytes proof, bytes32 emergencyHash) view returns (bool)",
  "function verifyExecutionAuthorization(bytes proof, address executor, bytes32 operationHash) view returns (bool)",
  "function updateVerificationKey(uint256 proofType, bytes32 vkHash)",

  "event ProofVerified(uint256 indexed proofType, address indexed verifier, bool result)",
  "event VerificationKeyUpdated(uint256 indexed proofType, bytes32 vkHash)",
] as const;

// 紧急级别枚举
export const EmergencyLevel = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type EmergencyLevel =
  (typeof EmergencyLevel)[keyof typeof EmergencyLevel];

// 用户配置接口
export interface UserConfig {
  emergencyTimelock: bigint;
  guardianChangeTimelock: bigint;
  gracePeriod: bigint;
  dynamicAdjustment: boolean;
}

// 提案接口
export interface EmergencyProposal {
  user: string;
  emergencyLevel: EmergencyLevel;
  amount: bigint;
  recipient: string;
  timelock: bigint;
  evidenceHash: string;
  executed: boolean;
  createdAt: bigint;
}

// 紧急提案参数
export interface EmergencyProposalParams {
  emergencyLevel: EmergencyLevel;
  amount: string; // ETH amount as string
  recipient: string;
  evidenceHash: string;
  zkProof: string;
}

// AI 紧急提案参数
export interface AIEmergencyProposalParams extends EmergencyProposalParams {
  user: string;
  aiAnalysis: string;
}

/**
 * Emergency Management 合约服务
 */
export class EmergencyManagementService {
  private contract: Contract | null = null;

  /**
   * 初始化合约实例
   */
  private async initContract(): Promise<Contract> {
    if (!web3Service.isConnected) {
      throw new Error("Wallet not connected");
    }

    const walletInfo = web3Service.currentWallet;
    if (!walletInfo) {
      throw new Error("No wallet information available");
    }

    // 根据当前网络获取合约地址
    const networkName =
      walletInfo.networkName as keyof typeof CONTRACT_ADDRESSES;
    const contractAddress =
      CONTRACT_ADDRESSES[networkName]?.emergencyManagement;

    if (
      !contractAddress ||
      contractAddress === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        `Emergency Management contract not deployed on ${networkName}`
      );
    }

    this.contract = web3Service.getContract(contractAddress, [
      ...EMERGENCY_MANAGEMENT_ABI,
    ]);
    return this.contract;
  }

  /**
   * 获取用户配置
   * @param userAddress 用户地址
   * @returns 用户配置
   */
  async getUserConfig(userAddress?: string): Promise<UserConfig> {
    const contract = await this.initContract();
    const address = userAddress || web3Service.currentWallet?.address;

    if (!address) {
      throw new Error("No user address provided");
    }

    const config = await web3Service.callContractMethod(
      contract,
      "getUserConfig",
      [address]
    );

    return {
      emergencyTimelock: config.emergencyTimelock,
      guardianChangeTimelock: config.guardianChangeTimelock,
      gracePeriod: config.gracePeriod,
      dynamicAdjustment: config.dynamicAdjustment,
    };
  }

  /**
   * 获取用户的监护人列表
   * @param userAddress 用户地址
   * @returns 监护人地址列表
   */
  async getGuardians(userAddress?: string): Promise<string[]> {
    const contract = await this.initContract();
    const address = userAddress || web3Service.currentWallet?.address;

    if (!address) {
      throw new Error("No user address provided");
    }

    return await web3Service.callContractMethod(contract, "getGuardians", [
      address,
    ]);
  }

  /**
   * 获取用户当前紧急级别
   * @param userAddress 用户地址
   * @returns 紧急级别
   */
  async getEmergencyLevel(userAddress?: string): Promise<EmergencyLevel> {
    const contract = await this.initContract();
    const address = userAddress || web3Service.currentWallet?.address;

    if (!address) {
      throw new Error("No user address provided");
    }

    const level = await web3Service.callContractMethod(
      contract,
      "getEmergencyLevel",
      [address]
    );
    return Number(level) as EmergencyLevel;
  }

  /**
   * 获取提案详情
   * @param proposalId 提案ID
   * @returns 提案详情
   */
  async getProposal(proposalId: string): Promise<EmergencyProposal> {
    const contract = await this.initContract();
    const proposal = await web3Service.callContractMethod(
      contract,
      "getProposal",
      [proposalId]
    );

    return {
      user: proposal.user,
      emergencyLevel: Number(proposal.emergencyLevel) as EmergencyLevel,
      amount: proposal.amount,
      recipient: proposal.recipient,
      timelock: proposal.timelock,
      evidenceHash: proposal.evidenceHash,
      executed: proposal.executed,
      createdAt: proposal.createdAt,
    };
  }

  /**
   * 更新时间锁配置
   * @param emergencyTimelock 紧急提议时间锁（秒）
   * @param guardianChangeTimelock 监护人变更时间锁（秒）
   * @param gracePeriod 宽限期（秒）
   * @param options 交易选项
   * @returns 交易响应
   */
  async updateTimelockConfig(
    emergencyTimelock: number,
    guardianChangeTimelock: number,
    gracePeriod: number,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "updateTimelockConfig",
      [emergencyTimelock, guardianChangeTimelock, gracePeriod],
      options
    );
  }

  /**
   * 设置特定级别的时间锁
   * @param level 紧急级别
   * @param timelock 时间锁（秒）
   * @param options 交易选项
   * @returns 交易响应
   */
  async setLevelSpecificTimelock(
    level: EmergencyLevel,
    timelock: number,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "setLevelSpecificTimelock",
      [level, timelock],
      options
    );
  }

  /**
   * 添加监护人
   * @param guardianAddress 监护人地址
   * @param zkProof ZK证明
   * @param options 交易选项
   * @returns 交易响应
   */
  async addGuardian(
    guardianAddress: string,
    zkProof: string,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "addGuardian",
      [guardianAddress, zkProof],
      options
    );
  }

  /**
   * 移除监护人
   * @param guardianAddress 监护人地址
   * @param zkProof ZK证明
   * @param options 交易选项
   * @returns 交易响应
   */
  async removeGuardian(
    guardianAddress: string,
    zkProof: string,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "removeGuardian",
      [guardianAddress, zkProof],
      options
    );
  }

  /**
   * 提交紧急提案
   * @param params 提案参数
   * @param options 交易选项
   * @returns 交易响应
   */
  async proposeEmergency(
    params: EmergencyProposalParams,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();
    const amountWei = ethers.parseEther(params.amount);

    return await web3Service.sendContractTransaction(
      contract,
      "proposeEmergency",
      [
        params.emergencyLevel,
        amountWei,
        params.recipient,
        params.evidenceHash,
        params.zkProof,
      ],
      options
    );
  }

  /**
   * AI代理提交紧急提案
   * @param params AI提案参数
   * @param options 交易选项
   * @returns 交易响应
   */
  async proposeEmergencyByAI(
    params: AIEmergencyProposalParams,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();
    const amountWei = ethers.parseEther(params.amount);

    return await web3Service.sendContractTransaction(
      contract,
      "proposeEmergencyByAI",
      [
        params.user,
        params.emergencyLevel,
        amountWei,
        params.recipient,
        params.evidenceHash,
        params.aiAnalysis,
        params.zkProof,
      ],
      options
    );
  }

  /**
   * 执行支付
   * @param proposalId 提案ID
   * @param signatures 监护人签名数组
   * @param options 交易选项
   * @returns 交易响应
   */
  async executePayment(
    proposalId: string,
    signatures: string[],
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "executePayment",
      [proposalId, signatures],
      options
    );
  }

  /**
   * 取消提案
   * @param proposalId 提案ID
   * @param reason 取消原因
   * @param options 交易选项
   * @returns 交易响应
   */
  async cancelProposal(
    proposalId: string,
    reason: string,
    options: ContractCallOptions = {}
  ) {
    const contract = await this.initContract();

    return await web3Service.sendContractTransaction(
      contract,
      "cancelProposal",
      [proposalId, reason],
      options
    );
  }
}

/**
 * ZK Proof Verifier 合约服务
 */
export class ZKProofVerifierService {
  private contract: Contract | null = null;

  /**
   * 初始化合约实例
   */
  private async initContract(): Promise<Contract> {
    if (!web3Service.isConnected) {
      throw new Error("Wallet not connected");
    }

    const walletInfo = web3Service.currentWallet;
    if (!walletInfo) {
      throw new Error("No wallet information available");
    }

    const networkName =
      walletInfo.networkName as keyof typeof CONTRACT_ADDRESSES;
    const contractAddress = CONTRACT_ADDRESSES[networkName]?.zkProofVerifier;

    if (
      !contractAddress ||
      contractAddress === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        `ZK Proof Verifier contract not deployed on ${networkName}`
      );
    }

    this.contract = web3Service.getContract(contractAddress, [
      ...ZK_PROOF_VERIFIER_ABI,
    ]);
    return this.contract;
  }

  /**
   * 验证监护人身份证明
   * @param proof ZK证明
   * @param publicInputHash 公共输入哈希
   * @returns 验证结果
   */
  async verifyGuardianIdentity(
    proof: string,
    publicInputHash: string
  ): Promise<boolean> {
    const contract = await this.initContract();

    return await web3Service.callContractMethod(
      contract,
      "verifyGuardianIdentity",
      [proof, publicInputHash]
    );
  }

  /**
   * 验证紧急状态证明
   * @param proof ZK证明
   * @param emergencyHash 紧急状态哈希
   * @returns 验证结果
   */
  async verifyEmergencyProof(
    proof: string,
    emergencyHash: string
  ): Promise<boolean> {
    const contract = await this.initContract();

    return await web3Service.callContractMethod(
      contract,
      "verifyEmergencyProof",
      [proof, emergencyHash]
    );
  }

  /**
   * 验证执行授权证明
   * @param proof ZK证明
   * @param executor 执行者地址
   * @param operationHash 操作哈希
   * @returns 验证结果
   */
  async verifyExecutionAuthorization(
    proof: string,
    executor: string,
    operationHash: string
  ): Promise<boolean> {
    const contract = await this.initContract();

    return await web3Service.callContractMethod(
      contract,
      "verifyExecutionAuthorization",
      [proof, executor, operationHash]
    );
  }
}

// 导出服务实例
export const emergencyManagementService = new EmergencyManagementService();
export const zkProofVerifierService = new ZKProofVerifierService();
