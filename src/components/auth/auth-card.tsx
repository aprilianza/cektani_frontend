import { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  children: ReactNode
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md relative">
      {/* Glassy Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        
        {/* Highlight border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent p-px">
          <div className="h-full w-full rounded-2xl bg-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Title with glassy effect */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm">
              {title}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full opacity-80"></div>
          </div>
          
          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
        
      </div>
      
      {/* Shadow and backdrop elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl blur-xl transform translate-y-2 -z-10"></div>
      <div className="absolute inset-0 bg-white/5 rounded-2xl transform translate-y-1 -z-20"></div>
    </div>
  )
}