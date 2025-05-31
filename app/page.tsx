import Link from "next/link";
import { getLeagueData, getRecentGames } from "@/lib/data";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { teams } = getLeagueData();
  const recentGames = getRecentGames().slice(0, 3); // Show last 3 games

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
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Teams</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {teams.map((team) => (
              <Link key={team.name} href={`/teams/${encodeURIComponent(team.name)}`}>
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
                    <p className="text-gray-300 text-lg mb-4">{team.wins}-{team.losses} ({team.winPercentage}%)</p>
                    <p className="text-gray-400">
                      {team.players.filter(p => p.points > 0).length} Active Players
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Recent Games</h3>
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
                          <p className="text-white font-semibold">Golden Dragons</p>
                          <p className="text-2xl font-bold text-white">{game.team1Score}</p>
                        </div>
                        <div className="text-gray-400 text-xl">vs</div>
                        <div className="text-left">
                          <p className="text-white font-semibold">Los Sigmas</p>
                          <p className="text-2xl font-bold text-white">{game.team2Score}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        game.team1Score > game.team2Score ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {game.team1Score > game.team2Score ? 'Golden Dragons Win' : 'Los Sigmas Win'}
                      </p>
                      <p className="text-gray-400 text-sm">View Box Score →</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
