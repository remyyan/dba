import { notFound } from "next/navigation";
import Link from "next/link";
import { getGame } from "@/lib/data";
import Navigation from "@/components/Navigation";

interface GamePageProps {
  params: Promise<{ gameNumber: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameNumber } = await params;
  const gameNum = parseInt(gameNumber);
  const game = getGame(gameNum);

  if (!game) {
    notFound();
  }

  const formatPercentage = (value: number) => {
    if (value === 0) return "0.00";
    return (value * 100).toFixed(0) + "%";
  };

  const formatStat = (value: number) => {
    return value === 0 ? "0" : value.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Game {game.gameNumber} Box Score</h1>
          <p className="text-xl text-gray-300 mb-6">{game.date}</p>

          {/* Final Score */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-lg">
                    🐉
                  </div>
                  <h2 className="text-2xl font-bold text-white">Golden Dragons</h2>
                </div>
                <p className="text-4xl font-bold text-white">{game.team1Score}</p>
              </div>

              <div className="text-gray-400 text-2xl font-bold">VS</div>

              <div className="text-center">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">Los Sigmas</h2>
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-lg">
                    🔥
                  </div>
                </div>
                <p className="text-4xl font-bold text-white">{game.team2Score}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className={`text-xl font-semibold ${
                game.team1Score > game.team2Score ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {game.team1Score > game.team2Score ? 'Golden Dragons Win' : 'Los Sigmas Win'}
              </p>
            </div>
          </div>
        </div>

        {/* Quarter Scores */}
        {game.quarters && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Quarter by Quarter</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-orange-400 font-semibold py-2">Team</th>
                    <th className="text-center text-orange-400 font-semibold py-2">Q1</th>
                    <th className="text-center text-orange-400 font-semibold py-2">Q2</th>
                    <th className="text-center text-orange-400 font-semibold py-2">Q3</th>
                    <th className="text-center text-orange-400 font-semibold py-2">Q4</th>
                    <th className="text-center text-orange-400 font-semibold py-2">Final</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="text-white font-semibold py-3">Golden Dragons</td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q1.team1}</td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q2.team1}</td>
                    <td className="text-center text-gray-300 py-3">
                      {game.quarters.q3.team1 === 0 && game.quarters.q3.team2 === 0 ? '?' : game.quarters.q3.team1}
                    </td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q4.team1}</td>
                    <td className="text-center text-white font-bold py-3">{game.team1Score}</td>
                  </tr>
                  <tr>
                    <td className="text-white font-semibold py-3">Los Sigmas</td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q1.team2}</td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q2.team2}</td>
                    <td className="text-center text-gray-300 py-3">
                      {game.quarters.q3.team1 === 0 && game.quarters.q3.team2 === 0 ? '?' : game.quarters.q3.team2}
                    </td>
                    <td className="text-center text-gray-300 py-3">{game.quarters.q4.team2}</td>
                    <td className="text-center text-white font-bold py-3">{game.team2Score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Golden Dragons Box Score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-sm mr-3">
              🐉
            </div>
            Golden Dragons
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-orange-400 font-semibold py-2">Player</th>
                  <th className="text-center text-orange-400 font-semibold py-2">PTS</th>
                  <th className="text-center text-orange-400 font-semibold py-2">REB</th>
                  <th className="text-center text-orange-400 font-semibold py-2">AST</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FGM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FGA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FG%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3PM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3PA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3P%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FTM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FTA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FT%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">STL</th>
                  <th className="text-center text-orange-400 font-semibold py-2">BLK</th>
                  <th className="text-center text-orange-400 font-semibold py-2">MIN</th>
                </tr>
              </thead>
              <tbody>
                {game.team1Players.map((player) => (
                  <tr key={player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-2">{player.name}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.points)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.rebounds)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.assists)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fgm)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fga)}</td>
                    <td className="text-center text-gray-300 py-2">{formatPercentage(player.fgPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.threePM)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.threePA)}</td>
                    <td className="text-center text-gray-300 py-2">{formatPercentage(player.threePPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.ftm)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fta)}</td>
                    <td className="text-center text-gray-300 py-2">{player.fta === 0 ? "0%" : formatPercentage(player.ftPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.steals)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.blocks)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Los Sigmas Box Score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm mr-3">
              🔥
            </div>
            Los Sigmas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-orange-400 font-semibold py-2">Player</th>
                  <th className="text-center text-orange-400 font-semibold py-2">PTS</th>
                  <th className="text-center text-orange-400 font-semibold py-2">REB</th>
                  <th className="text-center text-orange-400 font-semibold py-2">AST</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FGM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FGA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FG%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3PM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3PA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">3P%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FTM</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FTA</th>
                  <th className="text-center text-orange-400 font-semibold py-2">FT%</th>
                  <th className="text-center text-orange-400 font-semibold py-2">STL</th>
                  <th className="text-center text-orange-400 font-semibold py-2">BLK</th>
                  <th className="text-center text-orange-400 font-semibold py-2">MIN</th>
                </tr>
              </thead>
              <tbody>
                {game.team2Players.map((player) => (
                  <tr key={player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-2">{player.name}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.points)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.rebounds)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.assists)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fgm)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fga)}</td>
                    <td className="text-center text-gray-300 py-2">{formatPercentage(player.fgPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.threePM)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.threePA)}</td>
                    <td className="text-center text-gray-300 py-2">{formatPercentage(player.threePPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.ftm)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.fta)}</td>
                    <td className="text-center text-gray-300 py-2">{player.fta === 0 ? "0%" : formatPercentage(player.ftPercentage)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.steals)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.blocks)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link
            href="/games"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors mr-4"
          >
            ← Back to Games
          </Link>
          <Link
            href="/"
            className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
