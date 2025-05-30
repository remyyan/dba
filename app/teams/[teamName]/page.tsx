import Link from "next/link";
import { getTeam, getAllTeams } from "@/lib/data";
import { notFound } from "next/navigation";

interface TeamProfileProps {
  params: Promise<{
    teamName: string;
  }>;
}

export default async function TeamProfile({ params }: TeamProfileProps) {
  const { teamName: teamNameStr } = await params;
  const teamName = decodeURIComponent(teamNameStr);
  const team = getTeam(teamName);

  if (!team) {
    notFound();
  }

  const allTeams = getAllTeams();
  const opponent = allTeams.find(t => t.name !== team.name);

  const activePlayers = team.players.filter(p => p.points > 0);
  const teamStats = {
    totalPoints: activePlayers.reduce((sum, p) => sum + p.points, 0),
    totalRebounds: activePlayers.reduce((sum, p) => sum + p.rebounds, 0),
    totalAssists: activePlayers.reduce((sum, p) => sum + p.assists, 0),
    avgFieldGoal: activePlayers.length > 0 ? activePlayers.reduce((sum, p) => sum + p.fieldGoalPercentage, 0) / activePlayers.length : 0,
  };

  const topScorer = activePlayers.reduce((prev, current) => prev.points > current.points ? prev : current, activePlayers[0]);
  const topRebounder = activePlayers.reduce((prev, current) => prev.rebounds > current.rebounds ? prev : current, activePlayers[0]);

  const teamColorClass = team.color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600';
  const teamColorLight = team.color === 'yellow' ? 'bg-yellow-600/20' : 'bg-red-600/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> League
              </Link>
              <span className="text-gray-300 text-sm">Team Profile</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-orange-400 font-semibold">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Team Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className={`p-8 ${teamColorLight}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Team Logo */}
                <div className={`w-32 h-32 ${teamColorClass} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-4xl">
                    {team.name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>

                {/* Team Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{team.name}</h1>
                  <p className="text-xl text-gray-200 mb-4">Denlow Basketball Association</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{team.wins}</p>
                      <p className="text-gray-300 text-sm">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{team.losses}</p>
                      <p className="text-gray-300 text-sm">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{team.winPercentage}%</p>
                      <p className="text-gray-300 text-sm">Win Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{activePlayers.length}</p>
                      <p className="text-gray-300 text-sm">Active Players</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Statistics */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Team Statistics</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Scoring</h3>
              <p className="text-3xl font-bold text-white">{teamStats.totalPoints.toFixed(1)}</p>
              <p className="text-gray-300 text-sm">Points Per Game</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Rebounding</h3>
              <p className="text-3xl font-bold text-white">{teamStats.totalRebounds.toFixed(1)}</p>
              <p className="text-gray-300 text-sm">Rebounds Per Game</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Total Assists</h3>
              <p className="text-3xl font-bold text-white">{teamStats.totalAssists.toFixed(1)}</p>
              <p className="text-gray-300 text-sm">Assists Per Game</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Team FG%</h3>
              <p className="text-3xl font-bold text-white">{(teamStats.avgFieldGoal * 100).toFixed(1)}%</p>
              <p className="text-gray-300 text-sm">Field Goal Percentage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Leaders */}
      <section className="py-8 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Team Leaders</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Leading Scorer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Leading Scorer</h3>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${teamColorClass} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {topScorer?.name.split(' ').map(n => n[0]).join('') || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{topScorer?.name || 'No active players'}</p>
                  <p className="text-gray-300">{topScorer?.points || 0} PPG</p>
                  <p className="text-gray-400 text-sm">Career High: {topScorer?.careerHigh || 0}</p>
                </div>
              </div>
            </div>

            {/* Leading Rebounder */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Leading Rebounder</h3>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${teamColorClass} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {topRebounder?.name.split(' ').map(n => n[0]).join('') || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{topRebounder?.name || 'No active players'}</p>
                  <p className="text-gray-300">{topRebounder?.rebounds || 0} RPG</p>
                  <p className="text-gray-400 text-sm">Also averaging {topRebounder?.assists || 0} APG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Roster */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Complete Roster</h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Player</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">PPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">RPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">APG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">FG%</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player, index) => (
                    <tr key={player.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${teamColorClass} rounded-full flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            {player.points > 0 ? (
                              <Link
                                href={`/players/${encodeURIComponent(player.name)}`}
                                className="text-orange-400 hover:text-orange-300 font-semibold"
                              >
                                {player.name}
                              </Link>
                            ) : (
                              <span className="text-white font-semibold">{player.name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white">{player.points}</td>
                      <td className="px-6 py-4 text-center text-white">{player.rebounds}</td>
                      <td className="px-6 py-4 text-center text-white">{player.assists}</td>
                      <td className="px-6 py-4 text-center text-white">{(player.fieldGoalPercentage * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          player.points > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {player.points > 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Head-to-Head vs Opponent */}
      {opponent && (
        <section className="py-16 px-4 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Season Matchup</h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Current Team */}
                <div className="text-center">
                  <div className={`w-20 h-20 ${teamColorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white font-bold text-2xl">
                      {team.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">{team.wins}-{team.losses} Record</p>
                    <p className="text-gray-300">{team.winPercentage}% Win Rate</p>
                    <p className="text-gray-300">{teamStats.totalPoints.toFixed(1)} PPG</p>
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-4">VS</div>
                  <p className="text-gray-300">Season Series</p>
                  <p className="text-white font-semibold">
                    {team.wins > opponent.wins ? `${team.name} leads` :
                     opponent.wins > team.wins ? `${opponent.name} leads` : 'Series tied'}
                    {` ${Math.max(team.wins, opponent.wins)}-${Math.min(team.wins, opponent.wins)}`}
                  </p>
                </div>

                {/* Opponent */}
                <div className="text-center">
                  <div className={`w-20 h-20 ${opponent.color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white font-bold text-2xl">
                      {opponent.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{opponent.name}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">{opponent.wins}-{opponent.losses} Record</p>
                    <p className="text-gray-300">{opponent.winPercentage}% Win Rate</p>
                    <p className="text-gray-300">
                      {opponent.players.filter(p => p.points > 0).reduce((sum, p) => sum + p.points, 0).toFixed(1)} PPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teams"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Back to All Teams
            </Link>
            <Link
              href="/standings"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View League Standings
            </Link>
          </div>
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
