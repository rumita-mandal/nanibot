'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BookOpen, PlusCircle, Archive, MapPin, ShieldCheck, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { authApi } from '@/lib/api';
import { User } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(authApi.getCurrentUserFromStorage());
  }, [pathname]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/chat', label: 'Ask NaniBot', icon: Sparkles, highlight: true },
    { href: '/explore', label: 'Explore Wisdom', icon: BookOpen },
    { href: '/contribute', label: "Add Nani's Wisdom", icon: PlusCircle },
    { href: '/archive', label: "Family Notebook", icon: Archive },
    { href: '/wisdom/Bengal', label: "Regional", icon: MapPin },
  ];

  if (user?.is_admin) {
    navLinks.push({ href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-parchment-50/90 backdrop-blur-md border-b border-parchment-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turmeric-400 to-terracotta-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              🌿
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-charcoal tracking-tight">
                NaniBot
              </span>
              <span className="text-[10px] text-terracotta-600 font-sans font-medium uppercase tracking-wider">
                The Wisdom We Inherited
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    link.highlight
                      ? 'bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white shadow-sm hover:opacity-95 hover:shadow-warm'
                      : isActive
                      ? 'bg-parchment-200 text-terracotta-700 font-semibold'
                      : 'text-charcoal/80 hover:text-terracotta-600 hover:bg-parchment-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-charcoal/70 bg-parchment-200/60 px-2.5 py-1 rounded-full border border-parchment-300">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-charcoal/60 hover:text-terracotta-600 hover:bg-parchment-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-parchment-300 text-sm font-medium text-charcoal hover:border-terracotta-500 hover:text-terracotta-600 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-charcoal hover:bg-parchment-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-parchment-200 bg-parchment-50 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal hover:bg-parchment-200"
              >
                <Icon className="w-4 h-4 text-terracotta-600" />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-terracotta-600 hover:bg-parchment-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out ({user.name})
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-terracotta-600 hover:bg-parchment-200"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
