/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlayer, getAllGames, getPlayerSeasonStats, calculatePlayerScore, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.playerId as string;
  const [player, setPlayer] = useState<any>(null);
  const [seasonStats, setSeasonStats] = useState<any>(null);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'games'>('stats');
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const [playerData, allGames] = await Promise.all([
          getPlayer(playerId),
          getAllGames()
        ]);
        setPlayer(playerData);
        
        // Compute game history from all games
        if (playerData) {
          const playerGames: any[] = [];
          
          for (const game of allGames) {
            // Check team1Players
            const team1Perf = game.team1Players?.find(p => 
              p.playerId === playerId || p.playerName?.toLowerCase() === playerData.name?.toLowerCase()
            );
            if (team1Perf) {
              playerGames.push({
                gameNumber: game.gameNumber,
                date: game.date,
                season: game.season,
                ...team1Perf,
                playerScore: calculatePlayerScore(team1Perf)
              });
            }
            
            // Check team2Players
            const team2Perf = game.team2Players?.find(p => 
              p.playerId === playerId || p.playerName?.toLowerCase() === playerData.name?.toLowerCase()
            );
            if (team2Perf) {
              playerGames.push({
                gameNumber: game.gameNumber,
                date: game.date,
                season: game.season,
                ...team2Perf,
                playerScore: calculatePlayerScore(team2Perf)
              });
            }
          }
          
          // Sort by game number
          playerGames.sort((a, b) => a.gameNumber - b.gameNumber);
          setGameHistory(playerGames);
        }
      } catch (error) {
        console.error('Error loading player:', error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      loadPlayerData();
    }
  }, [playerId]);

  // Load season-specific stats when season changes
  useEffect(() => {
    const loadSeasonStats = async () => {
      if (!playerId) return;
      
      try {
        const stats = await getPlayerSeasonStats(playerId, selectedSeason);
        setSeasonStats(stats);
      } catch (error) {
        console.error('Error loading season stats:', error);
        setSeasonStats(null);
      }
    };

    loadSeasonStats();
  }, [playerId, selectedSeason]);

  // Use season stats if available, otherwise fall back to player stored stats
  const displayStats = seasonStats || player || {};

  // Filter game history by selected season
  // Games without a season field are treated as "2024-2025" (old season)
  const filteredGameHistory = gameHistory.filter(game => {
    const gameSeason = game.season || "2024-2025";
    return gameSeason === selectedSeason;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading player...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Player Not Found</h1>
          <Link href="/players" className="text-orange-400 hover:text-orange-300">
            ← Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const getPositionFullName = (pos: string) => {
    switch (pos) {
      case 'G': return 'Guard';
      case 'F': return 'Forward';
      case 'C': return 'Center';
      default: return pos || 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/players" className="text-orange-400 hover:text-orange-300 flex items-center">
            ← Back to Players
          </Link>
        </div>

        {/* Player Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl ${
                player.team === 'Golden Dragons' ? 'bg-yellow-600' :
                player.team === 'Los Sigmas' ? 'bg-red-600' :
                'bg-gray-600'
              }`}>
                {player.jerseyNumber || player.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{player.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-300">
                  <span className="flex items-center">
                    <span className="text-orange-400 mr-2">Team:</span>
                    {player.team}
                  </span>
                  <span className="flex items-center">
                    <span className="text-orange-400 mr-2">Position:</span>
                    {getPositionFullName(player.position)}
                  </span>
                  {player.height && (
                    <span className="flex items-center">
                      <span className="text-orange-400 mr-2">Height:</span>
                      {player.height}
                    </span>
                  )}
                  {player.weight && (
                    <span className="flex items-center">
                      <span className="text-orange-400 mr-2">Weight:</span>
                      {player.weight} lbs
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white">{(displayStats.points || 0).toFixed(1)}</div>
              <div className="text-orange-400 text-sm">PPG ({selectedSeason})</div>
            </div>
          </div>
        </div>

        {/* Season Selector */}
        <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-white font-semibold">Season Stats</h3>
                <p className="text-gray-300 text-sm">Viewing averages for {selectedSeason}</p>
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

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 justify-center">
          {[
            { key: 'stats', label: 'Season Stats', icon: '📊' },
            { key: 'games', label: 'Game Log', icon: '🏀' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Season Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Offensive Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Offensive Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Points per Game</span>
                  <span className="text-white font-bold">{(displayStats.points || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Field Goals Made</span>
                  <span className="text-white font-bold">{(displayStats.fgm || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Field Goal %</span>
                  <span className="text-white font-bold">{((displayStats.fgPercentage || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">3-Pointers Made</span>
                  <span className="text-white font-bold">{(displayStats.threePM || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">3-Point %</span>
                  <span className="text-white font-bold">{((displayStats.threePPercentage || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Free Throw %</span>
                  <span className="text-white font-bold">{((displayStats.ftPercentage || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Assists per Game</span>
                  <span className="text-white font-bold">{(displayStats.assists || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Turnovers per Game</span>
                  <span className="text-white font-bold">{(displayStats.turnovers || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Defensive & Other Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Defensive & Other Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Rebounds per Game</span>
                  <span className="text-white font-bold">{(displayStats.rebounds || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Steals per Game</span>
                  <span className="text-white font-bold">{(displayStats.steals || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Blocks per Game</span>
                  <span className="text-white font-bold">{(displayStats.blocks || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Minutes per Game</span>
                  <span className="text-white font-bold">{(displayStats.minutes || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Games Played</span>
                  <span className="text-white font-bold">{displayStats.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Efficiency Rating</span>
                  <span className="text-white font-bold">{(displayStats.efficiency || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Player Score</span>
                  <span className="text-white font-bold">{(displayStats.playerScore || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Log Tab */}
        {activeTab === 'games' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Game Log ({selectedSeason})</h3>
            {filteredGameHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-orange-400 font-semibold py-3">Game</th>
                      <th className="text-center text-orange-400 font-semibold py-3">Date</th>
                      <th className="text-center text-orange-400 font-semibold py-3">PTS</th>
                      <th className="text-center text-orange-400 font-semibold py-3">REB</th>
                      <th className="text-center text-orange-400 font-semibold py-3">AST</th>
                      <th className="text-center text-orange-400 font-semibold py-3">STL</th>
                      <th className="text-center text-orange-400 font-semibold py-3">BLK</th>
                      <th className="text-center text-orange-400 font-semibold py-3">TOV</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FGM</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FGA</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FG%</th>
                      <th className="text-center text-orange-400 font-semibold py-3">3PM</th>
                      <th className="text-center text-orange-400 font-semibold py-3">3PA</th>
                      <th className="text-center text-orange-400 font-semibold py-3">3P%</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FTM</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FTA</th>
                      <th className="text-center text-orange-400 font-semibold py-3">FT%</th>
                      <th className="text-center text-orange-400 font-semibold py-3">MIN</th>
                      <th className="text-center text-orange-400 font-semibold py-3">EFF</th>
                      <th className="text-center text-orange-400 font-semibold py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGameHistory.map((game, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="text-white py-3">
                          <Link href={`/games/${game.gameNumber}`} className="hover:text-orange-400 transition-colors">
                            Game {game.gameNumber}
                          </Link>
                        </td>
                        <td className="text-center text-gray-300 py-3">{game.date}</td>
                        <td className="text-center text-gray-300 py-3">{game.points}</td>
                        <td className="text-center text-gray-300 py-3">{game.rebounds}</td>
                        <td className="text-center text-gray-300 py-3">{game.assists}</td>
                        <td className="text-center text-gray-300 py-3">{game.steals}</td>
                        <td className="text-center text-gray-300 py-3">{game.blocks}</td>
                        <td className="text-center text-gray-300 py-3">{game.turnovers || 0}</td>
                        <td className="text-center text-gray-300 py-3">{game.fgm}</td>
                        <td className="text-center text-gray-300 py-3">{game.fga}</td>
                        <td className="text-center text-gray-300 py-3">{(game.fgPercentage * 100).toFixed(1)}%</td>
                        <td className="text-center text-gray-300 py-3">{game.threePM}</td>
                        <td className="text-center text-gray-300 py-3">{game.threePA}</td>
                        <td className="text-center text-gray-300 py-3">{(game.threePPercentage * 100).toFixed(1)}%</td>
                        <td className="text-center text-gray-300 py-3">{game.ftm}</td>
                        <td className="text-center text-gray-300 py-3">{game.fta}</td>
                        <td className="text-center text-gray-300 py-3">{(game.ftPercentage * 100).toFixed(1)}%</td>
                        <td className="text-center text-gray-300 py-3">{game.minutes}</td>
                        <td className="text-center text-gray-300 py-3">{game.efficiency.toFixed(1)}</td>
                        <td className="text-center text-gray-300 py-3">{game.playerScore?.toFixed(1) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No games found for {selectedSeason}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
