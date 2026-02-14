/* eslint-disable */
// @ts-nocheck
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllTeams, getAllGames, getAllPlayers, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";
import ActivityFeed from "@/components/ActivityFeed";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [teamPlayerCounts, setTeamPlayerCounts] = useState<{[key: string]: number}>({});
  const [teamRecords, setTeamRecords] = useState<{[key: string]: {wins: number, losses: number, winPercentage: number}}>({});
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, gamesData, playersData] = await Promise.all([
          getAllTeams(),
          getAllGames(),
          getAllPlayers()
        ]);

        // Remove duplicates if they exist - keep the first occurrence of each team name
        const uniqueTeams = teamsData.filter((team, index, self) =>
          index === self.findIndex(t => t.name === team.name)
        );

        console.log('Teams loaded:', {
          total: teamsData.length,
          unique: uniqueTeams.length,
          teamNames: uniqueTeams.map(t => t.name)
        });

        // Calculate player counts for each team
        const playerCounts: {[key: string]: number} = {};
        for (const team of uniqueTeams) {
          playerCounts[team.name] = playersData.filter((p: any) => p.team === team.name).length;
        }

        setTeams(uniqueTeams);
        setTeamPlayerCounts(playerCounts);
        setAllGames(gamesData);
        setAllPlayers(playersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter games and compute team records by selected season
  useEffect(() => {
    const seasonGames = allGames.filter(g => g.season === selectedSeason);
    setRecentGames(seasonGames.slice(-3).reverse()); // Last 3 games of selected season

    // Compute team records from season games
    const records: {[key: string]: {wins: number, losses: number, winPercentage: number}} = {};

    for (const team of teams) {
      records[team.name] = { wins: 0, losses: 0, winPercentage: 0 };
    }

    for (const game of seasonGames) {
      if (records[game.team1] && records[game.team2]) {
        if (game.team1Score > game.team2Score) {
          records[game.team1].wins++;
          records[game.team2].losses++;
        } else if (game.team2Score > game.team1Score) {
          records[game.team2].wins++;
          records[game.team1].losses++;
        }
      }
    }

    // Calculate win percentages
    for (const teamName of Object.keys(records)) {
      const total = records[teamName].wins + records[teamName].losses;
      records[teamName].winPercentage = total > 0 ? Math.round((records[teamName].wins / total) * 100) : 0;
    }

    setTeamRecords(records);
  }, [allGames, teams, selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading DBA data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            <span className="text-orange-400">DBA</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Denlow Basketball Association
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Home of the Golden Dragons and Los Sigmas - Where basketball legends are born.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teams"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Teams
            </Link>
            <Link
              href="/games"
              className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Game History
            </Link>
          </div>
        </div>
      </section>

      {/* Teams Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h3 className="text-3xl font-bold text-white">Team Standings</h3>
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">Season:</span>
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
          <div className="grid md:grid-cols-2 gap-8">
            {teams.map((team, index) => {
              const record = teamRecords[team.name] || { wins: 0, losses: 0, winPercentage: 0 };
              return (
              <Link key={team.id || `${team.name}-${index}`} href={`/teams/${encodeURIComponent(team.name)}?season=${selectedSeason}`}>
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                  team.name === 'Golden Dragons' ? 'hover:border-yellow-400' : 'hover:border-red-400'
                }`}>
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${
                      team.name === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {team.name === 'Golden Dragons' ? '🐉' : '🔥'}
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">{team.name}</h4>
                    <p className="text-gray-300 text-lg mb-4">{record.wins}-{record.losses} ({record.winPercentage}%)</p>
                    <p className="text-gray-400">
                      {teamPlayerCounts[team.name] || 0} Players
                    </p>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h3 className="text-3xl font-bold text-white">Recent Games</h3>
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm">Season:</span>
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
          {recentGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No games found for {selectedSeason}.</p>
            </div>
          ) : (
          <div className="space-y-4">
            {recentGames.map((game) => (
              <Link key={game.gameNumber} href={`/games/${game.gameNumber}`}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Game {game.gameNumber}</p>
                        <p className="text-sm text-gray-400">{game.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-semibold">{game.team1}</p>
                          <p className="text-2xl font-bold text-white">{game.team1Score}</p>
                        </div>
                        <div className="text-gray-400 text-xl">vs</div>
                        <div className="text-left">
                          <p className="text-white font-semibold">{game.team2}</p>
                          <p className="text-2xl font-bold text-white">{game.team2Score}</p>
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
                </div>
              </Link>
            ))}
          </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/games"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Games
            </Link>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Recent Activity</h3>
          <ActivityFeed />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
