'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bot, Leaf, LogOut, Sprout, MessageCircle, Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logoutUser, getSession } from '@/lib/auth';
import Image from 'next/image';

interface SidebarLink {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  description: string;
  gradient: string;
}

const mainItems: SidebarLink[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Tinjauan & Analisis',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    title: 'Pak Tani',
    url: '/dashboard/chatbot',
    icon: Bot,
    description: 'Asisten Virtual',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Tanaman',
    url: '/dashboard/inventory',
    icon: Leaf,
    description: 'Pengecekan Tanaman',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Forum Diskusi',
    url: '/dashboard/discussions',
    icon: MessageCircle,
    description: 'Diskusi & Tanya Jawab',
    gradient: 'from-orange-500 to-red-600',
  },
];

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp }: { children: React.ReactNode; open?: boolean; setOpen?: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
};

export const CekTaniSidebar = ({ children, open, setOpen }: { children: React.ReactNode; open?: boolean; setOpen?: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex h-screen">
        <SidebarBody />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>

      {/* Mobile Layout - Vertical */}
      <div className="md:hidden flex flex-col h-screen">
        <SidebarBody />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </SidebarProvider>
  );
};

const SidebarBody = () => {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

const DesktopSidebar = () => {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const session = await getSession();
        setUser(session);
      } catch (error) {
        console.error('Failed to get user info:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  const isActiveLink = (url: string) => {
    return pathname === url || (url !== '/dashboard' && pathname.startsWith(url));
  };

  return (
    <motion.div
      className={cn('h-full px-4 py-6 hidden md:flex md:flex-col bg-white border-r border-gray-200 shadow-sm shrink-0')}
      animate={{
        width: open ? '280px' : '80px',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <Image src="/Logo.svg" alt="CekTani Logo" width={40} height={40} className="object-contain" />
          </div>
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              display: open ? 'block' : 'none',
            }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent whitespace-nowrap">CekTani</h1>
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Smart Plant Care</p>
          </motion.div>
        </div>
        {/* Navigation */}
        <div className="flex-1">
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              height: open ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 overflow-hidden"
          >
            {open && 'Main Menu'}
          </motion.div>

          <div className="space-y-2">
            {mainItems.map((item) => (
              <SidebarLink key={item.title} link={item} isActive={isActiveLink(item.url)} onClick={() => handleNavigation(item.url)} />
            ))}
          </div>
        </div>
        {/* User Profile & Logout */}
        <div className="space-y-3">
          {user && (
            <motion.div
              animate={{
                opacity: open ? 1 : 0.7,
              }}
              className={cn('flex items-center transition-all duration-200', open ? 'gap-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200' : 'justify-center')}
            >
              <div className="relative">
                <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-md', open ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs')}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className={cn('absolute bg-green-500 rounded-full border-2 border-white', open ? '-bottom-1 -right-1 w-4 h-4' : '-bottom-0.5 -right-0.5 w-2.5 h-2.5')}></div>
              </div>
              <motion.div
                animate={{
                  opacity: open ? 1 : 0,
                  width: open ? 'auto' : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {open && (
                  <div>
                    <p className="font-semibold text-slate-800">{user.username}</p>
                    <p className="text-xs text-green-600 font-medium">Online</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              height: open ? 'auto' : 0,
              display: open ? 'flex' : 'none',
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Button onClick={handleLogout} disabled={isLoading} variant="ghost" className={cn('w-full transition-all duration-200 justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 border rounded-lg p-3')}>
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const MobileSidebar = () => {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const session = await getSession();
        setUser(session);
      } catch (error) {
        console.error('Failed to get user info:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  const isActiveLink = (url: string) => {
    return pathname === url || (url !== '/dashboard' && pathname.startsWith(url));
  };

  return (
    <>
      {/* Mobile Header - Fixed at top */}
      <div className="shrink-0 h-16 px-4 flex md:hidden items-center justify-between bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <Image src="/Logo.svg" alt="CekTani Logo" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">CekTani</h1>
        </div>

        <button onClick={() => setOpen(!open)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="text-gray-600 w-6 h-6" />
        </button>
      </div>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ x: '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center">
                  <Image src="/Logo.svg" alt="CekTani Logo" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">CekTani</h1>
                  <p className="text-xs text-slate-500 font-medium">Smart Plant Care</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Main Menu</div>

              <div className="space-y-2 mb-8">
                {mainItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleNavigation(item.url)}
                    className={cn('w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left', isActiveLink(item.url) ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'text-gray-700 hover:bg-gray-50')}
                  >
                    <item.icon className={cn('w-5 h-5', isActiveLink(item.url) ? 'text-green-600' : 'text-gray-500')} />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* User & Logout */}
              {user && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold shadow-md">{user.username.charAt(0).toUpperCase()}</div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.username}</p>
                      <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                  </div>

                  <Button onClick={handleLogout} disabled={isLoading} variant="outline" className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                    <LogOut className="w-4 h-4" />
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarLink = ({ link, isActive, onClick }: { link: SidebarLink; isActive: boolean; onClick: () => void }) => {
  const { open } = useSidebar();

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center transition-all duration-200 group text-left',
        open ? 'gap-4 p-4 rounded-xl' : 'justify-center p-3 rounded-lg',
        isActive ? (open ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-green-50 text-green-700') : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <link.icon className={cn('shrink-0', open ? 'w-5 h-5' : 'w-5 h-5', isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700')} />

      <motion.div
        animate={{
          opacity: open ? 1 : 0,
          width: open ? 'auto' : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        {open && (
          <div>
            <div className="font-medium">{link.title}</div>
            <div className="text-xs text-gray-500">{link.description}</div>
          </div>
        )}
      </motion.div>
    </button>
  );
};
