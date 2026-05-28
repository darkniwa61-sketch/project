import Image from "next/image"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0b12]">
      {/* Left side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0b12] items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-10 blur-sm"
          style={{ backgroundImage: 'url("/logo.png")' }}
        />
        
        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          
          <div className="relative group transition-all duration-500 hover:scale-105 mb-8">
            <div className="absolute inset-0 bg-white/10 rounded-[2rem] blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10 bg-white p-4 rounded-[2rem] border border-white/20 shadow-2xl">
              <Image 
                src="/logo.png" 
                alt="ST. Joseph Amity Prime Development Corp." 
                width={380} 
                height={140} 
                className="rounded-xl object-contain"
                priority
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 w-full mb-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/40"></div>
            <h2 className="text-white/80 tracking-[0.4em] font-medium text-[10px] uppercase">
              Inventory Management System
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/40"></div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
            <div className="h-[1px] w-48 bg-gradient-to-r from-white/40 via-white/10 to-transparent"></div>
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
