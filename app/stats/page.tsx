/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPlayers, getAllGames, calculatePlayerEfficiency, calculatePlayerScore, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function StatsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [computedStats, setComputedStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersData, gamesData] = await Promise.all([
          getAllPlayers(),
          getAllGames()
        ]);
        setPlayers(playersData);
        setGames(gamesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute player stats for the selected season
  useEffect(() => {
    if (players.length === 0) {
      setComputedStats([]);
      return;
    }

    const seasonGames = games.filter(g => g.season === selectedSeason);
    const playerStatsMap = new Map<string, any>();
    
    for (const game of seasonGames) {
      // Process team1 players
      for (const perf of (game.team1Players || [])) {
        const key = perf.playerId || perf.playerName.toLowerCase();
        const existing = playerStatsMap.get(key) || {
          name: perf.playerName,
          team: game.team1,
          gamesPlayed: 0,
          points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, minutes: 0,
          fgm: 0, fga: 0, threePM: 0, threePA: 0, ftm: 0, fta: 0,
          efficiencySum: 0, playerScoreSum: 0
        };
        
        existing.gamesPlayed += 1;
        existing.points += perf.points || 0;
        existing.rebounds += perf.rebounds || 0;
        existing.assists += perf.assists || 0;
        existing.steals += perf.steals || 0;
        existing.blocks += perf.blocks || 0;
        existing.turnovers += perf.turnovers || 0;
        existing.minutes += perf.minutes || 0;
        existing.fgm += perf.fgm || 0;
        existing.fga += perf.fga || 0;
        existing.threePM += perf.threePM || 0;
        existing.threePA += perf.threePA || 0;
        existing.ftm += perf.ftm || 0;
        existing.fta += perf.fta || 0;
        existing.efficiencySum += Number.isFinite(perf.efficiency) ? perf.efficiency : calculatePlayerEfficiency(perf);
        existing.playerScoreSum += calculatePlayerScore(perf);
        existing.team = game.team1;
        
        playerStatsMap.set(key, existing);
      }
      
      // Process team2 players
      for (const perf of (game.team2Players || [])) {
        const key = perf.playerId || perf.playerName.toLowerCase();
        const existing = playerStatsMap.get(key) || {
          name: perf.playerName,
          team: game.team2,
          gamesPlayed: 0,
          points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, minutes: 0,
          fgm: 0, fga: 0, threePM: 0, threePA: 0, ftm: 0, fta: 0,
          efficiencySum: 0, playerScoreSum: 0
        };
        
        existing.gamesPlayed += 1;
        existing.points += perf.points || 0;
        existing.rebounds += perf.rebounds || 0;
        existing.assists += perf.assists || 0;
        existing.steals += perf.steals || 0;
        existing.blocks += perf.blocks || 0;
        existing.turnovers += perf.turnovers || 0;
        existing.minutes += perf.minutes || 0;
        existing.fgm += perf.fgm || 0;
        existing.fga += perf.fga || 0;
        existing.threePM += perf.threePM || 0;
        existing.threePA += perf.threePA || 0;
        existing.ftm += perf.ftm || 0;
        existing.fta += perf.fta || 0;
        existing.efficiencySum += Number.isFinite(perf.efficiency) ? perf.efficiency : calculatePlayerEfficiency(perf);
        existing.playerScoreSum += calculatePlayerScore(perf);
        existing.team = game.team2;
        
        playerStatsMap.set(key, existing);
      }
    }

    // Convert to averages and find player IDs
    const computed = Array.from(playerStatsMap.entries()).map(([key, stats]) => {
      const player = players.find(p => p.id === key || p.name.toLowerCase() === stats.name.toLowerCase());
      const gp = stats.gamesPlayed;
      
      return {
        id: player?.id || key,
        name: stats.name,
        team: stats.team,
        gamesPlayed: gp,
        points: gp > 0 ? stats.points / gp : 0,
        rebounds: gp > 0 ? stats.rebounds / gp : 0,
        assists: gp > 0 ? stats.assists / gp : 0,
        steals: gp > 0 ? stats.steals / gp : 0,
        blocks: gp > 0 ? stats.blocks / gp : 0,
        turnovers: gp > 0 ? stats.turnovers / gp : 0,
        minutes: gp > 0 ? stats.minutes / gp : 0,
        fgPercentage: stats.fga > 0 ? stats.fgm / stats.fga : 0,
        threePPercentage: stats.threePA > 0 ? stats.threePM / stats.threePA : 0,
        ftPercentage: stats.fta > 0 ? stats.ftm / stats.fta : 0,
        efficiency: gp > 0 ? stats.efficiencySum / gp : 0,
        playerScore: gp > 0 ? stats.playerScoreSum / gp : 0
      };
    }).filter(p => p.gamesPlayed > 0);
    
    setComputedStats(computed);
  }, [players, games, selectedSeason]);

  // Sort the stats
  const sortedStats = [...computedStats].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === "name" || sortBy === "team") {
      aVal = (aVal || "").toLowerCase();
      bVal = (bVal || "").toLowerCase();
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <th 
      className="text-center text-orange-400 font-semibold py-3 cursor-pointer hover:text-orange-300 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortBy === field && (
        <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>
      )}
    </th>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white text-xl">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-[95vw] mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Player Statistics</h1>

        {/* Season Selector */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-white font-semibold">Season Averages</h3>
                <p className="text-gray-300 text-sm">Click any column header to sort</p>
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

        {/* Stats Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          {sortedStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th 
                      className="text-left text-orange-400 font-semibold py-3 cursor-pointer hover:text-orange-300 transition-colors select-none"
                      onClick={() => handleSort("name")}
                    >
                      Player {sortBy === "name" && <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>}
                    </th>
                    <th 
                      className="text-left text-orange-400 font-semibold py-3 cursor-pointer hover:text-orange-300 transition-colors select-none"
                      onClick={() => handleSort("team")}
                    >
                      Team {sortBy === "team" && <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>}
                    </th>
                    <SortHeader field="gamesPlayed" label="GP" />
                    <SortHeader field="points" label="PPG" />
                    <SortHeader field="rebounds" label="RPG" />
                    <SortHeader field="assists" label="APG" />
                    <SortHeader field="steals" label="SPG" />
                    <SortHeader field="blocks" label="BPG" />
                    <SortHeader field="turnovers" label="TOV" />
                    <SortHeader field="fgPercentage" label="FG%" />
                    <SortHeader field="threePPercentage" label="3P%" />
                    <SortHeader field="ftPercentage" label="FT%" />
                    <SortHeader field="minutes" label="MPG" />
                    <SortHeader field="efficiency" label="EFF" />
                    <SortHeader field="playerScore" label="Score" />
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((player, index) => (
                    <tr key={player.id || index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="text-white font-semibold py-3">
                        <Link href={`/players/${player.id}`} className="hover:text-orange-400 transition-colors">
                          {player.name}
                        </Link>
                      </td>
                      <td className="text-gray-300 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          player.team === 'Golden Dragons' ? 'bg-yellow-600/30 text-yellow-300' :
                          player.team === 'Los Sigmas' ? 'bg-red-600/30 text-red-300' :
                          'bg-gray-600/30 text-gray-300'
                        }`}>
                          {player.team}
                        </span>
                      </td>
                      <td className="text-center text-gray-300 py-3">{player.gamesPlayed}</td>
                      <td className="text-center text-gray-300 py-3">{player.points.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.rebounds.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.assists.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.steals.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.blocks.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.turnovers.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{(player.fgPercentage * 100).toFixed(1)}%</td>
                      <td className="text-center text-gray-300 py-3">{(player.threePPercentage * 100).toFixed(1)}%</td>
                      <td className="text-center text-gray-300 py-3">{(player.ftPercentage * 100).toFixed(1)}%</td>
                      <td className="text-center text-gray-300 py-3">{player.minutes.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.efficiency.toFixed(1)}</td>
                      <td className="text-center text-gray-300 py-3">{player.playerScore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No player stats found for {selectedSeason}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
