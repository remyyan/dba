"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllTeams, getPlayersByTeam } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<{[key: string]: any[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamsData = await getAllTeams();
        setTeams(teamsData);

        // Load players for each team
        const playersData: {[key: string]: any[]} = {};
        for (const team of teamsData) {
          const players = await getPlayersByTeam(team.name);
          playersData[team.name] = players.filter(p => p.points > 0);
        }
        setTeamPlayers(playersData);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">DBA Teams</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {teams.map((team) => (
            <Link key={team.name} href={`/teams/${encodeURIComponent(team.name)}`}>
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
                  <p className="text-gray-300 text-xl mb-4">{team.wins}-{team.losses} ({team.winPercentage}%)</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Active Players</h3>
                    <div className="space-y-2">
                      {teamPlayers[team.name]?.length > 0 ? (
                        teamPlayers[team.name].map((player: any) => (
                          <div key={player.name} className="flex justify-between items-center">
                            <span className="text-gray-300">{player.name}</span>
                            <span className="text-white font-semibold">{player.points.toFixed(1)} PPG</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">No active players</p>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Click to view detailed team stats →</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
