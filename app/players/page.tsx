/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPlayers, getAllGames, calculatePlayerEfficiency, calculatePlayerScore, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [computedPlayers, setComputedPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState(CURRENT_SEASON);
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");

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
      setComputedPlayers([]);
      return;
    }

    const seasonGames = games.filter(g => g.season === seasonFilter);
    
    // Build a map of player stats from games
    const playerStatsMap = new Map<string, any>();
    
    for (const game of seasonGames) {
      const allPerformances = [...(game.team1Players || []), ...(game.team2Players || [])];
      
      for (const perf of allPerformances) {
        const key = perf.playerId || perf.playerName.toLowerCase();
        const existing = playerStatsMap.get(key) || {
          gamesPlayed: 0,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          minutes: 0,
          fgm: 0,
          fga: 0,
          threePM: 0,
          threePA: 0,
          ftm: 0,
          fta: 0,
          efficiencySum: 0,
          playerScoreSum: 0
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
        
        playerStatsMap.set(key, existing);
      }
    }
    
    const getPlayerBadges = (stats: any) => {
      const badges: string[] = [];
      if (stats.points >= 18 && stats.fgPercentage >= 0.48) badges.push('Scoring Star');
      if (stats.threePPercentage >= 0.35 && stats.threePM >= 1.5) badges.push('Sniper');
      if (stats.steals >= 1.5 || stats.blocks >= 1.2) badges.push('Lockdown');
      if (stats.assists >= 5) badges.push('Playmaker');
      if (stats.playerScore >= 18) badges.push('High Impact');
      if (stats.efficiency >= 20) badges.push('Efficient');
      return badges.slice(0, 3);
    };

    // Merge with player base info and compute averages
    const computed = players.map(player => {
      const key = player.id || player.name.toLowerCase();
      const stats = playerStatsMap.get(key) || playerStatsMap.get(player.name.toLowerCase());
      
      if (!stats || stats.gamesPlayed === 0) {
        return {
          ...player,
          gamesPlayed: 0,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          minutes: 0,
          fgPercentage: 0,
          threePPercentage: 0,
          ftPercentage: 0,
          efficiency: 0,
          playerScore: 0,
          badges: []
        };
      }
      
      const gp = stats.gamesPlayed;
      const computed = {
        ...player,
        gamesPlayed: gp,
        points: stats.points / gp,
        rebounds: stats.rebounds / gp,
        assists: stats.assists / gp,
        steals: stats.steals / gp,
        blocks: stats.blocks / gp,
        turnovers: stats.turnovers / gp,
        minutes: stats.minutes / gp,
        fgPercentage: stats.fga > 0 ? stats.fgm / stats.fga : 0,
        threePPercentage: stats.threePA > 0 ? stats.threePM / stats.threePA : 0,
        ftPercentage: stats.fta > 0 ? stats.ftm / stats.fta : 0,
        efficiency: stats.efficiencySum / gp,
        playerScore: stats.playerScoreSum / gp
      };
      return {
        ...computed,
        badges: getPlayerBadges(computed)
      };
    });
    
    setComputedPlayers(computed);
  }, [players, games, seasonFilter]);

  useEffect(() => {
    let filtered = computedPlayers.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = teamFilter === "All" || player.team === teamFilter;
      const matchesPosition = positionFilter === "All" || player.position === positionFilter;
      return matchesSearch && matchesTeam && matchesPosition;
    });

    // Sort players
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;
      
      if (sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPlayers(filtered);
  }, [computedPlayers, searchTerm, teamFilter, positionFilter, sortBy, sortOrder]);

  const teams = ["All", "Golden Dragons", "Los Sigmas", "Free Agent"];
  const positions = ["All", "G", "F", "C"];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">DBA Players</h1>

        {/* Season Selector */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-white font-semibold">Season Stats</h3>
                <p className="text-gray-300 text-sm">Viewing averages for {seasonFilter}</p>
              </div>
            </div>
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              {ALL_SEASONS.map(season => (
                <option key={season} value={season} className="bg-slate-800">{season}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Search Players</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Team Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Team</label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                {teams.map(team => (
                  <option key={team} value={team} className="bg-slate-800">{team}</option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Position</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                {positions.map(position => (
                  <option key={position} value={position} className="bg-slate-800">{position}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="points" className="bg-slate-800">Points</option>
                <option value="rebounds" className="bg-slate-800">Rebounds</option>
                <option value="assists" className="bg-slate-800">Assists</option>
                <option value="efficiency" className="bg-slate-800">Efficiency</option>
                <option value="playerScore" className="bg-slate-800">Player Score</option>
                <option value="name" className="bg-slate-800">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{player.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(player.badges || []).slice(0, 3).map((badge: string) => (
                        <span key={badge} className="text-[10px] uppercase tracking-[0.2em] bg-white/10 text-gray-200 px-2 py-1 rounded-full">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    player.team === 'Golden Dragons' ? 'bg-yellow-600 text-white' :
                    player.team === 'Los Sigmas' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {player.position || 'N/A'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Team:</span>
                    <span className="text-white font-medium">{player.team}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Games:</span>
                    <span className="text-white font-medium">{player.gamesPlayed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">PPG:</span>
                    <span className="text-white font-medium">{(player.points || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">RPG:</span>
                    <span className="text-white font-medium">{(player.rebounds || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">APG:</span>
                    <span className="text-white font-medium">{(player.assists || 0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-orange-400 text-sm font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No players found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
