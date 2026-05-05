"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllTeams, getAllPlayers, getAllGames, createTeam, CURRENT_SEASON, ALL_SEASONS } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<{[key: string]: any[]}>({});
  const [teamRecords, setTeamRecords] = useState<{[key: string]: {wins: number, losses: number, winPercentage: number}}>({});
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        let [teamsData, gamesData] = await Promise.all([
          getAllTeams(),
          getAllGames()
        ]);
        console.log('Loaded teams from Firebase:', teamsData);

        // If no teams exist, create default teams
        if (teamsData.length === 0) {
          console.log('No teams found, creating default teams...');
          await createTeam({
            name: 'Golden Dragons',
            wins: 0,
            losses: 0,
            winPercentage: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            playerIds: []
          });
          await createTeam({
            name: 'Los Sigmas',
            wins: 0,
            losses: 0,
            winPercentage: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            playerIds: []
          });
          teamsData = await getAllTeams();
        }

        // Remove duplicates if they exist
        const uniqueTeams = teamsData.filter((team, index, self) =>
          index === self.findIndex(t => t.name === team.name)
        );

        setTeams(uniqueTeams);
        setAllGames(gamesData);

        // Load all players and filter by team
        const allPlayers = await getAllPlayers();
        console.log('All players:', allPlayers);

        const playersData: {[key: string]: any[]} = {};

        // Create team player arrays
        playersData['Golden Dragons'] = allPlayers.filter(p => p.team === 'Golden Dragons');
        playersData['Los Sigmas'] = allPlayers.filter(p => p.team === 'Los Sigmas');

        console.log('Players by team:', playersData);
        setTeamPlayers(playersData);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute team records for selected season
  useEffect(() => {
    const seasonGames = allGames.filter(g => g.season === selectedSeason);
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
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">DBA Teams</h1>

        {/* Season Selector */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-white font-semibold">Season Records</h3>
                <p className="text-gray-300 text-sm">Viewing standings for {selectedSeason}</p>
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

        <div className="grid md:grid-cols-2 gap-8">
          {teams.map((team) => {
            const record = teamRecords[team.name] || { wins: 0, losses: 0, winPercentage: 0 };
            return (
            <Link key={team.name} href={`/teams/${encodeURIComponent(team.name)}?season=${selectedSeason}`}>
              <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                team.name === 'Golden Dragons' ? 'hover:border-yellow-400' : 'hover:border-red-400'
              }`}>
                <div className="text-center mb-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 ${
                    team.name === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {team.name === 'Golden Dragons' ? '🐉' : '🔥'}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{team.name}</h2>
                  <p className="text-gray-300 text-xl mb-4">
                    {record.wins}-{record.losses} ({record.winPercentage}%)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Active Players</h3>
                    <div className="space-y-2">
                      {teamPlayers[team.name]?.length > 0 ? (
                        teamPlayers[team.name].map((player: any) => (
                          <div key={player.id || player.name} className="flex justify-between items-center">
                            <span className="text-gray-300">{player.name}</span>
                            <span className="text-white font-semibold">
                              {(player.points || 0).toFixed(1)} PPG
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No players found for {team.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Click to view detailed team stats →</p>
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
