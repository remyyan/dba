import Link from "next/link";
import { getLeagueData, getTopPerformers } from "@/lib/data";

export default function Home() {
  const { teams, standings } = getLeagueData();
  const topPerformers = getTopPerformers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">
                <span className="text-orange-400">DBA</span> League
              </h1>
              <span className="text-gray-300 text-sm">Denlow Basketball Association</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/games" className="text-white hover:text-orange-400 transition-colors">Games</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to the <span className="text-orange-400">DBA</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the intensity of the Denlow Basketball Association - where legends are made and records are broken.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mvp-voting"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Vote for MVP
            </Link>
            <Link
              href="/players"
              className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Stats
            </Link>
          </div>
        </div>
      </section>

      {/* Current Standings */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Current Standings</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {standings.map((team, index) => (
              <div key={team.name} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      team.name === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{team.name}</h4>
                      <p className="text-gray-300">{team.wins}-{team.losses}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{team.winPercentage}%</p>
                    <p className="text-gray-300 text-sm">Win Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">League Leaders</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">Scoring Leader</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{topPerformers.scoring.points}</p>
                <p className="text-gray-300">PPG</p>
                <p className="text-white font-semibold mt-2">{topPerformers.scoring.name}</p>
                <p className="text-gray-400 text-sm">{topPerformers.scoring.team}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">Rebounding Leader</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{topPerformers.rebounding.rebounds}</p>
                <p className="text-gray-300">RPG</p>
                <p className="text-white font-semibold mt-2">{topPerformers.rebounding.name}</p>
                <p className="text-gray-400 text-sm">{topPerformers.rebounding.team}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">Assists Leader</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{topPerformers.assists.assists}</p>
                <p className="text-gray-300">APG</p>
                <p className="text-white font-semibold mt-2">{topPerformers.assists.name}</p>
                <p className="text-gray-400 text-sm">{topPerformers.assists.team}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Explore the League</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/teams" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">Team Profiles</h4>
              <p className="text-gray-300 text-sm">Explore team rosters, stats, and performance</p>
            </Link>

            <Link href="/players" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">Player Stats</h4>
              <p className="text-gray-300 text-sm">Individual player statistics and rankings</p>
            </Link>

            <Link href="/games" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">Games & Schedule</h4>
              <p className="text-gray-300 text-sm">Recent results and upcoming matchups</p>
            </Link>

            <Link href="/mvp-voting" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">MVP Voting</h4>
              <p className="text-gray-300 text-sm">Cast your vote for this season's MVP</p>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Link href="/standings" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">League Standings</h4>
              <p className="text-gray-300 text-sm">Current team rankings and performance metrics</p>
            </Link>

            <Link href="/records" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">League Records</h4>
              <p className="text-gray-300 text-sm">Historic achievements and milestones</p>
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
