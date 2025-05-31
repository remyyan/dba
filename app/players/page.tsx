/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPlayers } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playersData = await getAllPlayers();
        setPlayers(playersData);
        setFilteredPlayers(playersData);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  useEffect(() => {
    let filtered = players.filter(player => {
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
  }, [players, searchTerm, teamFilter, positionFilter, sortBy, sortOrder]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">DBA Players</h1>

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{player.name}</h3>
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
