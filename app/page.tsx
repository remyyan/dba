import Link from "next/link";
import { getLeagueData, getTopPerformers, getActivityFeed, formatTimeAgo, getAllPlayers, getFreeAgents } from "@/lib/data";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { teams, standings } = getLeagueData();
  const topPerformers = getTopPerformers();
  const activityFeed = getActivityFeed().slice(0, 5); // Show latest 5 activities
  const allPlayers = getAllPlayers().filter(p => p.points > 0); // Get active players for stats
  const freeAgents = getFreeAgents(); // Get free agents count

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

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

      {/* Recent Activity Feed */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Recent Activity</h3>
            <Link
              href="/activity"
              className="text-orange-400 hover:text-orange-300 transition-colors text-sm font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <div className="space-y-4">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-semibold">{activity.title}</h4>
                        <span className="text-gray-400 text-xs">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{activity.description}</p>
                      {activity.teams && activity.teams.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          {activity.teams.map((team) => (
                            <span
                              key={team}
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                team === 'Golden Dragons'
                                  ? 'bg-yellow-600/20 text-yellow-400'
                                  : team === 'Los Sigmas'
                                  ? 'bg-red-600/20 text-red-400'
                                  : 'bg-gray-600/20 text-gray-400'
                              }`}
                            >
                              {team}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-6">League Pulse</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🏀</span>
                    </div>
                    <span className="text-white font-semibold">Games Played</span>
                  </div>
                  <span className="text-orange-400 font-bold">3</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                    <span className="text-white font-semibold">Active Players</span>
                  </div>
                  <span className="text-orange-400 font-bold">{allPlayers.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⭐</span>
                    </div>
                    <span className="text-white font-semibold">MVP Votes</span>
                  </div>
                  <span className="text-orange-400 font-bold">
                    {allPlayers.reduce((sum, p) => sum + (p.mvpVotes || 0), 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🆓</span>
                    </div>
                    <span className="text-white font-semibold">Free Agents</span>
                  </div>
                  <span className="text-orange-400 font-bold">{freeAgents.length}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/admin/teams"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center block"
                >
                  Manage Teams
                </Link>
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
