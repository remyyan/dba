import Link from "next/link";
import { getPlayer, getAllPlayers } from "@/lib/data";
import { notFound } from "next/navigation";

interface PlayerProfileProps {
  params: {
    playerName: string;
  };
}

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const playerName = decodeURIComponent(params.playerName);
  const player = getPlayer(playerName);
  
  if (!player) {
    notFound();
  }

  const allPlayers = getAllPlayers().filter(p => p.points > 0);
  const playerRankings = {
    points: allPlayers.sort((a, b) => b.points - a.points).findIndex(p => p.name === player.name) + 1,
    rebounds: allPlayers.sort((a, b) => b.rebounds - a.rebounds).findIndex(p => p.name === player.name) + 1,
    assists: allPlayers.sort((a, b) => b.assists - a.assists).findIndex(p => p.name === player.name) + 1,
    threePointers: allPlayers.sort((a, b) => b.threePointersMade - a.threePointersMade).findIndex(p => p.name === player.name) + 1,
    fieldGoal: allPlayers.sort((a, b) => b.fieldGoalPercentage - a.fieldGoalPercentage).findIndex(p => p.name === player.name) + 1,
  };

  const teamColor = player.team === 'Golden Dragons' ? 'yellow' : 'red';
  const teamColorClass = teamColor === 'yellow' ? 'bg-yellow-600' : 'bg-red-600';

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
              <span className="text-gray-300 text-sm">Player Profile</span>
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

      {/* Player Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className={`p-8 ${teamColor === 'yellow' ? 'bg-yellow-600/20' : 'bg-red-600/20'}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Player Avatar */}
                <div className={`w-32 h-32 ${teamColorClass} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-4xl">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Player Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{player.name}</h1>
                  <p className="text-xl text-gray-200 mb-4">{player.team}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{player.points}</p>
                      <p className="text-gray-300 text-sm">PPG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{player.rebounds}</p>
                      <p className="text-gray-300 text-sm">RPG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{player.assists}</p>
                      <p className="text-gray-300 text-sm">APG</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{player.careerHigh}</p>
                      <p className="text-gray-300 text-sm">Career High</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Offensive Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-orange-400 mb-6">Offensive Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Points Per Game</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{player.points}</span>
                    <span className="text-gray-400 text-sm ml-2">(#{playerRankings.points} in league)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Career High</span>
                  <span className="text-white font-bold text-lg">{player.careerHigh}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">3-Pointers Made</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{player.threePointersMade}</span>
                    <span className="text-gray-400 text-sm ml-2">(#{playerRankings.threePointers} in league)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Field Goal %</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{(player.fieldGoalPercentage * 100).toFixed(1)}%</span>
                    <span className="text-gray-400 text-sm ml-2">(#{playerRankings.fieldGoal} in league)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">3-Point %</span>
                  <span className="text-white font-bold text-lg">{(player.threePointPercentage * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Free Throw %</span>
                  <span className="text-white font-bold text-lg">{(player.freeThrowPercentage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Defensive & Other Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-orange-400 mb-6">All-Around Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Rebounds Per Game</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{player.rebounds}</span>
                    <span className="text-gray-400 text-sm ml-2">(#{playerRankings.rebounds} in league)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Assists Per Game</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{player.assists}</span>
                    <span className="text-gray-400 text-sm ml-2">(#{playerRankings.assists} in league)</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Steals Per Game</span>
                  <span className="text-white font-bold text-lg">{player.steals}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Blocks Per Game</span>
                  <span className="text-white font-bold text-lg">{player.blocks}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Minutes Per Game</span>
                  <span className="text-white font-bold text-lg">{player.minutes}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Free Throw Attempts</span>
                  <span className="text-white font-bold text-lg">{player.freeThrowAttempts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Impact */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Player Impact</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Efficiency Rating */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Efficiency Rating</h3>
              <div className="text-4xl font-bold text-white mb-2">
                {((player.points + player.rebounds + player.assists + player.steals + player.blocks) / 5).toFixed(1)}
              </div>
              <p className="text-gray-300 text-sm">Combined impact score</p>
            </div>

            {/* MVP Votes */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">MVP Votes</h3>
              <div className="text-4xl font-bold text-white mb-2">{player.mvpVotes || 0}</div>
              <p className="text-gray-300 text-sm">Current season votes</p>
              <Link 
                href="/mvp-voting" 
                className="inline-block mt-3 text-orange-400 hover:text-orange-300 text-sm font-medium"
              >
                Vote for MVP →
              </Link>
            </div>

            {/* Team Contribution */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-4">Team Contribution</h3>
              <div className="text-4xl font-bold text-white mb-2">
                {player.team === 'Los Sigmas' ? '67%' : '33%'}
              </div>
              <p className="text-gray-300 text-sm">Team win percentage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/players" 
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Back to All Players
            </Link>
            <Link 
              href={`/teams/${encodeURIComponent(player.team)}`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Team Profile
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
