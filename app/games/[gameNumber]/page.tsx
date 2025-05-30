import Link from "next/link";
import { getGame } from "@/lib/data";
import { notFound } from "next/navigation";

interface GameDetailProps {
  params: Promise<{
    gameNumber: string;
  }>;
}

export default async function GameDetail({ params }: GameDetailProps) {
  const { gameNumber: gameNumberStr } = await params;
  const gameNumber = parseInt(gameNumberStr);
  const game = getGame(gameNumber);

  if (!game) {
    notFound();
  }

  const team1Name = "Golden Dragons";
  const team2Name = "Los Sigmas";
  const winner = game.team2Score > game.team1Score ? team2Name : team1Name;
  const winnerScore = Math.max(game.team1Score, game.team2Score);
  const loserScore = Math.min(game.team1Score, game.team2Score);

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
              <span className="text-gray-300 text-sm">Game {game.gameNumber} Recap</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-orange-400 transition-colors">Home</Link>
              <Link href="/teams" className="text-white hover:text-orange-400 transition-colors">Teams</Link>
              <Link href="/players" className="text-white hover:text-orange-400 transition-colors">Players</Link>
              <Link href="/standings" className="text-white hover:text-orange-400 transition-colors">Standings</Link>
              <Link href="/games" className="text-orange-400 font-semibold">Games</Link>
              <Link href="/mvp-voting" className="text-white hover:text-orange-400 transition-colors">MVP Voting</Link>
              <Link href="/records" className="text-white hover:text-orange-400 transition-colors">Records</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Game Header */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Game {game.gameNumber} Final</h1>
                <p className="text-xl text-gray-300">{new Date(game.date).toLocaleDateString()}</p>
                <p className="text-lg text-orange-400 font-semibold mt-2">{winner} Win!</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Golden Dragons */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">GD</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{team1Name}</h2>
                  <p className="text-4xl font-bold text-white">{game.team1Score}</p>
                </div>

                {/* VS */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-400 mb-2">FINAL</p>
                  <p className="text-gray-300">{winnerScore} - {loserScore}</p>
                </div>

                {/* Los Sigmas */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">LS</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{team2Name}</h2>
                  <p className="text-4xl font-bold text-white">{game.team2Score}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quarter by Quarter */}
      {game.quarters && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Quarter by Quarter</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold">Team</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Q1</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Q2</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Q3</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Q4</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/10">
                      <td className="px-6 py-4 text-white font-semibold">{team1Name}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q1.team1}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q2.team1}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q3.team1 || '-'}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q4.team1}</td>
                      <td className="px-6 py-4 text-center text-white font-bold">{game.team1Score}</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-6 py-4 text-white font-semibold">{team2Name}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q1.team2}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q2.team2}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q3.team2 || '-'}</td>
                      <td className="px-6 py-4 text-center text-white">{game.quarters.q4.team2}</td>
                      <td className="px-6 py-4 text-center text-white font-bold">{game.team2Score}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Player Statistics */}
      <section className="py-8 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Player Statistics</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Golden Dragons Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="bg-yellow-600/20 p-4">
                <h3 className="text-xl font-bold text-white">{team1Name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-2 py-2 text-left text-white font-semibold">Player</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">PTS</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">REB</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">AST</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FGM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FGA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FG%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3PM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3PA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3P%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FTM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FTA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FT%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">STL</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">BLK</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">MIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.team1Players.map((player, index) => (
                      <tr key={player.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                        <td className="px-2 py-2 text-white font-semibold">{player.name}</td>
                        <td className="px-2 py-2 text-center text-white">{player.points}</td>
                        <td className="px-2 py-2 text-center text-white">{player.rebounds}</td>
                        <td className="px-2 py-2 text-center text-white">{player.assists}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fgm}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fga}</td>
                        <td className="px-2 py-2 text-center text-white">{(player.fgPercentage * 100).toFixed(1)}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.threePM}</td>
                        <td className="px-2 py-2 text-center text-white">{player.threePA}</td>
                        <td className="px-2 py-2 text-center text-white">{(player.threePPercentage * 100).toFixed(1)}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.ftm}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fta}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fta > 0 ? (player.ftPercentage * 100).toFixed(1) : '0.0'}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.steals}</td>
                        <td className="px-2 py-2 text-center text-white">{player.blocks}</td>
                        <td className="px-2 py-2 text-center text-white">{player.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Los Sigmas Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="bg-red-600/20 p-4">
                <h3 className="text-xl font-bold text-white">{team2Name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-2 py-2 text-left text-white font-semibold">Player</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">PTS</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">REB</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">AST</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FGM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FGA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FG%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3PM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3PA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">3P%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FTM</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FTA</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">FT%</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">STL</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">BLK</th>
                      <th className="px-2 py-2 text-center text-white font-semibold">MIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.team2Players.map((player, index) => (
                      <tr key={player.name} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                        <td className="px-2 py-2 text-white font-semibold">{player.name}</td>
                        <td className="px-2 py-2 text-center text-white">{player.points}</td>
                        <td className="px-2 py-2 text-center text-white">{player.rebounds}</td>
                        <td className="px-2 py-2 text-center text-white">{player.assists}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fgm}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fga}</td>
                        <td className="px-2 py-2 text-center text-white">{(player.fgPercentage * 100).toFixed(1)}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.threePM}</td>
                        <td className="px-2 py-2 text-center text-white">{player.threePA}</td>
                        <td className="px-2 py-2 text-center text-white">{(player.threePPercentage * 100).toFixed(1)}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.ftm}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fta}</td>
                        <td className="px-2 py-2 text-center text-white">{player.fta > 0 ? (player.ftPercentage * 100).toFixed(1) : '0.0'}%</td>
                        <td className="px-2 py-2 text-center text-white">{player.steals}</td>
                        <td className="px-2 py-2 text-center text-white">{player.blocks}</td>
                        <td className="px-2 py-2 text-center text-white">{player.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Summary */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Game Summary</h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-400 mb-2">Leading Scorer</h3>
                {(() => {
                  const topScorer = [...game.team1Players, ...game.team2Players]
                    .reduce((prev, current) => prev.points > current.points ? prev : current);
                  return (
                    <div>
                      <p className="text-2xl font-bold text-white">{topScorer.name}</p>
                      <p className="text-gray-300">{topScorer.points} points</p>
                    </div>
                  );
                })()}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-400 mb-2">Leading Rebounder</h3>
                {(() => {
                  const topRebounder = [...game.team1Players, ...game.team2Players]
                    .reduce((prev, current) => prev.rebounds > current.rebounds ? prev : current);
                  return (
                    <div>
                      <p className="text-2xl font-bold text-white">{topRebounder.name}</p>
                      <p className="text-gray-300">{topRebounder.rebounds} rebounds</p>
                    </div>
                  );
                })()}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-400 mb-2">Most Assists</h3>
                {(() => {
                  const topAssister = [...game.team1Players, ...game.team2Players]
                    .reduce((prev, current) => prev.assists > current.assists ? prev : current);
                  return (
                    <div>
                      <p className="text-2xl font-bold text-white">{topAssister.name}</p>
                      <p className="text-gray-300">{topAssister.assists} assists</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Back to All Games
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
