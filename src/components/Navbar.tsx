'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar({ className }: { className?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      setIsAtTop(scrollY < 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Setup Intersection Observer untuk mendeteksi section aktif
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
// Di dalam useEffect Intersection Observer, ubah threshold dan rootMargin
observerRef.current = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        setActiveSection(entry.target.id);
      }
    });
  },
  {
    rootMargin: '-100px 0px -200px 0px', // Adjust untuk navbar dan section
    threshold: 0.5
  }
);

    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observerRef.current?.unobserve(section);
      });
    };
  }, []);

  const navItems = [
    { name: 'Beranda', href: '#hero', section: 'hero' },
    { name: 'Fitur', href: '#features', section: 'features' },
    { name: 'Cara Kerja', href: '#how-it-works', section: 'how-it-works' },
    { name: 'Tim', href: '#team', section: 'team' },
  ];

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  setIsMobileMenuOpen(false);
  
  const targetId = href.replace('#', '');
  const targetElement = document.getElementById(targetId);
  
  if (targetElement) {
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset; // Adjust offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
  return (
    <div className={cn('fixed top-6 inset-x-0 max-w-4xl mx-auto z-50 px-4', className)}>
      <nav
        className={`relative transition-all duration-300 rounded-full backdrop-blur-md border shadow-lg ${
          isAtTop ? 'bg-transparent border-transparent shadow-none' : isScrolled ? 'bg-white/90 border-gray-200/50 shadow-xl' : 'bg-white/80 border-white/20'
        }`}
      >
        <div className="flex justify-between items-center h-16 px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
            <Image src="/Logo.svg" alt="CekTani Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r ${isAtTop ? 'from-green-700 to-green-900' : 'from-green-600 to-green-800'} bg-clip-text text-transparent`}>CekTani</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`${
                  activeSection === item.section
                    ? isAtTop 
                      ? 'text-green-700' 
                      : 'text-green-600'
                    : isAtTop 
                      ? 'text-gray-800 hover:text-green-700' 
                      : 'text-gray-700 hover:text-green-600'
                } transition-colors duration-200 font-medium relative group`}
              >
                {item.name}
                <span 
                  className={`absolute inset-x-0 -bottom-1 h-0.5 ${
                    activeSection === item.section 
                      ? 'scale-x-100' 
                      : 'scale-x-0 group-hover:scale-x-100'
                  } ${
                    isAtTop ? 'bg-green-700' : 'bg-green-600'
                  } transition-transform duration-200`} 
                />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">Masuk</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isAtTop ? 'text-gray-800 hover:text-green-700' : 'text-gray-700 hover:text-green-600'}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-xl">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`block px-3 py-2 ${
                    activeSection === item.section
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  } rounded-lg transition-colors duration-200`}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-2">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full">Mulai Sekarang</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}