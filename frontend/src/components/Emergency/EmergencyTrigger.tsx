/**
 * EmergencyTrigger Component - 紧急触发界面
 */

import React, { useState } from "react";
import { Button } from "../Common/Button";
import { Card, CardHeader, CardContent } from "../Common/Card";
import { Input } from "../Common/Input";
import { Badge } from "../Common/Badge";
import type { EmergencyType, EmergencyLevel } from "../../types";

interface EmergencyTriggerProps {
  onTrigger: (emergency: EmergencyRequest) => void;
  isLoading?: boolean;
}

interface EmergencyRequest {
  type: EmergencyType;
  level: EmergencyLevel;
  title: string;
  description: string;
  requestedAmount?: string;
  recipientAddress?: string;
  attachments?: File[];
}

const emergencyTypes: Array<{
  value: EmergencyType;
  label: string;
  icon: string;
}> = [
  { value: "medical", label: "医疗紧急", icon: "🏥" },
  { value: "financial", label: "财务紧急", icon: "💰" },
  { value: "security", label: "安全威胁", icon: "🔒" },
  { value: "legal", label: "法律援助", icon: "⚖️" },
  { value: "family", label: "家庭支持", icon: "👨‍👩‍👧‍👦" },
  { value: "other", label: "其他紧急", icon: "🚨" },
];

const emergencyLevels: Array<{
  value: EmergencyLevel;
  label: string;
  color: string;
}> = [
  { value: "low", label: "低", color: "gray" },
  { value: "medium", label: "中", color: "yellow" },
  { value: "high", label: "高", color: "orange" },
  { value: "critical", label: "紧急", color: "red" },
];

export const EmergencyTrigger: React.FC<EmergencyTriggerProps> = ({
  onTrigger,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EmergencyRequest>({
    type: "medical",
    level: "medium",
    title: "",
    description: "",
    requestedAmount: "",
    recipientAddress: "",
    attachments: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EmergencyRequest, string>>
  >({});
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const validateStep1 = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = "请输入紧急情况标题";
    }

    if (!formData.description.trim()) {
      newErrors.description = "请描述紧急情况";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: typeof errors = {};

    if (formData.requestedAmount && isNaN(Number(formData.requestedAmount))) {
      newErrors.requestedAmount = "请输入有效的金额";
    }

    if (
      formData.recipientAddress &&
      !/^0x[a-fA-F0-9]{40}$/.test(formData.recipientAddress)
    ) {
      newErrors.recipientAddress = "请输入有效的以太坊地址";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = () => {
    if (validateStep1() && validateStep2()) {
      onTrigger(formData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              创建紧急请求
            </h2>
            <Badge variant="emergency">步骤 {step}/3</Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      stepNum <= step
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        stepNum < step ? "bg-red-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>基本信息</span>
              <span>详细信息</span>
              <span>确认提交</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  紧急类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: type.value }))
                      }
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        formData.type === type.value
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  紧急级别
                </label>
                <div className="flex space-x-2">
                  {emergencyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, level: level.value }))
                      }
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.level === level.value
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Badge variant={level.color as any}>{level.label}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="紧急情况标题"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                error={errors.title}
                placeholder="简要描述紧急情况"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="详细描述紧急情况，包括时间、地点、所需帮助等"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Detailed Information */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="请求金额 (ETH)"
                type="number"
                step="0.001"
                value={formData.requestedAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requestedAmount: e.target.value,
                  }))
                }
                error={errors.requestedAmount}
                placeholder="0.0"
                helperText="如需资金支持，请输入所需ETH数量"
              />

              <Input
                label="接收地址"
                value={formData.recipientAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipientAddress: e.target.value,
                  }))
                }
                error={errors.recipientAddress}
                placeholder="0x..."
                helperText="资金将发送到此地址（可选）"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  附件上传
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      点击上传文件或拖拽到此处
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      支持图片、PDF、Word文档
                    </span>
                  </label>
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-yellow-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      确认提交
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      提交后将立即通知所有监护人，请确认信息无误。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    类型:
                  </span>
                  <span className="text-sm text-gray-900">
                    {
                      emergencyTypes.find((t) => t.value === formData.type)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    级别:
                  </span>
                  <Badge
                    variant={
                      emergencyLevels.find((l) => l.value === formData.level)
                        ?.color as any
                    }
                  >
                    {
                      emergencyLevels.find((l) => l.value === formData.level)
                        ?.label
                    }
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    标题:
                  </span>
                  <span className="text-sm text-gray-900">
                    {formData.title}
                  </span>
                </div>
                {formData.requestedAmount && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      金额:
                    </span>
                    <span className="text-sm text-gray-900">
                      {formData.requestedAmount} ETH
                    </span>
                  </div>
                )}
                {formData.recipientAddress && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      接收地址:
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {formData.recipientAddress.slice(0, 6)}...
                      {formData.recipientAddress.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
            >
              上一步
            </Button>

            <div className="space-x-3">
              {step < 3 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  下一步
                </Button>
              ) : (
                <Button
                  variant="emergency"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "提交中..." : "提交紧急请求"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
