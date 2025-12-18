import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CSVLoader = ({ isVisible, isSuccess, setIsVisible }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const particlesRef = useRef(null);

  const router = useRouter();
  const phases = [
    {
      label: "Initializing AI magic",
      status: "🔮 Awakening AI intelligence...",
      progress: 5,
    },
    {
      label: "Loading trade data",
      status: "📊 Processing CSV magic...",
      progress: 15,
    },
    {
      label: "Analyzing patterns",
      status: "⚡ Detecting trade patterns...",
      progress: 30,
    },
    {
      label: "AI deep analysis",
      status: "🤖 AI analyzing market data...",
      progress: 45,
    },
    {
      label: "Extracting insights",
      status: "💎 Extracting profit insights...",
      progress: 60,
    },
    {
      label: "Calculating metrics",
      status: "🎯 Calculating risk metrics...",
      progress: 75,
    },
    {
      label: "Generating strategies",
      status: "📈 Generating win strategies...",
      progress: 90,
    },
    {
      label: "Finalizing magic",
      status: "✨ Finalizing magical insights...",
      progress: 98,
    },
    {
      label: "Magic complete!",
      status: "🎉 Magic complete! Insights ready!",
      progress: 100,
    },
  ];

  useEffect(() => {
    if (progress === 100) {
      setIsVisible(false);
      if (isSuccess) router.push("/dashboard");
    }
  }, [progress, isSuccess]);

  const createMagicParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 8 + 3;
      particles.push({
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 3,
      });
    }
    return particles;
  };

  const particles = createMagicParticles();

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        setCurrentPhase((prev) => prev + 1);
        setProgress(phases[currentPhase + 1]?.progress || 100);
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 2200);

    return () => clearInterval(interval);
  }, [currentPhase, phases.length, isVisible]);

  if (!isVisible) return null; // shifted here

  const handleMouseMove = (e) => {
    if (Math.random() < 0.05) {
      const sparkle = document.createElement("div");
      sparkle.className =
        "absolute pointer-events-none z-50 rounded-full bg-green-500 shadow-lg animate-ping";
      sparkle.style.left = e.clientX + Math.random() * 20 - 10 + "px";
      sparkle.style.top = e.clientY + Math.random() * 20 - 10 + "px";
      sparkle.style.width = Math.random() * 6 + 2 + "px";
      sparkle.style.height = sparkle.style.width;
      sparkle.style.boxShadow = "0 0 10px #22c55e";

      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }
  };

  return (
    <div
      className="h-screen w-screen top-0 left-0 fixed z-99 backdrop-blur-md bg-black/30 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center min-h-screen relative z-20 p-4 md:p-8">
        <div className="text-center w-full">
          {/* Status Magic Card */}
          <div className="relative bg-black/30 backdrop-blur-xl border border-green-500/30 rounded-3xl p-6 md:p-8 mt-12 w-full max-w-lg mx-auto shadow-2xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2 text-sm text-slate-300">
                <span>{phases[currentPhase]?.label}</span>
                <span className="font-semibold text-green-500 text-base">
                  {phases[currentPhase]?.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-green-500/15 rounded-full overflow-hidden border border-green-500/30 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-full transition-all duration-700 ease-out relative shadow-lg"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </div>

            <div className="text-lg text-slate-200 overflow-hidden whitespace-nowrap animate-pulse border-r-2 border-green-500">
              {isComplete
                ? "🚀 Redirecting to your dashboard..."
                : phases[currentPhase]?.status}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes magicFloat {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: translateY(-100px) translateX(50px) scale(1)
              rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-200px) translateX(-30px) scale(0.8)
              rotate(180deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-300px) translateX(80px) scale(1.2)
              rotate(270deg);
            opacity: 0.6;
          }
        }

        @keyframes ringPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
            border-width: 1px;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
            border-width: 3px;
          }
        }

        @keyframes streamFlow {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes lightning {
          0%,
          90%,
          100% {
            opacity: 0;
            transform: scaleY(0);
          }
          92%,
          96% {
            opacity: 1;
            transform: scaleY(1);
          }
          94% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default CSVLoader;
