"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPlayers } from "@/lib/data";

export default function AdminPlayersPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState(getAllPlayers());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

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

  const activePlayers = players.filter(p => p.points > 0);
  const inactivePlayers = players.filter(p => p.points === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> Admin
              </Link>
              <span className="text-gray-300 text-sm">Player Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="text-white hover:text-orange-400 transition-colors"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Player Management</h1>
              <p className="text-xl text-gray-300">Add, edit, and manage player profiles and statistics</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add New Player
            </button>
          </div>
        </div>
      </section>

      {/* Player Statistics Overview */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Players</h3>
              <p className="text-3xl font-bold text-white">{players.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-green-400 mb-2">Active Players</h3>
              <p className="text-3xl font-bold text-white">{activePlayers.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Golden Dragons</h3>
              <p className="text-3xl font-bold text-white">{players.filter(p => p.team === 'Golden Dragons').length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-red-400 mb-2">Los Sigmas</h3>
              <p className="text-3xl font-bold text-white">{players.filter(p => p.team === 'Los Sigmas').length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Players */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Active Players</h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Player</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Team</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">PPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">RPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">APG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">MVP Votes</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlayers.map((player, index) => (
                    <tr key={player.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            player.team === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-white font-semibold">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white">{player.team}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{player.points}</td>
                      <td className="px-6 py-4 text-center text-white">{player.rebounds}</td>
                      <td className="px-6 py-4 text-center text-white">{player.assists}</td>
                      <td className="px-6 py-4 text-center text-white">{player.mvpVotes || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setEditingPlayer(player)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Inactive Players */}
      {inactivePlayers.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Inactive Players</h2>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactivePlayers.map((player) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        player.team === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        <span className="text-white font-bold text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-gray-300 text-sm">{player.team}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingPlayer(player)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors">
                        Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add/Edit Player Modal would go here */}
      {(showAddForm || editingPlayer) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Player Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter player name"
                    defaultValue={editingPlayer?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Team</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="Golden Dragons">Golden Dragons</option>
                    <option value="Los Sigmas">Los Sigmas</option>
                  </select>
                </div>
              </div>
              
              {/* More form fields would go here */}
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPlayer(null);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. Admin Panel.</p>
        </div>
      </footer>
    </div>
  );
}
