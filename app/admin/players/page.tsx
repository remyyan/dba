"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPlayers, addNewPlayer, updatePlayer, Player, PlayerPosition, getPositionColor, getPositionName } from "@/lib/data";

export default function AdminPlayersPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState(getAllPlayers());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    team: '',
    points: 0,
    careerHigh: 0,
    rebounds: 0,
    assists: 0,
    threePointersMade: 0,
    fieldGoalPercentage: 0,
    threePointPercentage: 0,
    freeThrowPercentage: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    freeThrowAttempts: 0,
    mvpVotes: 0
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      team: '',
      points: 0,
      careerHigh: 0,
      rebounds: 0,
      assists: 0,
      threePointersMade: 0,
      fieldGoalPercentage: 0,
      threePointPercentage: 0,
      freeThrowPercentage: 0,
      steals: 0,
      blocks: 0,
      minutes: 0,
      freeThrowAttempts: 0,
      mvpVotes: 0
    });
    setShowAddForm(false);
    setEditingPlayer(null);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setFormData(player);
    setShowAddForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.team) {
      alert('Please fill in player name and team');
      return;
    }

    if (editingPlayer) {
      // Update existing player
      const success = updatePlayer(editingPlayer.name, formData);
      if (success) {
        setPlayers(getAllPlayers());
        resetForm();
      }
    } else {
      // Add new player
      const success = addNewPlayer(formData as Omit<Player, 'id'>);
      if (success) {
        setPlayers(getAllPlayers());
        resetForm();
      }
    }
  };

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
                            player.position
                              ? getPositionColor(player.position)
                              : player.team === 'Golden Dragons'
                              ? 'bg-yellow-600'
                              : player.team === 'Los Sigmas'
                              ? 'bg-red-600'
                              : 'bg-gray-600'
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {player.jerseyNumber || player.position ||
                                (player.team === 'Free Agents'
                                  ? 'FA'
                                  : player.name.split(' ').map(n => n[0]).join('')
                                )
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-white font-semibold">{player.name}</span>
                            {player.position && (
                              <div className="text-gray-300 text-xs">
                                {getPositionName(player.position)} {player.height && player.weight && `• ${player.height}, ${player.weight}`}
                              </div>
                            )}
                          </div>
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
                            onClick={() => handleEditPlayer(player)}
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
                        player.team === 'Golden Dragons'
                          ? 'bg-yellow-600'
                          : player.team === 'Los Sigmas'
                          ? 'bg-red-600'
                          : 'bg-gray-600'
                      }`}>
                        <span className="text-white font-bold text-xs">
                          {player.team === 'Free Agents'
                            ? 'FA'
                            : player.name.split(' ').map(n => n[0]).join('')
                          }
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className={`text-sm ${
                          player.team === 'Free Agents' ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                          {player.team === 'Free Agents' ? '🆓 Free Agent' : player.team}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPlayer(player)}
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
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Team</label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.team || ''}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                  >
                    <option value="">Select team...</option>
                    <option value="Golden Dragons">Golden Dragons</option>
                    <option value="Los Sigmas">Los Sigmas</option>
                    <option value="Free Agents">🆓 Free Agents</option>
                  </select>
                </div>
              </div>

              {/* Position and Physical Info */}
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Position</label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({...formData, position: e.target.value as PlayerPosition})}
                  >
                    <option value="">Select position...</option>
                    <option value="G">Guard (G)</option>
                    <option value="F">Forward (F)</option>
                    <option value="C">Center (C)</option>
                    <option value="UTIL">Utility (UTIL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Jersey #</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.jerseyNumber || ''}
                    onChange={(e) => setFormData({...formData, jerseyNumber: parseInt(e.target.value) || undefined})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Height</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="6'2&quot;"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Weight</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="180 lbs"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>

              {/* Basic Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Points Per Game</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.points || 0}
                    onChange={(e) => setFormData({...formData, points: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Rebounds Per Game</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.rebounds || 0}
                    onChange={(e) => setFormData({...formData, rebounds: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Assists Per Game</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.assists || 0}
                    onChange={(e) => setFormData({...formData, assists: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Advanced Stats */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Field Goal %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.fieldGoalPercentage || 0}
                    onChange={(e) => setFormData({...formData, fieldGoalPercentage: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Three Point %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.threePointPercentage || 0}
                    onChange={(e) => setFormData({...formData, threePointPercentage: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={!formData.name || !formData.team}
                >
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
