"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllGames, GameData, GamePlayerStats } from "@/lib/data";
import { parseGameCSV, validateGameData, CSVGameData } from "@/lib/csvParser";

export default function AdminGamesPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState(getAllGames());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [csvData, setCsvData] = useState<CSVGameData | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<GameData>>({});
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      const parsedData = parseGameCSV(csvContent);

      if (parsedData) {
        const errors = validateGameData(parsedData);
        setCsvErrors(errors);
        setCsvData(parsedData);

        if (errors.length === 0) {
          // Auto-fill form with CSV data
          setFormData({
            gameNumber: parsedData.gameNumber,
            date: new Date().toISOString().split('T')[0],
            team1Score: parsedData.team1Score,
            team2Score: parsedData.team2Score,
            team1Players: parsedData.team1Players,
            team2Players: parsedData.team2Players,
            quarters: parsedData.quarters
          });
        }
      } else {
        setCsvErrors(['Failed to parse CSV file. Please check the format.']);
      }
    };

    reader.readAsText(file);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingGame(null);
    setCsvData(null);
    setCsvErrors([]);
    setFormData({});
    setShowCSVImport(false);
  };

  const handleFormSubmit = () => {
    // Here you would typically save to your database
    // For now, we'll just update the local state
    console.log('Saving game data:', formData);

    // Reset form
    resetForm();

    // Refresh games list
    setGames(getAllGames());
  };

  const handleDeleteGame = (game: any) => {
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGame = () => {
    if (gameToDelete) {
      // Here you would typically delete from your database
      // For now, we'll just filter it out from the local state
      const updatedGames = games.filter(g => g.gameNumber !== gameToDelete.gameNumber);
      setGames(updatedGames);
      console.log('Deleted game:', gameToDelete.gameNumber);
    }

    // Reset delete state
    setGameToDelete(null);
    setShowDeleteConfirm(false);
  };

  const cancelDeleteGame = () => {
    setGameToDelete(null);
    setShowDeleteConfirm(false);
  };

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
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                + Add New Game
              </button>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowCSVImport(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                📊 Import from CSV
              </button>
            </div>
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
                      <button
                        onClick={() => handleDeleteGame(game)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
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
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* CSV Import Section */}
              {showCSVImport && (
                <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-400/30">
                  <h4 className="text-white font-bold mb-3">📊 Import Game Data from CSV</h4>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    <p className="text-gray-300 text-sm">
                      Upload a CSV file with game stats. Expected format matches your existing CSV files:<br/>
                      <code className="text-xs bg-black/30 px-2 py-1 rounded">Players,Points:,Rebounds:,Assists:,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,STL,BLK,MINS</code>
                    </p>

                    {csvErrors.length > 0 && (
                      <div className="bg-red-600/20 p-3 rounded-lg border border-red-400/30">
                        <h5 className="text-red-400 font-semibold mb-2">CSV Import Errors:</h5>
                        <ul className="text-red-300 text-sm space-y-1">
                          {csvErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {csvData && csvErrors.length === 0 && (
                      <div className="bg-green-600/20 p-3 rounded-lg border border-green-400/30">
                        <p className="text-green-400 font-semibold">✅ CSV imported successfully!</p>
                        <p className="text-green-300 text-sm">
                          Game {csvData.gameNumber}: {csvData.team1Score} - {csvData.team2Score}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Game Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Game Number</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Game #"
                    value={formData.gameNumber || editingGame?.gameNumber || games.length + 1}
                    onChange={(e) => setFormData({...formData, gameNumber: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.date || editingGame?.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    value={formData.status || "Final"}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Final">Final</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Team Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-600/20 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-3">Golden Dragons (Team 1)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Final Score</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Score"
                        value={formData.team1Score || editingGame?.team1Score || ''}
                        onChange={(e) => setFormData({...formData, team1Score: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-red-600/20 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-3">Los Sigmas (Team 2)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Final Score</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Score"
                        value={formData.team2Score || editingGame?.team2Score || ''}
                        onChange={(e) => setFormData({...formData, team2Score: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Stats Preview */}
              {(formData.team1Players || formData.team2Players) && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-orange-400 font-semibold mb-3">📊 Imported Player Stats</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Golden Dragons Stats */}
                    {formData.team1Players && formData.team1Players.length > 0 && (
                      <div>
                        <h5 className="text-white font-semibold mb-3">Golden Dragons</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {formData.team1Players.map((player, index) => (
                            <div key={index} className="bg-yellow-600/10 p-2 rounded text-sm">
                              <div className="text-white font-semibold">{player.name}</div>
                              <div className="text-gray-300 text-xs">
                                {player.points} PTS, {player.rebounds} REB, {player.assists} AST,
                                {player.fgm}/{player.fga} FG ({(player.fgPercentage * 100).toFixed(1)}%),
                                {player.threePM}/{player.threePA} 3P, {player.ftm}/{player.fta} FT,
                                {player.steals} STL, {player.blocks} BLK, {player.minutes} MIN
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Los Sigmas Stats */}
                    {formData.team2Players && formData.team2Players.length > 0 && (
                      <div>
                        <h5 className="text-white font-semibold mb-3">Los Sigmas</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {formData.team2Players.map((player, index) => (
                            <div key={index} className="bg-red-600/10 p-2 rounded text-sm">
                              <div className="text-white font-semibold">{player.name}</div>
                              <div className="text-gray-300 text-xs">
                                {player.points} PTS, {player.rebounds} REB, {player.assists} AST,
                                {player.fgm}/{player.fga} FG ({(player.fgPercentage * 100).toFixed(1)}%),
                                {player.threePM}/{player.threePA} 3P, {player.ftm}/{player.fta} FT,
                                {player.steals} STL, {player.blocks} BLK, {player.minutes} MIN
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quarter Scores */}
              {formData.quarters && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-orange-400 font-semibold mb-3">Quarter by Quarter</h4>
                  <div className="grid grid-cols-5 gap-4 text-center text-sm">
                    <div className="font-semibold text-gray-300">Team</div>
                    <div className="font-semibold text-gray-300">Q1</div>
                    <div className="font-semibold text-gray-300">Q2</div>
                    <div className="font-semibold text-gray-300">Q3</div>
                    <div className="font-semibold text-gray-300">Q4</div>

                    <div className="text-white font-semibold">GD</div>
                    <div className="text-white">{formData.quarters.q1.team1}</div>
                    <div className="text-white">{formData.quarters.q2.team1}</div>
                    <div className="text-white">{formData.quarters.q3.team1}</div>
                    <div className="text-white">{formData.quarters.q4.team1}</div>

                    <div className="text-white font-semibold">LS</div>
                    <div className="text-white">{formData.quarters.q1.team2}</div>
                    <div className="text-white">{formData.quarters.q2.team2}</div>
                    <div className="text-white">{formData.quarters.q3.team2}</div>
                    <div className="text-white">{formData.quarters.q4.team2}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={!formData.gameNumber || !formData.team1Score || !formData.team2Score}
                >
                  {editingGame ? 'Update Game' : 'Add Game'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && gameToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Delete Game</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete Game {gameToDelete.gameNumber}?
                <br />
                <span className="text-sm text-gray-400">
                  ({gameToDelete.team1Score} - {gameToDelete.team2Score} on {new Date(gameToDelete.date).toLocaleDateString()})
                </span>
                <br />
                <span className="text-red-400 text-sm font-semibold">This action cannot be undone.</span>
              </p>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={cancelDeleteGame}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGame}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Game
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
