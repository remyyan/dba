import Link from "next/link";
import { getAllTeams } from "@/lib/data";

export default function TeamsPage() {
  const teams = getAllTeams();

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
              <span className="text-gray-300 text-sm">Teams</span>
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

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">DBA Teams</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Meet the powerhouse teams competing in the Denlow Basketball Association
          </p>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {teams.map((team) => (
              <div key={team.name} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                {/* Team Header */}
                <div className={`p-6 ${team.color === 'yellow' ? 'bg-yellow-600/20' : 'bg-red-600/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{team.name}</h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg text-gray-200">
                          Record: {team.wins}-{team.losses}
                        </span>
                        <span className="text-lg text-gray-200">
                          ({team.winPercentage}% Win Rate)
                        </span>
                      </div>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      team.color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      <span className="text-white font-bold text-2xl">
                        {team.name.split(' ').map(word => word[0]).join('')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Stats Summary */}
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Team Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {team.players.reduce((sum, player) => sum + player.points, 0).toFixed(1)}
                      </p>
                      <p className="text-gray-300 text-sm">Total PPG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {team.players.reduce((sum, player) => sum + player.rebounds, 0).toFixed(1)}
                      </p>
                      <p className="text-gray-300 text-sm">Total RPG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {team.players.reduce((sum, player) => sum + player.assists, 0).toFixed(1)}
                      </p>
                      <p className="text-gray-300 text-sm">Total APG</p>
                    </div>
                  </div>
                </div>

                {/* Roster */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Roster</h3>
                  <div className="space-y-3">
                    {team.players.map((player) => (
                      <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{player.name}</p>
                          <p className="text-gray-300 text-sm">
                            {player.points > 0 ? `${player.points} PPG, ${player.rebounds} RPG, ${player.assists} APG` : 'No stats recorded'}
                          </p>
                        </div>
                        {player.points > 0 && (
                          <Link 
                            href={`/players/${encodeURIComponent(player.name)}`}
                            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                          >
                            View Stats →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Action */}
                <div className="p-6 bg-white/5">
                  <Link 
                    href={`/teams/${encodeURIComponent(team.name)}`}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
                  >
                    View Full Team Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Comparison */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Head-to-Head Comparison</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Los Sigmas */}
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">LS</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Los Sigmas</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">2-1 Record</p>
                  <p className="text-gray-300">67% Win Rate</p>
                  <p className="text-orange-400 font-semibold">League Leaders</p>
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-4">VS</div>
                <p className="text-gray-300">Season Series</p>
                <p className="text-white font-semibold">Los Sigmas leads 2-1</p>
              </div>

              {/* Golden Dragons */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">GD</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Golden Dragons</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">1-2 Record</p>
                  <p className="text-gray-300">33% Win Rate</p>
                  <p className="text-gray-400">Rebuilding Season</p>
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
