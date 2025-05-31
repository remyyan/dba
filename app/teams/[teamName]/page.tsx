import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeam, getTeamGameStats } from "@/lib/data";
import Navigation from "@/components/Navigation";

interface TeamPageProps {
  params: Promise<{ teamName: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamName } = await params;
  const decodedTeamName = decodeURIComponent(teamName);
  const team = getTeam(decodedTeamName);
  
  if (!team) {
    notFound();
  }

  const gameStats = getTeamGameStats(team.name);
  const activePlayers = team.players.filter(p => p.points > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
          <p className="text-2xl text-gray-300">{team.wins}-{team.losses} ({team.winPercentage}%)</p>
        </div>

        {/* Team Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Games Played</h3>
            <p className="text-3xl font-bold text-white">{gameStats.gamesPlayed}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Avg Points Scored</h3>
            <p className="text-3xl font-bold text-white">{gameStats.avgPointsScored}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Avg Points Allowed</h3>
            <p className="text-3xl font-bold text-white">{gameStats.avgPointsAllowed}</p>
          </div>
        </div>

        {/* Active Players */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Players</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-orange-400 font-semibold py-3">Player</th>
                  <th className="text-center text-orange-400 font-semibold py-3">PPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">RPG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">APG</th>
                  <th className="text-center text-orange-400 font-semibold py-3">FG%</th>
                  <th className="text-center text-orange-400 font-semibold py-3">3P%</th>
                </tr>
              </thead>
              <tbody>
                {activePlayers.map((player) => (
                  <tr key={player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-4">{player.name}</td>
                    <td className="text-center text-gray-300 py-4">{player.points.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.rebounds.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{player.assists.toFixed(1)}</td>
                    <td className="text-center text-gray-300 py-4">{(player.fieldGoalPercentage * 100).toFixed(1)}%</td>
                    <td className="text-center text-gray-300 py-4">{(player.threePointPercentage * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
