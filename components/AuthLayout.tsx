import { Zap } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0b12]">
      {/* Left side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0b12] items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />
        
        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          {/* Glass Icon Container */}
          <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-10 border border-white/10 shadow-2xl relative group transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-[#06b6d4]/10 rounded-[2rem] blur-2xl group-hover:bg-[#06b6d4]/20 transition-all"></div>
            <Zap className="w-10 h-10 text-[#06b6d4] drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>
          
          <div className="flex items-center justify-center gap-6 w-full mb-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-[#06b6d4]/40"></div>
            <h2 className="text-white/80 tracking-[0.4em] font-medium text-[10px] uppercase">
              Inventory Management System
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-[#06b6d4]/40"></div>
          </div>

          <h1 className="text-white text-7xl font-bold tracking-tighter mb-2 leading-none">
            R&J
          </h1>
          <h2 className="text-[#06b6d4] text-3xl font-black tracking-[0.2em] mb-8 uppercase drop-shadow-sm">
            Management
          </h2>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse"></div>
            <div className="h-[1px] w-48 bg-gradient-to-r from-[#06b6d4]/20 via-white/10 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Right side - Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
