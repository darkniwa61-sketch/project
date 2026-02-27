import { Building2 } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Left side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#2a2421] items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-multiply"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />
        
        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          <div className="w-16 h-16 bg-[#c26941] rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex items-center justify-center gap-4 w-full mb-6">
            <div className="h-[1px] flex-1 bg-white/20"></div>
            <h2 className="text-white/60 tracking-[0.2em] font-medium text-xs">
              INVENTORY MANAGEMENT SYSTEM
            </h2>
            <div className="h-[1px] flex-1 bg-white/20"></div>
          </div>

          <h1 className="text-white text-3xl font-bold tracking-tight mb-2">
            ST. JOSEPH
          </h1>
          <h2 className="text-[#c26941] text-2xl font-bold tracking-tight mb-6">
            AMITY PRIME
          </h2>

          <div className="flex items-center justify-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-white/20"></div>
            <h3 className="text-white/40 tracking-[0.15em] font-medium text-[10px]">
              DEVELOPMENT CORPORATION
            </h3>
            <div className="h-[1px] flex-1 bg-white/20"></div>
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
