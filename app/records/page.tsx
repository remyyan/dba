import Link from "next/link";
import { getLeagueRecords, getGameRecords, getAllPlayers } from "@/lib/data";

export default function RecordsPage() {
  const leagueRecords = getLeagueRecords();
  const gameRecords = getGameRecords();
  const players = getAllPlayers().filter(p => p.points > 0);

  // Calculate additional records from player data
  const highestScoringAverage = Math.max(...players.map(p => p.points));
  const highestReboundingAverage = Math.max(...players.map(p => p.rebounds));
  const highestAssistAverage = Math.max(...players.map(p => p.assists));
  const bestFieldGoalPercentage = Math.max(...players.map(p => p.fieldGoalPercentage));

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
              <span className="text-gray-300 text-sm">Records</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-orange-400 font-semibold">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">League Records</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Historic achievements and milestones in DBA history
          </p>
        </div>
      </section>

      {/* Single Game Records */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Single Game Records</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {leagueRecords.map((record, index) => (
              <div key={record.category} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  index === 0 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}>
                  <span className="text-white font-bold text-2xl">{typeof record.value === 'number' ? record.value : '∞'}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{record.category}</h3>
                <p className="text-gray-300 text-sm mb-2">{record.description}</p>
                <p className="text-orange-400 font-semibold">{record.player}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Season Records */}
      <section className="py-8 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Season Records</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{highestScoringAverage}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Highest PPG</h3>
              <p className="text-gray-300 text-sm mb-2">Season scoring average</p>
              <p className="text-orange-400 font-semibold">A. Guo</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{highestReboundingAverage}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Highest RPG</h3>
              <p className="text-gray-300 text-sm mb-2">Season rebounding average</p>
              <p className="text-orange-400 font-semibold">R. Yan</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{highestAssistAverage}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Highest APG</h3>
              <p className="text-gray-300 text-sm mb-2">Season assists average</p>
              <p className="text-orange-400 font-semibold">R. Yan</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-sm">{(bestFieldGoalPercentage * 100).toFixed(0)}%</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Best FG%</h3>
              <p className="text-gray-300 text-sm mb-2">Season field goal percentage</p>
              <p className="text-orange-400 font-semibold">A. Guo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Player of the Game Records */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Player of the Game Performances</h2>
          
          <div className="space-y-6">
            {gameRecords.map((record, index) => (
              <div key={`${record.game}-${index}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{record.game.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{record.game}</h3>
                      <p className="text-gray-300">Player of the Game</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-lg">{record.player}</p>
                    <p className="text-gray-300 text-sm">Los Sigmas</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">{record.achievement}</p>
                  <p className="text-gray-300 text-sm">{record.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Record Categories */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Record Categories</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Offensive Records</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Points (Game)</span>
                  <span className="text-white font-semibold">100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Most 3PM (Game)</span>
                  <span className="text-white font-semibold">14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Highest PPG (Season)</span>
                  <span className="text-white font-semibold">75.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Best FG% (Season)</span>
                  <span className="text-white font-semibold">52%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Defensive Records</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Rebounds (Game)</span>
                  <span className="text-white font-semibold">41</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Steals (Game)</span>
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Blocks (Game)</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Highest RPG (Season)</span>
                  <span className="text-white font-semibold">30.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Team Records</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Best Record</span>
                  <span className="text-white font-semibold">2-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Highest Win %</span>
                  <span className="text-white font-semibold">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Most Team PPG</span>
                  <span className="text-white font-semibold">107.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Games Played</span>
                  <span className="text-white font-semibold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historic Moments */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Historic Moments</h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">The 100-Point Game</h3>
              <p className="text-gray-300 max-w-3xl mx-auto">
                In a legendary performance that will be remembered forever in DBA history, Andrew Guo scored an incredible 
                100 points in a single game while also grabbing 41 rebounds. This historic achievement showcases the 
                extraordinary talent and determination that defines the Denlow Basketball Association.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-white mb-2">100</p>
                <p className="text-gray-300">Points Scored</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">41</p>
                <p className="text-gray-300">Rebounds</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-2">49%</p>
                <p className="text-gray-300">Field Goal %</p>
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
