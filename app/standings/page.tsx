import Link from "next/link";
import { getLeagueData, getAllPlayers } from "@/lib/data";

export default function StandingsPage() {
  const { standings, totalGames } = getLeagueData();
  const players = getAllPlayers().filter(p => p.points > 0);

  // Calculate team stats
  const teamStats = standings.map(team => {
    const teamPlayers = players.filter(p => p.team === team.name);
    const totalPoints = teamPlayers.reduce((sum, p) => sum + p.points, 0);
    const totalRebounds = teamPlayers.reduce((sum, p) => sum + p.rebounds, 0);
    const totalAssists = teamPlayers.reduce((sum, p) => sum + p.assists, 0);
    
    return {
      ...team,
      avgPoints: totalPoints,
      avgRebounds: totalRebounds,
      avgAssists: totalAssists,
      activePlayers: teamPlayers.length
    };
  });

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
              <span className="text-gray-300 text-sm">Standings</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-orange-400 font-semibold">Standings</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">League Standings</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Current team rankings and performance metrics for the DBA season
          </p>
        </div>
      </section>

      {/* Main Standings Table */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="bg-white/10 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Team Standings</h2>
              <p className="text-gray-300 text-sm">Season Record: {totalGames} games played</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Team</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">W</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">L</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Win %</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">PPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">RPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">APG</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.map((team, index) => (
                    <tr key={team.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            team.color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {team.name.split(' ').map(word => word[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <Link 
                              href={`/teams/${encodeURIComponent(team.name)}`}
                              className="text-white font-semibold hover:text-orange-400 transition-colors"
                            >
                              {team.name}
                            </Link>
                            <p className="text-gray-300 text-sm">{team.activePlayers} active players</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{team.wins}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{team.losses}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${index === 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {team.winPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-white">{team.avgPoints.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center text-white">{team.avgRebounds.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center text-white">{team.avgAssists.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Team Comparison Charts */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Team Performance Comparison</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Scoring Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-6 text-center">Scoring (PPG)</h3>
              <div className="space-y-4">
                {teamStats.map((team) => (
                  <div key={team.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{team.name}</span>
                      <span className="text-white">{team.avgPoints.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${team.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(team.avgPoints / Math.max(...teamStats.map(t => t.avgPoints))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebounding Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-6 text-center">Rebounding (RPG)</h3>
              <div className="space-y-4">
                {teamStats.map((team) => (
                  <div key={team.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{team.name}</span>
                      <span className="text-white">{team.avgRebounds.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${team.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(team.avgRebounds / Math.max(...teamStats.map(t => t.avgRebounds))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assists Comparison */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-6 text-center">Assists (APG)</h3>
              <div className="space-y-4">
                {teamStats.map((team) => (
                  <div key={team.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{team.name}</span>
                      <span className="text-white">{team.avgAssists.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${team.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(team.avgAssists / Math.max(...teamStats.map(t => t.avgAssists))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Summary */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Season Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* League Leaders */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Current League Leader</h3>
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">LS</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Los Sigmas</h4>
                <p className="text-gray-300 mb-4">Leading the league with a 2-1 record</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">67%</p>
                    <p className="text-gray-300 text-sm">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">107.7</p>
                    <p className="text-gray-300 text-sm">PPG</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">47</p>
                    <p className="text-gray-300 text-sm">RPG</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Playoff Picture */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Playoff Picture</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <span className="text-white font-semibold">Los Sigmas</span>
                    </div>
                    <span className="text-green-400 font-semibold">Playoff Position</span>
                  </div>
                </div>
                
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <span className="text-white font-semibold">Golden Dragons</span>
                    </div>
                    <span className="text-red-400 font-semibold">Elimination Zone</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <p className="text-gray-300 text-sm text-center">
                    With {totalGames} games played, Los Sigmas currently hold the advantage in the season series.
                  </p>
                </div>
              </div>
            </div>
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
