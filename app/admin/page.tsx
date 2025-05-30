"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const adminSections = [
    {
      title: "Player Management",
      description: "Add, edit, and manage player profiles and statistics",
      href: "/admin/players",
      icon: "👤",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Team Management",
      description: "Manage rosters, propose trades, and handle transfers",
      href: "/admin/teams",
      icon: "🔄",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Game Management",
      description: "Add new games, update scores, and manage game data",
      href: "/admin/games",
      icon: "🏆",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "MVP Voting",
      description: "Monitor MVP votes and manage voting system",
      href: "/admin/mvp",
      icon: "⭐",
      color: "bg-yellow-600 hover:bg-yellow-700"
    },
    {
      title: "League Records",
      description: "Update league records and achievements",
      href: "/admin/records",
      icon: "📊",
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      title: "Season Settings",
      description: "Configure season parameters and league settings",
      href: "/admin/settings",
      icon: "⚙️",
      color: "bg-gray-600 hover:bg-gray-700"
    },
    {
      title: "Data Management",
      description: "Migrate data to Firebase and manage database",
      href: "/admin/data",
      icon: "💾",
      color: "bg-indigo-600 hover:bg-indigo-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> League
              </Link>
              <span className="text-gray-300 text-sm">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user.email}
                <span className="text-red-400 ml-1">(Admin)</span>
              </span>
              <Link
                href="/"
                className="text-white hover:text-orange-400 transition-colors"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage all aspects of the Denlow Basketball Association
          </p>
        </div>
      </section>

      {/* Admin Sections */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`${section.color} rounded-xl p-6 border border-white/20 transition-all transform hover:scale-105 group`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{section.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-100">
                    {section.title}
                  </h3>
                  <p className="text-gray-200 text-sm">
                    {section.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Overview</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Players</h3>
              <p className="text-3xl font-bold text-white">10</p>
              <p className="text-gray-300 text-sm">Active players</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Teams</h3>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-gray-300 text-sm">Los Sigmas & Golden Dragons</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Games Played</h3>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-gray-300 text-sm">Season games</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">MVP Votes</h3>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-gray-300 text-sm">Total votes cast</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Recent Activity</h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">Game 3 Added</p>
                    <p className="text-gray-300 text-sm">Golden Dragons 52 - 50 Los Sigmas</p>
                  </div>
                  <span className="text-gray-400 text-sm">Today</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">Player Stats Updated</p>
                    <p className="text-gray-300 text-sm">Season averages recalculated</p>
                  </div>
                  <span className="text-gray-400 text-sm">Yesterday</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">MVP Voting Opened</p>
                    <p className="text-gray-300 text-sm">Public voting system activated</p>
                  </div>
                  <span className="text-gray-400 text-sm">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. Admin Panel.</p>
        </div>
      </footer>
    </div>
  );
}
