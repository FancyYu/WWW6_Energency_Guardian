/**
 * WalletConnectCover - 数字星图风格的钱包连接封面
 * 设计理念：安全是星图上的连接
 */

import React, { useEffect, useRef, useState } from "react";
import { useWeb3 } from "../../hooks/useWeb3";
import { useRouter } from "../../context/RouterContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "最受欢迎的以太坊钱包",
    color: "#f6851b",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "连接移动端钱包",
    color: "#3b99fc",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "安全的数字资产钱包",
    color: "#0052ff",
  },
];

export const WalletConnectCover: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);

  const { connectWallet, isConnected } = useWeb3();
  const { navigate } = useRouter();

  // 初始化粒子系统
  useEffect(() => {
    const initParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = 150;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.7 ? "#10b981" : "#3b82f6",
        });
      }

      setParticles(newParticles);
    };

    initParticles();
    window.addEventListener("resize", initParticles);
    return () => window.removeEventListener("resize", initParticles);
  }, []);

  // 鼠标跟踪
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 粒子动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particles.forEach((particle, index) => {
        // 鼠标吸引效果
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }

        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检查
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 阻尼
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // 绘制粒子
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 连接线
        particles.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = ((100 - distance) / 100) * 0.3;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [particles, mousePos]);

  // 钱包连接处理
  const handleWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setShowPulse(true);

    try {
      await connectWallet(walletId as any);

      // 连接成功动画
      setTimeout(() => {
        navigate("dashboard");
      }, 2000);
    } catch (error) {
      console.error("钱包连接失败:", error);
      setIsConnecting(false);
      setSelectedWallet(null);
      setShowPulse(false);
    }
  };

  // 如果已连接，直接跳转
  useEffect(() => {
    if (isConnected) {
      navigate("dashboard");
    }
  }, [isConnected, navigate]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900"
    >
      {/* 背景粒子画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* 主要内容 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* 中央3D护盾/晶体球体 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`relative transition-all duration-2000 ${
              showPulse ? "animate-pulse scale-110" : ""
            }`}
          >
            {/* 3D护盾框架 */}
            <div className="relative w-96 h-96">
              {/* 外层护盾 */}
              <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full transform -translate-x-1/2 translate-y-1"></div>
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1 -translate-y-1/2"></div>
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform translate-x-1 -translate-y-1/2"></div>
              </div>

              {/* 内层几何体 */}
              <div className="absolute inset-8 border border-cyan-300/20 rounded-full animate-reverse-spin">
                {/* 连接线 */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent origin-bottom"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        left: "50%",
                        transformOrigin: "0 100%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 脉冲波效果 */}
              {showPulse && (
                <div className="absolute inset-0 animate-ping">
                  <div className="w-full h-full border-2 border-cyan-400/50 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 登录卡片 */}
        <div className="relative z-20 w-full max-w-md">
          {/* 主登录卡片 */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* 呼吸光效边框 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-emerald-400/20 animate-pulse"></div>

            <div className="relative z-10">
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  SheGuardian
                </h1>
                <p className="text-cyan-200 text-lg font-medium mb-1">
                  去中心化紧急情况响应网络
                </p>
                <p className="text-white/70 text-sm">
                  连接您的 Web3 钱包以开始使用
                </p>
              </div>

              {/* 钱包选项 */}
              <div className="space-y-4 mb-6">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletConnect(wallet.id)}
                    disabled={isConnecting}
                    className={`
                      group relative w-full p-4 rounded-xl border transition-all duration-300
                      ${
                        selectedWallet === wallet.id
                          ? "border-cyan-400 bg-cyan-400/20 scale-105"
                          : "border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10 hover:scale-105"
                      }
                      ${
                        isConnecting
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }
                      backdrop-blur-sm
                    `}
                  >
                    {/* 3D翻转效果背景 */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center space-x-4">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium">
                          {wallet.name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {wallet.description}
                        </div>
                      </div>

                      {/* 连接状态指示器 */}
                      {selectedWallet === wallet.id && isConnecting && (
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      )}

                      {/* 发光扩散效果 */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className="absolute inset-0 rounded-xl animate-pulse"
                          style={{
                            background: `radial-gradient(circle at center, ${wallet.color}20 0%, transparent 70%)`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* 探索按钮 */}
              <button
                onClick={() => navigate("dashboard")}
                className="w-full py-3 px-6 rounded-xl border border-white/30 text-white/80 hover:text-white hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                先探索功能
              </button>

              {/* 开发模式：重置连接状态按钮 */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => {
                    localStorage.removeItem("sheGuardian_hasConnected");
                    window.location.reload();
                  }}
                  className="w-full py-2 px-4 mt-2 rounded-lg border border-red-400/30 text-red-400/80 hover:text-red-400 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm text-sm"
                >
                  🔄 重置连接状态 (开发模式)
                </button>
              )}

              {/* 连接状态提示 */}
              {isConnecting && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-cyan-400">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>正在连接钱包...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-white/40 text-sm">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>SheGuardian - 去中心化紧急情况响应网络</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义CSS动画 */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reverse-spin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
      `}</style>
    </div>
  );
};
