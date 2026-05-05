"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getGame, calculatePlayerScore } from "@/lib/firebase-data";
import Navigation from "@/components/Navigation";

interface GamePageProps {
  params: Promise<{ gameNumber: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadGame = async () => {
      try {
        const { gameNumber: gameNumStr } = await params;
        const gameNum = parseInt(gameNumStr);

        const gameData = await getGame(gameNum);
        if (gameData) {
          // Calculate player scores for all players
          gameData.team1Players = gameData.team1Players.map((player: any) => ({
            ...player,
            playerScore: calculatePlayerScore(player)
          }));
          gameData.team2Players = gameData.team2Players.map((player: any) => ({
            ...player,
            playerScore: calculatePlayerScore(player)
          }));
          
          // Recalculate POTG score if exists
          if (gameData.playerOfTheGame) {
            const allPlayers = [...gameData.team1Players, ...gameData.team2Players];
            const potg = gameData.playerOfTheGame;
            const potgPlayer = allPlayers.find(
              (p: any) => p.playerName === potg.playerName || p.playerId === potg.playerId
            );
            if (potgPlayer) {
              gameData.playerOfTheGame.score = (potgPlayer as any).playerScore;
            }
          }
        }
        setGame(gameData);
      } catch (error) {
        console.error('Error loading game:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  if (!game) {
    notFound();
  }

  const formatPercentage = (value: number) => {
    if (!value || value === 0) return "0%";
    return (value * 100).toFixed(0) + "%";
  };

  const formatStat = (value: number) => {
    return value === 0 ? "0" : value.toString();
  };

  // Calculate team totals
  const calculateTeamTotals = (players: any[]) => {
    const totals = {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0,
      fgm: 0, fga: 0, threePM: 0, threePA: 0, ftm: 0, fta: 0, minutes: 0, playerScore: 0
    };
    
    for (const p of players) {
      totals.points += p.points || 0;
      totals.rebounds += p.rebounds || 0;
      totals.assists += p.assists || 0;
      totals.steals += p.steals || 0;
      totals.blocks += p.blocks || 0;
      totals.turnovers += p.turnovers || 0;
      totals.fgm += p.fgm || 0;
      totals.fga += p.fga || 0;
      totals.threePM += p.threePM || 0;
      totals.threePA += p.threePA || 0;
      totals.ftm += p.ftm || 0;
      totals.fta += p.fta || 0;
      totals.minutes += p.minutes || 0;
      totals.playerScore += p.playerScore || 0;
    }
    
    return {
      ...totals,
      fgPercentage: totals.fga > 0 ? totals.fgm / totals.fga : 0,
      threePPercentage: totals.threePA > 0 ? totals.threePM / totals.threePA : 0,
      ftPercentage: totals.fta > 0 ? totals.ftm / totals.fta : 0
    };
  };

  const team1Totals = game ? calculateTeamTotals(game.team1Players || []) : null;
  const team2Totals = game ? calculateTeamTotals(game.team2Players || []) : null;

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
                  <h2 className="text-2xl font-bold text-white">{game.team1}</h2>
                </div>
                <p className="text-4xl font-bold text-white">{game.team1Score}</p>
              </div>

              <div className="text-gray-400 text-2xl font-bold">VS</div>

              <div className="text-center">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{game.team2}</h2>
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
                {game.team1Score > game.team2Score ? `${game.team1} Win` : `${game.team2} Win`}
              </p>
            </div>
          </div>
        </div>

        {/* Player of the Game */}
        {game.playerOfTheGame && (
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
                <span className="text-3xl mr-3">🏆</span>
                Player of the Game
              </h3>
              <div className="flex items-center justify-center space-x-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                  game.playerOfTheGame.team === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {game.playerOfTheGame.playerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white">
                    {game.playerOfTheGame.playerId ? (
                      <Link href={`/players/${game.playerOfTheGame.playerId}`} className="hover:text-orange-400 transition-colors">
                        {game.playerOfTheGame.playerName}
                      </Link>
                    ) : (
                      game.playerOfTheGame.playerName
                    )}
                  </h4>
                  <p className="text-lg text-gray-300">{game.playerOfTheGame.team}</p>
                  <p className="text-orange-400 font-semibold">Game Score: {game.playerOfTheGame.score.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {(() => {
                    // Calculate points scored per quarter (data is stored as cumulative)
                    const q = game.quarters;
                    const q1t1 = q.q1?.team1 || 0;
                    const q1t2 = q.q1?.team2 || 0;
                    const q2t1 = (q.q2?.team1 || 0) - q1t1;
                    const q2t2 = (q.q2?.team2 || 0) - q1t2;
                    const q3t1 = (q.q3?.team1 || 0) - (q.q2?.team1 || 0);
                    const q3t2 = (q.q3?.team2 || 0) - (q.q2?.team2 || 0);
                    const q4t1 = (q.q4?.team1 || 0) - (q.q3?.team1 || 0);
                    const q4t2 = (q.q4?.team2 || 0) - (q.q3?.team2 || 0);
                    const q3Missing = q.q3?.team1 === 0 && q.q3?.team2 === 0;
                    
                    return (
                      <>
                        <tr className="border-b border-white/10">
                          <td className="text-white font-semibold py-3">{game.team1}</td>
                          <td className="text-center text-gray-300 py-3">{q1t1}</td>
                          <td className="text-center text-gray-300 py-3">{q2t1}</td>
                          <td className="text-center text-gray-300 py-3">{q3Missing ? '?' : q3t1}</td>
                          <td className="text-center text-gray-300 py-3">{q4t1}</td>
                          <td className="text-center text-white font-bold py-3">{game.team1Score}</td>
                        </tr>
                        <tr>
                          <td className="text-white font-semibold py-3">{game.team2}</td>
                          <td className="text-center text-gray-300 py-3">{q1t2}</td>
                          <td className="text-center text-gray-300 py-3">{q2t2}</td>
                          <td className="text-center text-gray-300 py-3">{q3Missing ? '?' : q3t2}</td>
                          <td className="text-center text-gray-300 py-3">{q4t2}</td>
                          <td className="text-center text-white font-bold py-3">{game.team2Score}</td>
                        </tr>
                      </>
                    );
                  })()}
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
            {game.team1}
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
                  <th className="text-center text-orange-400 font-semibold py-2">TOV</th>
                  <th className="text-center text-orange-400 font-semibold py-2">MIN</th>
                  <th className="text-center text-orange-400 font-semibold py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {game.team1Players.map((player: any) => (
                  <tr key={player.playerName || player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-2">
                      {player.playerId ? (
                        <Link href={`/players/${player.playerId}`} className="hover:text-orange-400 transition-colors">
                          {player.playerName || player.name}
                        </Link>
                      ) : (
                        player.playerName || player.name
                      )}
                    </td>
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
                    <td className="text-center text-gray-300 py-2">{formatStat(player.turnovers || 0)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.minutes)}</td>
                    <td className="text-center text-gray-300 py-2">{player.playerScore?.toFixed(1) || '-'}</td>
                  </tr>
                ))}
              </tbody>
              {team1Totals && (
                <tfoot>
                  <tr className="border-t-2 border-orange-400 bg-white/5 font-bold">
                    <td className="text-orange-400 py-3">TOTAL</td>
                    <td className="text-center text-white py-3">{team1Totals.points}</td>
                    <td className="text-center text-white py-3">{team1Totals.rebounds}</td>
                    <td className="text-center text-white py-3">{team1Totals.assists}</td>
                    <td className="text-center text-white py-3">{team1Totals.fgm}</td>
                    <td className="text-center text-white py-3">{team1Totals.fga}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team1Totals.fgPercentage)}</td>
                    <td className="text-center text-white py-3">{team1Totals.threePM}</td>
                    <td className="text-center text-white py-3">{team1Totals.threePA}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team1Totals.threePPercentage)}</td>
                    <td className="text-center text-white py-3">{team1Totals.ftm}</td>
                    <td className="text-center text-white py-3">{team1Totals.fta}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team1Totals.ftPercentage)}</td>
                    <td className="text-center text-white py-3">{team1Totals.steals}</td>
                    <td className="text-center text-white py-3">{team1Totals.blocks}</td>
                    <td className="text-center text-white py-3">{team1Totals.turnovers}</td>
                    <td className="text-center text-white py-3">{team1Totals.minutes}</td>
                    <td className="text-center text-white py-3">{team1Totals.playerScore.toFixed(1)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Los Sigmas Box Score */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm mr-3">
              🔥
            </div>
            {game.team2}
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
                  <th className="text-center text-orange-400 font-semibold py-2">TOV</th>
                  <th className="text-center text-orange-400 font-semibold py-2">MIN</th>
                  <th className="text-center text-orange-400 font-semibold py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {game.team2Players.map((player: any) => (
                  <tr key={player.playerName || player.name} className="border-b border-white/10">
                    <td className="text-white font-semibold py-2">
                      {player.playerId ? (
                        <Link href={`/players/${player.playerId}`} className="hover:text-orange-400 transition-colors">
                          {player.playerName || player.name}
                        </Link>
                      ) : (
                        player.playerName || player.name
                      )}
                    </td>
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
                    <td className="text-center text-gray-300 py-2">{formatStat(player.turnovers || 0)}</td>
                    <td className="text-center text-gray-300 py-2">{formatStat(player.minutes)}</td>
                    <td className="text-center text-gray-300 py-2">{player.playerScore?.toFixed(1) || '-'}</td>
                  </tr>
                ))}
              </tbody>
              {team2Totals && (
                <tfoot>
                  <tr className="border-t-2 border-orange-400 bg-white/5 font-bold">
                    <td className="text-orange-400 py-3">TOTAL</td>
                    <td className="text-center text-white py-3">{team2Totals.points}</td>
                    <td className="text-center text-white py-3">{team2Totals.rebounds}</td>
                    <td className="text-center text-white py-3">{team2Totals.assists}</td>
                    <td className="text-center text-white py-3">{team2Totals.fgm}</td>
                    <td className="text-center text-white py-3">{team2Totals.fga}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team2Totals.fgPercentage)}</td>
                    <td className="text-center text-white py-3">{team2Totals.threePM}</td>
                    <td className="text-center text-white py-3">{team2Totals.threePA}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team2Totals.threePPercentage)}</td>
                    <td className="text-center text-white py-3">{team2Totals.ftm}</td>
                    <td className="text-center text-white py-3">{team2Totals.fta}</td>
                    <td className="text-center text-white py-3">{formatPercentage(team2Totals.ftPercentage)}</td>
                    <td className="text-center text-white py-3">{team2Totals.steals}</td>
                    <td className="text-center text-white py-3">{team2Totals.blocks}</td>
                    <td className="text-center text-white py-3">{team2Totals.turnovers}</td>
                    <td className="text-center text-white py-3">{team2Totals.minutes}</td>
                    <td className="text-center text-white py-3">{team2Totals.playerScore.toFixed(1)}</td>
                  </tr>
                </tfoot>
              )}
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
