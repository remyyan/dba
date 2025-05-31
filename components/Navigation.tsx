"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin, isTeamManager, managedTeam } = useAuth();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/teams", label: "Teams" },
    { href: "/games", label: "Games" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
              <span className="text-orange-400">DBA</span> League
            </Link>
            <span className="text-gray-300 text-sm hidden sm:block">Denlow Basketball Association</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-orange-400 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Admin Panel Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
              >
                Admin Panel
              </Link>
            )}

            {/* Team Manager Panel Link */}
            {isTeamManager && (
              <Link
                href="/team-manager"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors"
              >
                Team Manager
              </Link>
            )}

            {/* Authentication */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
                  {user.email}
                  {isAdmin && <span className="text-red-400 ml-1">(Admin)</span>}
                  {isTeamManager && <span className="text-blue-400 ml-1">({managedTeam} Manager)</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-orange-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-orange-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white hover:text-orange-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin Panel Link - Mobile */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              {/* Team Manager Panel Link - Mobile */}
              {isTeamManager && (
                <Link
                  href="/team-manager"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Team Manager
                </Link>
              )}

              {/* Authentication - Mobile */}
              {user ? (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-300 text-sm mb-2">
                    {user.email}
                    {isAdmin && <span className="text-red-400 ml-1">(Admin)</span>}
                    {isTeamManager && <span className="text-blue-400 ml-1">({managedTeam} Manager)</span>}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-orange-400 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
