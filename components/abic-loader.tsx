"use client"

import { Receipt, DollarSign, CreditCard, TrendingUp, PieChart, Banknote } from "lucide-react"

interface ABICLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export default function ABICLoader({ size = "md", text = "Processing...", className = "" }: ABICLoaderProps) {
  const sizeClasses = {
    sm: { container: "w-40 h-40", calc: "w-18 h-22", doc: "w-16 h-20", icon: "w-3 h-3" },
    md: { container: "w-48 h-48", calc: "w-22 h-26", doc: "w-20 h-24", icon: "w-4 h-4" },
    lg: { container: "w-56 h-56", calc: "w-26 h-30", doc: "w-24 h-28", icon: "w-5 h-5" },
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }

  const currentSize = sizeClasses[size]

  const calculatorNumbers = ["0", "12", "123", "1,234", "12,345", "123,456"]
  const floatingElements = [
    { icon: DollarSign, color: "from-green-400 to-green-500", position: "top-6 left-6" },
    { icon: Receipt, color: "from-blue-400 to-blue-500", position: "bottom-6 right-6" },
    { icon: CreditCard, color: "from-orange-400 to-orange-500", position: "top-6 right-10" },
    { icon: TrendingUp, color: "from-emerald-400 to-emerald-500", position: "bottom-6 left-10" },
    { icon: PieChart, color: "from-cyan-400 to-cyan-500", position: "top-12 right-6" },
    { icon: Banknote, color: "from-amber-400 to-amber-500", position: "bottom-12 left-6" },
  ]

  return (
    <div className={`flex flex-col items-center justify-center space-y-10 ${className}`}>
      {/* Enhanced main illustration container */}
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Multiple animated background rings */}
        <div
          className="absolute inset-0 border-2 border-dashed border-purple-300/60 rounded-full"
          style={{
            animation: `rotate 12s linear infinite`,
          }}
        />
        <div
          className="absolute inset-2 border border-dotted border-pink-300/40 rounded-full"
          style={{
            animation: `rotate 8s linear infinite reverse`,
          }}
        />
        <div
          className="absolute inset-4 border border-solid border-purple-200/30 rounded-full"
          style={{
            animation: `pulse 3s ease-in-out infinite`,
          }}
        />

        {/* Enhanced floating decorative elements */}
        <div
          className="absolute top-1 right-3 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg"
          style={{
            animation: `floatStar 4s ease-in-out infinite`,
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        />

        {/* Animated sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full shadow-sm"
            style={{
              top: `${20 + Math.sin(i * 45) * 30}%`,
              left: `${20 + Math.cos(i * 45) * 30}%`,
              animation: `sparkle 2s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}

        {/* Enhanced calculator with more details */}
        <div
          className={`${currentSize.calc} bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-2xl relative z-20 flex flex-col overflow-hidden border border-purple-400/30`}
          style={{
            animation: `calculatorBounce 3s ease-in-out infinite`,
          }}
        >
          {/* Calculator screen with glow */}
          <div className="h-1/3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 m-1.5 rounded-md flex items-center justify-end px-2 relative overflow-hidden shadow-inner">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"
              style={{
                animation: `screenGlow 2s ease-in-out infinite`,
              }}
            />
            <div
              className="text-green-400 text-xs font-mono font-bold relative z-10 drop-shadow-sm"
              style={{
                animation: `typeNumbers 4s steps(6, end) infinite`,
              }}
            >
              Accounting
            </div>
          </div>

          {/* Enhanced calculator buttons with realistic press effect */}
          <div className="flex-1 grid grid-cols-3 gap-1 p-1.5">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/30 to-white/10 rounded-sm flex items-center justify-center shadow-sm border border-white/20 relative overflow-hidden"
                style={{
                  animation: `buttonPress 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                  style={{
                    animation: `buttonShine 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm relative z-10" />
              </div>
            ))}
          </div>

          {/* Calculator brand label */}
          {/* <div className="absolute bottom-0.5 left-1 text-xs text-white/60 font-bold">ABIC</div> */}
        </div>

        {/* Enhanced document with animated content */}
        <div
          className={`${currentSize.doc} bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl shadow-2xl relative z-20 ml-3 flex flex-col overflow-hidden border border-pink-400/30`}
          style={{
            animation: `documentSlide 3.5s ease-in-out infinite`,
            animationDelay: "0.5s",
          }}
        >
          {/* Document header with logo */}
          <div className="h-1/4 bg-gradient-to-br from-white/25 to-white/15 m-1.5 rounded-md flex items-center px-2 relative">
            <div className="w-2 h-2 bg-white/90 rounded-full mr-1 shadow-sm" />
            <div className="flex-1 space-y-0.5">
              <div
                className="h-0.5 bg-white/80 rounded"
                style={{
                  animation: `fillHeader 4s ease-in-out infinite`,
                  width: "80%",
                }}
              />
              <div
                className="h-0.5 bg-white/60 rounded"
                style={{
                  animation: `fillHeader 4s ease-in-out infinite`,
                  animationDelay: "0.2s",
                  width: "60%",
                }}
              />
            </div>
          </div>

          {/* Document content with table-like structure */}
          <div className="flex-1 p-1.5 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex space-x-1 items-center"
                style={{
                  animation: `fillLine 4s ease-in-out infinite`,
                  animationDelay: `${0.8 + i * 0.3}s`,
                }}
              >
                <div className="w-1 h-1 bg-white/60 rounded-full" />
                <div className="flex-1 h-0.5 bg-white/70 rounded" />
                <div className="w-2 h-0.5 bg-white/50 rounded" />
                <div className="w-1.5 h-0.5 bg-white/60 rounded" />
              </div>
            ))}
          </div>

          {/* Document footer */}
          <div className="h-1/6 bg-gradient-to-r from-white/20 to-white/10 mx-1.5 mb-1.5 rounded-sm flex items-center justify-center">
            <div className="text-xs text-white/70 font-bold">REPORT</div>
          </div>
        </div>

        {/* Enhanced floating accounting icons with trails */}
        {floatingElements.map((item, i) => {
          const IconComponent = item.icon
          return (
            <div
              key={i}
              className={`absolute ${item.position} opacity-40`}
              style={{
                animation: `floatIcon 5s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            >
              <div className={`p-2 bg-gradient-to-br ${item.color} rounded-full shadow-lg`}>
                <IconComponent className={`${currentSize.icon} text-white`} />
              </div>
              {/* Icon trail effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-full opacity-30 blur-sm`}
                style={{
                  animation: `iconTrail 5s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            </div>
          )
        })}

        {/* Money particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 font-bold text-xs opacity-60"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 12}%`,
              animation: `moneyFloat 6s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            $
          </div>
        ))}
      </div>

      {/* Enhanced progress visualization */}
      <div className="relative">
        {/* Main progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full relative"
            style={{
              animation: `progressFill 4s ease-in-out infinite`,
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{
                animation: `progressShimmer 2s ease-in-out infinite`,
              }}
            />
          </div>
        </div>

        {/* Progress percentage */}
        <div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-purple-600"
          style={{
            animation: `percentageCount 4s ease-in-out infinite`,
          }}
        >
  
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-3 mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg"
              style={{
                animation: `progressDot 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced ABIC Accounting text */}
      <div className="text-center space-y-4 relative">
        <div
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 ${textSizes[size]} tracking-wide relative`}
        >
          ABIC Accounting
          <div
            className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 via-pink-600/30 to-purple-700/20 blur-xl -z-10"
            style={{
              animation: `textGlow 3s ease-in-out infinite`,
            }}
          />
        </div>
        <div className={`text-purple-600 font-medium ${textSizes[size]} opacity-90 relative`}>
          <span
            style={{
              animation: `typeText 5s steps(40, end) infinite`,
            }}
          >
            {text}
          </span>
          <span
            className="inline-block w-0.5 h-5 bg-purple-600 ml-1"
            style={{
              animation: `blink 1s step-end infinite`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        
        @keyframes floatStar {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-8px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-12px) rotate(180deg) scale(1.2); }
          75% { transform: translateY(-8px) rotate(270deg) scale(1.1); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes calculatorBounce {
          0%, 100% { transform: translateY(0px) scale(1) rotateY(0deg); }
          25% { transform: translateY(-3px) scale(1.02) rotateY(2deg); }
          50% { transform: translateY(-6px) scale(1.04) rotateY(0deg); }
          75% { transform: translateY(-3px) scale(1.02) rotateY(-2deg); }
        }
        
        @keyframes screenGlow {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes typeNumbers {
          0% { content: "0"; }
          16% { content: "12"; }
          33% { content: "123"; }
          50% { content: "1,234"; }
          66% { content: "12,345"; }
          83%, 100% { content: "123,456"; }
        }
        
        @keyframes buttonPress {
          0%, 90%, 100% { 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          5% { 
            transform: scale(0.95); 
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
        }
        
        @keyframes buttonShine {
          0%, 90%, 100% { opacity: 0; }
          5% { opacity: 1; }
        }
        
        @keyframes documentSlide {
          0%, 100% { transform: translateX(0px) scale(1) rotateY(0deg); }
          25% { transform: translateX(-2px) scale(1.01) rotateY(-1deg); }
          50% { transform: translateX(-4px) scale(1.02) rotateY(0deg); }
          75% { transform: translateX(-2px) scale(1.01) rotateY(1deg); }
        }
        
        @keyframes fillHeader {
          0% { width: 0%; opacity: 0.4; }
          50% { width: 100%; opacity: 0.9; }
          100% { width: 80%; opacity: 0.7; }
        }
        
        @keyframes fillLine {
          0% { opacity: 0.3; transform: scaleX(0.2); }
          50% { opacity: 0.9; transform: scaleX(1); }
          100% { opacity: 0.6; transform: scaleX(0.8); }
        }
        
        @keyframes floatIcon {
          0%, 100% { 
            transform: translateY(0px) scale(1) rotate(0deg); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateY(-20px) scale(1.15) rotate(10deg); 
            opacity: 0.8; 
          }
        }
        
        @keyframes iconTrail {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.1; }
        }
        
        @keyframes moneyFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateY(-25px) rotate(180deg); 
            opacity: 0.9; 
          }
        }
        
        @keyframes progressFill {
          0% { width: 5%; }
          25% { width: 35%; }
          50% { width: 65%; }
          75% { width: 85%; }
          100% { width: 95%; }
        }
        
        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes percentageCount {
          0% { content: "0%"; }
          25% { content: "25%"; }
          50% { content: "50%"; }
          75% { content: "75%"; }
          100% { content: "95%"; }
        }
        
        @keyframes progressDot {
          0%, 100% { 
            transform: scale(0.8) translateY(0px); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.4) translateY(-5px); 
            opacity: 1; 
          }
        }
        
        @keyframes textGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes typeText {
          0% { width: 0; }
          70% { width: 100%; }
          100% { width: 100%; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
