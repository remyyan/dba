"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllGames } from "@/lib/data";

export default function AdminGamesPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState(getAllGames());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);

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
              <span className="text-gray-300 text-sm">Game Management</span>
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
              <h1 className="text-4xl font-bold text-white mb-2">Game Management</h1>
              <p className="text-xl text-gray-300">Add new games, update scores, and manage game data</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add New Game
            </button>
          </div>
        </div>
      </section>

      {/* Game Statistics Overview */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Games</h3>
              <p className="text-3xl font-bold text-white">{games.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-red-400 mb-2">Los Sigmas Wins</h3>
              <p className="text-3xl font-bold text-white">
                {games.filter(g => g.team2Score > g.team1Score).length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Golden Dragons Wins</h3>
              <p className="text-3xl font-bold text-white">
                {games.filter(g => g.team1Score > g.team2Score).length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-green-400 mb-2">Avg Total Score</h3>
              <p className="text-3xl font-bold text-white">
                {games.length > 0 ? Math.round(games.reduce((sum, g) => sum + g.team1Score + g.team2Score, 0) / games.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games List */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">All Games</h2>
          
          <div className="space-y-6">
            {games.map((game) => (
              <div key={game.gameNumber} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Final
                      </span>
                      <span className="text-gray-300">{new Date(game.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingGame(game)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Edit Game
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    {/* Golden Dragons */}
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                        <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">GD</span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">Golden Dragons</p>
                          <p className="text-gray-300 text-sm">Team 1</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white">{game.team1Score}</p>
                    </div>

                    {/* VS and Game Info */}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400 mb-2">Game {game.gameNumber}</p>
                      <p className="text-gray-300 text-sm">Final Score</p>
                      <p className="text-white font-semibold mt-2">
                        {game.team2Score > game.team1Score ? 'Los Sigmas Win' : 'Golden Dragons Win'}
                      </p>
                    </div>

                    {/* Los Sigmas */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">LS</span>
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">Los Sigmas</p>
                          <p className="text-gray-300 text-sm">Team 2</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white">{game.team2Score}</p>
                    </div>
                  </div>

                  {/* Quarter Scores */}
                  {game.quarters && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                      <h4 className="text-orange-400 font-semibold mb-3">Quarter by Quarter</h4>
                      <div className="grid grid-cols-5 gap-4 text-center text-sm">
                        <div className="font-semibold text-gray-300">Team</div>
                        <div className="font-semibold text-gray-300">Q1</div>
                        <div className="font-semibold text-gray-300">Q2</div>
                        <div className="font-semibold text-gray-300">Q3</div>
                        <div className="font-semibold text-gray-300">Q4</div>
                        
                        <div className="text-white font-semibold">GD</div>
                        <div className="text-white">{game.quarters.q1.team1}</div>
                        <div className="text-white">{game.quarters.q2.team1}</div>
                        <div className="text-white">{game.quarters.q3.team1 || '-'}</div>
                        <div className="text-white">{game.quarters.q4.team1}</div>
                        
                        <div className="text-white font-semibold">LS</div>
                        <div className="text-white">{game.quarters.q1.team2}</div>
                        <div className="text-white">{game.quarters.q2.team2}</div>
                        <div className="text-white">{game.quarters.q3.team2 || '-'}</div>
                        <div className="text-white">{game.quarters.q4.team2}</div>
                      </div>
                    </div>
                  )}

                  {/* Top Performers */}
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-orange-400 font-semibold mb-3">Top Performers</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-white font-semibold mb-2">Golden Dragons</h5>
                        <div className="space-y-1">
                          {game.team1Players.map((player) => (
                            <div key={player.name} className="text-sm text-gray-300">
                              {player.name}: {player.points} PTS, {player.rebounds} REB, {player.assists} AST
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold mb-2">Los Sigmas</h5>
                        <div className="space-y-1">
                          {game.team2Players.map((player) => (
                            <div key={player.name} className="text-sm text-gray-300">
                              {player.name}: {player.points} PTS, {player.rebounds} REB, {player.assists} AST
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add/Edit Game Modal */}
      {(showAddForm || editingGame) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </h3>
            
            <div className="space-y-6">
              {/* Basic Game Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Game Number</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Game #"
                    defaultValue={editingGame?.gameNumber || games.length + 1}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    defaultValue={editingGame?.date || ''}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Status</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="Final">Final</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Team Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-600/20 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-3">Golden Dragons</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Final Score</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Score"
                        defaultValue={editingGame?.team1Score || ''}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-red-600/20 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-3">Los Sigmas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Final Score</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Score"
                        defaultValue={editingGame?.team2Score || ''}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGame(null);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  {editingGame ? 'Update Game' : 'Add Game'}
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
