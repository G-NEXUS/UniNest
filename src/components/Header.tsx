import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Key, 
  ShieldCheck, 
  User, 
  RotateCcw, 
  Sparkles, 
  Info, 
  Menu, 
  X, 
  ChevronDown, 
  Phone, 
  MessageSquare, 
  BadgeCheck, 
  Check 
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  agentFee: number;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  agentFee,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current && 
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-blue-900/40">
      
      {/* Top trust & safety strip */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-black text-blue-200 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center border-b border-blue-800/30 flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate">
          <strong className="text-white">CBU Student Safety:</strong> Inspect room physically before paying rent. Unlock fee is only <strong>K{agentFee}</strong>.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. LOGO TO THE LEFT */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-400 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40 group-hover:scale-105 transition-transform">
                <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Uni<span className="text-blue-500">Nest</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60 uppercase tracking-wider">
                    CBU Agent
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-blue-300/70 font-medium -mt-0.5">
                  Copperbelt University Verified Boarding Houses
                </p>
              </div>
            </a>
          </div>

          {/* 2. DESKTOP CENTER BADGE */}
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-zinc-950 border border-blue-900/60 text-xs font-semibold text-blue-300 flex items-center gap-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CBU Kitwe Zone • Riverside, Kwacha, Eastlea</span>
            </span>
          </div>

          {/* 3. RIGHT SIDE: DESKTOP PROFILE & MOBILE HAMBURGER DROPDOWN */}
          <div className="flex items-center gap-2">
            
            {/* DESKTOP PROFILE DROPDOWN ON THE RIGHT */}
            <div className="relative hidden md:block" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl bg-zinc-950 hover:bg-blue-950/60 border border-blue-900/60 hover:border-blue-500/60 transition-all cursor-pointer shadow-sm"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl border border-blue-500 object-cover"
                />
                <div className="text-left leading-tight">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </p>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {/* Desktop Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-blue-500/50 rounded-2xl p-4 shadow-2xl shadow-blue-950 glow-blue animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="pb-3 border-b border-blue-900/40 mb-3">
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-blue-300/80">{currentUser.email}</p>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">{currentUser.phone}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                      Active Role: {currentUser.role}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">
                    Switch Account Role:
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          currentUser.id === u.id
                            ? 'bg-blue-600/30 text-white border border-blue-500/50'
                            : 'text-blue-300 hover:bg-black hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-lg object-cover" />
                          <div className="text-left">
                            <p className="font-semibold">{u.name}</p>
                            <span className="text-[10px] text-blue-400 capitalize">{u.role}</span>
                          </div>
                        </div>
                        {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onResetData();
                        setProfileDropdownOpen(false);
                      }}
                      className="text-[11px] text-blue-400/80 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SMALL SCREENS: HAMBURGER BUTTON WITH RIGHT DROPDOWN MENU CONTAINING PROFILE */}
            <div className="relative md:hidden" ref={mobileDropdownRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-blue-950 border border-blue-800/60 text-blue-200 hover:text-white transition-all cursor-pointer shadow-md"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-blue-400" /> : <Menu className="w-5 h-5 text-blue-400" />}
              </button>

              {/* RIGHT-ALIGNED COMPACT DROPDOWN ON SMALL SCREENS */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-zinc-950 border border-blue-500/60 rounded-2xl p-4 shadow-2xl shadow-blue-950 glow-blue z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                  
                  {/* PROFILE INSIDE THE NAV MENU */}
                  <div className="bg-black/90 rounded-xl p-3 border border-blue-900/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-xl border border-blue-400 object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                          {currentUser.isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-blue-300/80 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 uppercase">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Switcher in dropdown */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Switch Role:
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {allUsers.map((u) => {
                        const isActive = currentUser.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setMobileMenuOpen(false);
                            }}
                            className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                                : 'bg-black border-blue-900/60 text-blue-300 hover:bg-blue-950/40'
                            }`}
                          >
                            {u.role === 'student' && <User className="w-3.5 h-3.5" />}
                            {u.role === 'landlord' && <Home className="w-3.5 h-3.5" />}
                            {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                            <span className="capitalize text-[11px]">{u.role}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Agent Help Line */}
                  <div className="pt-2 border-t border-blue-900/40 space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      CBU Agent Line:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="https://wa.me/260979990000?text=Hello%20UniNest%20CBU%20Agent"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold rounded-xl text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href="tel:+260979990000"
                        className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-950/70 border border-blue-800 text-blue-300 font-bold rounded-xl text-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Agent</span>
                      </a>
                    </div>
                  </div>

                  {/* Reset demo data */}
                  <div className="pt-2 border-t border-blue-900/30 flex justify-between items-center text-[11px]">
                    <span className="text-blue-400/60">Demo Data:</span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onResetData();
                      }}
                      className="text-blue-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </header>
  );
};
