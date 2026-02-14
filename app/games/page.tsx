"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllGames, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function GamesPage() {
  const [allGames, setAllGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesData = await getAllGames();
        setAllGames(gamesData);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // Filter games by selected season
  useEffect(() => {
    const seasonGames = allGames.filter(g => g.season === selectedSeason);
    setFilteredGames(seasonGames.reverse()); // Most recent first
  }, [allGames, selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading games...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Game History</h1>

        {/* Season Selector */}
        <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-white font-semibold">Season</h3>
                <p className="text-gray-300 text-sm">Viewing games from {selectedSeason}</p>
              </div>
            </div>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              {ALL_SEASONS.map(season => (
                <option key={season} value={season} className="bg-slate-800">{season}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found for {selectedSeason}.</p>
            <p className="text-gray-500 text-sm mt-2">Try selecting a different season or import games in the Admin Panel.</p>
          </div>
        ) : (
        <div className="space-y-6">
          {filteredGames.map((game) => (
            <Link key={game.gameNumber} href={`/games/${game.gameNumber}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Game {game.gameNumber}</p>
                      <p className="text-sm text-gray-400">{game.date}</p>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Team 1 */}
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            game.team1 === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {game.team1 === 'Golden Dragons' ? '🐉' : '🔥'}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{game.team1}</p>
                            <p className="text-2xl font-bold text-white">{game.team1Score}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-gray-400 text-xl font-bold">VS</div>

                      {/* Team 2 */}
                      <div className="text-left">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-white font-semibold">{game.team2}</p>
                            <p className="text-2xl font-bold text-white">{game.team2Score}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            game.team2 === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {game.team2 === 'Golden Dragons' ? '🐉' : '🔥'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      game.team1Score > game.team2Score ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {game.team1Score > game.team2Score ? `${game.team1} Win` : `${game.team2} Win`}
                    </p>
                    <p className="text-gray-400 text-sm">View Box Score →</p>
                  </div>
                </div>

                {/* Quarter Scores (if available) */}
                {game.quarters && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-gray-400 text-sm">Q1</p>
                        <p className="text-white">{game.quarters.q1.team1} - {game.quarters.q1.team2}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q2</p>
                        <p className="text-white">{game.quarters.q2.team1} - {game.quarters.q2.team2}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q3</p>
                        <p className="text-white">
                          {game.quarters.q3.team1 === 0 && game.quarters.q3.team2 === 0 ? '?' : `${game.quarters.q3.team1} - ${game.quarters.q3.team2}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q4</p>
                        <p className="text-white">{game.quarters.q4.team1} - {game.quarters.q4.team2}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
