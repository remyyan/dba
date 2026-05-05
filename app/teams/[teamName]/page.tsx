"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAllTeams, getAllPlayers, getAllGames, calculatePlayerEfficiency, calculatePlayerScore, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function TeamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamName = decodeURIComponent(params.teamName as string);
  
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get('season') || CURRENT_SEASON);
  const [loading, setLoading] = useState(true);

  // Computed season stats
  const [seasonRecord, setSeasonRecord] = useState({ wins: 0, losses: 0, winPercentage: 0, gamesPlayed: 0, avgPointsScored: 0, avgPointsAllowed: 0 });
  const [playerSeasonStats, setPlayerSeasonStats] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, playersData, gamesData] = await Promise.all([
          getAllTeams(),
          getAllPlayers(),
          getAllGames()
        ]);

        const foundTeam = teamsData.find(t => t.name === teamName);
        setTeam(foundTeam);
        
        const teamPlayers = playersData.filter(p => p.team === teamName);
        setPlayers(teamPlayers);
        setAllGames(gamesData);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamName]);

  // Compute season-specific stats
  useEffect(() => {
    if (!team || allGames.length === 0) return;

    const seasonGames = allGames.filter(g => g.season === selectedSeason);
    const teamGames = seasonGames.filter(g => g.team1 === teamName || g.team2 === teamName);

    let wins = 0, losses = 0, pointsFor = 0, pointsAgainst = 0;

    for (const game of teamGames) {
      if (game.team1 === teamName) {
        pointsFor += game.team1Score;
        pointsAgainst += game.team2Score;
        if (game.team1Score > game.team2Score) wins++;
        else if (game.team2Score > game.team1Score) losses++;
      } else {
        pointsFor += game.team2Score;
        pointsAgainst += game.team1Score;
        if (game.team2Score > game.team1Score) wins++;
        else if (game.team1Score > game.team2Score) losses++;
      }
    }

    const gamesPlayed = wins + losses;
    setSeasonRecord({
      wins,
      losses,
      winPercentage: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
      gamesPlayed,
      avgPointsScored: gamesPlayed > 0 ? Math.round((pointsFor / gamesPlayed) * 10) / 10 : 0,
      avgPointsAllowed: gamesPlayed > 0 ? Math.round((pointsAgainst / gamesPlayed) * 10) / 10 : 0
    });

    // Compute player stats for this season
    const playerStatsMap = new Map<string, any>();

    for (const game of teamGames) {
      const teamPlayers = game.team1 === teamName ? game.team1Players : game.team2Players;
      
      for (const perf of (teamPlayers || [])) {
        const key = perf.playerId || perf.playerName.toLowerCase();
        const existing = playerStatsMap.get(key) || {
          name: perf.playerName,
          gamesPlayed: 0,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fgm: 0,
          fga: 0,
          threePM: 0,
          threePA: 0
        };

        existing.gamesPlayed += 1;
        existing.points += perf.points || 0;
        existing.rebounds += perf.rebounds || 0;
        existing.assists += perf.assists || 0;
        existing.steals += perf.steals || 0;
        existing.blocks += perf.blocks || 0;
        existing.turnovers += perf.turnovers || 0;
        existing.fgm += perf.fgm || 0;
        existing.fga += perf.fga || 0;
        existing.threePM += perf.threePM || 0;
        existing.threePA += perf.threePA || 0;

        playerStatsMap.set(key, existing);
      }
    }

    // Convert to averages
    const computedStats = Array.from(playerStatsMap.values()).map(p => ({
      ...p,
      points: p.gamesPlayed > 0 ? p.points / p.gamesPlayed : 0,
      rebounds: p.gamesPlayed > 0 ? p.rebounds / p.gamesPlayed : 0,
      assists: p.gamesPlayed > 0 ? p.assists / p.gamesPlayed : 0,
      steals: p.gamesPlayed > 0 ? p.steals / p.gamesPlayed : 0,
      blocks: p.gamesPlayed > 0 ? p.blocks / p.gamesPlayed : 0,
      turnovers: p.gamesPlayed > 0 ? p.turnovers / p.gamesPlayed : 0,
      fgPercentage: p.fga > 0 ? p.fgm / p.fga : 0,
      threePPercentage: p.threePA > 0 ? p.threePM / p.threePA : 0
    })).sort((a, b) => b.points - a.points);

    setPlayerSeasonStats(computedStats);
  }, [team, allGames, selectedSeason, teamName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading team...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
            <Link href="/teams" className="text-orange-400 hover:text-orange-300">
              ← Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="text-center mb-8">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 ${
            team.name === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {team.name === 'Golden Dragons' ? '🐉' : '🔥'}
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">{team.name}</h1>
          <p className="text-2xl text-gray-300">{seasonRecord.wins}-{seasonRecord.losses} ({seasonRecord.winPercentage}%)</p>
        </div>

        {/* Season Selector */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-white font-semibold">Season Stats</h3>
                <p className="text-gray-300 text-sm">Viewing stats for {selectedSeason}</p>
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

        {/* Team Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Games Played</h3>
            <p className="text-3xl font-bold text-white">{seasonRecord.gamesPlayed}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Avg Points Scored</h3>
            <p className="text-3xl font-bold text-white">{seasonRecord.avgPointsScored}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Avg Points Allowed</h3>
            <p className="text-3xl font-bold text-white">{seasonRecord.avgPointsAllowed}</p>
          </div>
        </div>

        {/* Active Players */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Player Stats ({selectedSeason})</h2>
          {playerSeasonStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-orange-400 font-semibold py-3">Player</th>
                  <th className="text-center text-orange-400 font-semibold py-3">GP</th>
                  <th className="text-center text-orange-400 font-semibold py-3">PPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">RPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">APG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">SPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">BPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">TOV</th>
                  <th className="text-center text-orange-400 font-semibold py-3">FG%</th>
                  <th className="text-center text-orange-400 font-semibold py-3">3P%</th>
                </tr>
              </thead>
              <tbody>
                {playerSeasonStats.map((player) => (
                  <tr key={player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-4">{player.name}</td>
                    <td className="text-center text-gray-300 py-4">{player.gamesPlayed}</td>
                    <td className="text-center text-gray-300 py-4">{player.points.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.rebounds.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.assists.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.steals.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.blocks.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.turnovers.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{(player.fgPercentage * 100).toFixed(1)}%</td>
                    <td className="text-center text-gray-300 py-4">{(player.threePPercentage * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No player stats available for {selectedSeason}.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link
            href="/teams"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors mr-4"
          >
            ← Back to Teams
          </Link>
          <Link
            href="/games"
            className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Games
          </Link>
        </div>
      </div>
    </div>
  );
}
