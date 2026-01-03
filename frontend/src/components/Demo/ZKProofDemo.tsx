/**
 * ZKProofDemo Component - 零知识证明演示组件
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Badge, Button } from "../Common";

interface ZKProofStatus {
  type: string;
  status: "generating" | "verifying" | "verified" | "failed";
  progress: number;
  details: string;
}

export const ZKProofDemo: React.FC<{ emergencyId?: string }> = ({
  emergencyId,
}) => {
  const [proofs, setProofs] = useState<ZKProofStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (emergencyId && !isGenerating) {
      generateZKProofs();
    }
  }, [emergencyId]);

  const generateZKProofs = async () => {
    setIsGenerating(true);

    const proofTypes = [
      {
        type: "Guardian Identity Proof",
        details: "证明监护人身份而不泄露个人信息",
      },
      {
        type: "Emergency State Proof",
        details: "证明紧急情况的真实性和严重程度",
      },
      {
        type: "Execution Authorization Proof",
        details: "证明操作执行的授权有效性",
      },
    ];

    // 初始化证明状态
    const initialProofs = proofTypes.map((proof) => ({
      ...proof,
      status: "generating" as const,
      progress: 0,
    }));
    setProofs(initialProofs);

    // 模拟证明生成过程
    for (let i = 0; i < proofTypes.length; i++) {
      await simulateProofGeneration(i);
    }

    setIsGenerating(false);
  };

  const simulateProofGeneration = async (index: number) => {
    // 生成阶段
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProofs((prev) =>
        prev.map((proof, i) =>
          i === index ? { ...proof, progress, status: "generating" } : proof
        )
      );
    }

    // 验证阶段
    setProofs((prev) =>
      prev.map((proof, i) =>
        i === index ? { ...proof, status: "verifying", progress: 0 } : proof
      )
    );

    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      setProofs((prev) =>
        prev.map((proof, i) => (i === index ? { ...proof, progress } : proof))
      );
    }

    // 完成验证
    setProofs((prev) =>
      prev.map((proof, i) =>
        i === index ? { ...proof, status: "verified", progress: 100 } : proof
      )
    );
  };

  const getStatusBadge = (status: ZKProofStatus["status"]) => {
    switch (status) {
      case "generating":
        return <Badge variant="warning">生成中</Badge>;
      case "verifying":
        return <Badge variant="primary">验证中</Badge>;
      case "verified":
        return <Badge variant="success">已验证</Badge>;
      case "failed":
        return <Badge variant="emergency">失败</Badge>;
      default:
        return <Badge variant="gray">未知</Badge>;
    }
  };

  const getStatusIcon = (status: ZKProofStatus["status"]) => {
    switch (status) {
      case "generating":
        return "⚙️";
      case "verifying":
        return "🔍";
      case "verified":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">
              🔐 零知识证明系统
            </h3>
            <Badge variant="primary" size="sm">
              ZKP
            </Badge>
          </div>
          {!isGenerating && proofs.length === 0 && (
            <Button onClick={generateZKProofs} size="sm">
              生成证明
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {proofs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔐</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              零知识证明保护隐私
            </h4>
            <p className="text-gray-600 mb-4">
              系统使用ZK-SNARKs技术确保在验证身份和授权的同时保护用户隐私
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h5 className="font-medium text-blue-900 mb-2">技术特性：</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>隐私保护</strong>：验证身份而不泄露个人信息
                </li>
                <li>
                  • <strong>数学保证</strong>：基于密码学的安全性证明
                </li>
                <li>
                  • <strong>高效验证</strong>：链上验证成本低，速度快
                </li>
                <li>
                  • <strong>防篡改</strong>：证明无法伪造或重放
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getStatusIcon(proof.status)}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {proof.type}
                      </h4>
                      <p className="text-sm text-gray-600">{proof.details}</p>
                    </div>
                  </div>
                  {getStatusBadge(proof.status)}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      {proof.status === "generating"
                        ? "生成进度"
                        : proof.status === "verifying"
                        ? "验证进度"
                        : "完成"}
                    </span>
                    <span>{proof.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        proof.status === "verified"
                          ? "bg-green-500"
                          : proof.status === "failed"
                          ? "bg-red-500"
                          : proof.status === "verifying"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${proof.progress}%` }}
                    />
                  </div>
                </div>

                {/* Technical details */}
                {proof.status === "verified" && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-xs text-green-800 font-mono">
                      <div>
                        Proof Hash: 0x{Math.random().toString(16).slice(2, 18)}
                        ...
                      </div>
                      <div>Circuit: Groth16 BN254</div>
                      <div>Gas Cost: ~21,000 gas</div>
                      <div>
                        Verification Time:{" "}
                        {50 + Math.floor(Math.random() * 100)}ms
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {proofs.every((p) => p.status === "verified") && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 text-lg font-medium mb-2">
                  🎉 所有零知识证明验证成功！
                </div>
                <p className="text-green-700 text-sm">
                  紧急请求已通过隐私保护验证，可以安全执行
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
