import Link from "next/link";
import { getAllGames } from "@/lib/data";
import Navigation from "@/components/Navigation";

export default function GamesPage() {
  const games = getAllGames().reverse(); // Most recent first

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Game History</h1>
        
        <div className="space-y-6">
          {games.map((game) => (
            <Link key={game.gameNumber} href={`/games/${game.gameNumber}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Game {game.gameNumber}</p>
                      <p className="text-sm text-gray-400">{game.date}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {/* Golden Dragons */}
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-sm">
                            🐉
                          </div>
                          <div>
                            <p className="text-white font-semibold">Golden Dragons</p>
                            <p className="text-2xl font-bold text-white">{game.team1Score}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-xl font-bold">VS</div>
                      
                      {/* Los Sigmas */}
                      <div className="text-left">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-white font-semibold">Los Sigmas</p>
                            <p className="text-2xl font-bold text-white">{game.team2Score}</p>
                          </div>
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm">
                            🔥
                          </div>
                        </div>
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

                {/* Quarter Scores (if available) */}
                {game.quarters && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-gray-400 text-sm">Q1</p>
                        <p className="text-white">{game.quarters.q1.team1} - {game.quarters.q1.team2}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q2</p>
                        <p className="text-white">{game.quarters.q2.team1} - {game.quarters.q2.team2}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q3</p>
                        <p className="text-white">
                          {game.quarters.q3.team1 === 0 && game.quarters.q3.team2 === 0 ? '?' : `${game.quarters.q3.team1} - ${game.quarters.q3.team2}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Q4</p>
                        <p className="text-white">{game.quarters.q4.team1} - {game.quarters.q4.team2}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
