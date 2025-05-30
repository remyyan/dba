import Link from "next/link";
import { getAllPlayers } from "@/lib/data";

export default function PlayersPage() {
  const allPlayers = getAllPlayers();
  const activePlayers = allPlayers.filter(p => p.points > 0);
  
  // Sort players by different categories for leaderboards
  const scoringLeaders = [...activePlayers].sort((a, b) => b.points - a.points);
  const reboundingLeaders = [...activePlayers].sort((a, b) => b.rebounds - a.rebounds);
  const assistsLeaders = [...activePlayers].sort((a, b) => b.assists - a.assists);
  const threePointLeaders = [...activePlayers].sort((a, b) => b.threePointersMade - a.threePointersMade);
  const efficiencyLeaders = [...activePlayers].sort((a, b) => b.fieldGoalPercentage - a.fieldGoalPercentage);

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
              <span className="text-gray-300 text-sm">Players</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-orange-400 font-semibold">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Player Statistics</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive stats and rankings for all DBA players
          </p>
        </div>
      </section>

      {/* Statistical Leaders */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">League Leaders</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Scoring Leaders */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Scoring Leaders</h3>
              <div className="space-y-3">
                {scoringLeaders.slice(0, 3).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-gray-300 text-sm">{player.team}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold">{player.points}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebounding Leaders */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Rebounding Leaders</h3>
              <div className="space-y-3">
                {reboundingLeaders.slice(0, 3).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-gray-300 text-sm">{player.team}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold">{player.rebounds}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assists Leaders */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Assists Leaders</h3>
              <div className="space-y-3">
                {assistsLeaders.slice(0, 3).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-gray-300 text-sm">{player.team}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold">{player.assists}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Player Stats Table */}
      <section className="py-8 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Complete Player Statistics</h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Player</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Team</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">PPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">RPG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">APG</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">3PM</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">FG%</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Career High</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlayers.map((player, index) => (
                    <tr key={player.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/players/${encodeURIComponent(player.name)}`}
                          className="text-orange-400 hover:text-orange-300 font-semibold"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          player.team === 'Golden Dragons' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-gray-300">{player.team}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{player.points}</td>
                      <td className="px-6 py-4 text-center text-white">{player.rebounds}</td>
                      <td className="px-6 py-4 text-center text-white">{player.assists}</td>
                      <td className="px-6 py-4 text-center text-white">{player.threePointersMade}</td>
                      <td className="px-6 py-4 text-center text-white">{(player.fieldGoalPercentage * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 text-center text-orange-400 font-semibold">{player.careerHigh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Stats Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Specialized Categories</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Three-Point Specialists */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Three-Point Specialists</h3>
              <div className="space-y-3">
                {threePointLeaders.slice(0, 5).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-gray-300 text-sm">{player.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{player.threePointersMade} 3PM</p>
                      <p className="text-gray-300 text-sm">{(player.threePointPercentage * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Efficiency Leaders */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Shooting Efficiency</h3>
              <div className="space-y-3">
                {efficiencyLeaders.slice(0, 5).map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-gray-300 text-sm">{player.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{(player.fieldGoalPercentage * 100).toFixed(1)}% FG</p>
                      <p className="text-gray-300 text-sm">{(player.freeThrowPercentage * 100).toFixed(1)}% FT</p>
                    </div>
                  </div>
                ))}
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
