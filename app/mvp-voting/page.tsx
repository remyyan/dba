"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllPlayers } from "@/lib/data";
import { mvpVotingService } from "@/lib/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export default function MVPVotingPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState(getAllPlayers().filter(p => p.points > 0));
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVotingData();
  }, [user]);

  const loadVotingData = async () => {
    try {
      // Load vote counts
      const counts = await mvpVotingService.getVoteCounts();
      setVoteCounts(counts);

      // Check if current user has voted
      if (user?.email) {
        const userHasVoted = await mvpVotingService.hasUserVoted(user.email);
        setHasVoted(userHasVoted);
        if (userHasVoted) {
          setShowResults(true);
        }
      } else {
        // For non-logged in users, check localStorage
        const voted = localStorage.getItem('dba-mvp-voted');
        if (voted) {
          setHasVoted(true);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedPlayer || hasVoted || loading) return;

    setLoading(true);
    try {
      let success = false;

      if (user?.email) {
        // Authenticated user - use Firebase
        success = await mvpVotingService.vote(selectedPlayer, user.email);
      } else {
        // Non-authenticated user - use localStorage (less secure but allows public voting)
        const voted = localStorage.getItem('dba-mvp-voted');
        if (!voted) {
          localStorage.setItem('dba-mvp-voted', 'true');
          localStorage.setItem('dba-mvp-vote-for', selectedPlayer);
          success = true;
        }
      }

      if (success) {
        setHasVoted(true);
        setShowResults(true);
        // Reload vote counts
        await loadVotingData();
      } else {
        alert('You have already voted or there was an error processing your vote.');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('There was an error processing your vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  // Create leaderboard from vote counts
  const leaderboard = players
    .map(player => ({
      ...player,
      votes: voteCounts[player.name] || 0
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">MVP Voting</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cast your vote for the Most Valuable Player of the DBA season. Your voice matters!
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Voting Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h2>

            {!hasVoted ? (
              <div className="space-y-6">
                <p className="text-gray-300">Select the player you believe deserves the MVP award:</p>

                <div className="space-y-3">
                  {players.map((player) => (
                    <label key={player.name} className="flex items-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="mvp-vote"
                        value={player.name}
                        checked={selectedPlayer === player.name}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="mr-4 w-4 h-4 text-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{player.name}</p>
                            <p className="text-gray-300 text-sm">{player.team}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">{player.points} PPG</p>
                            <p className="text-gray-300 text-sm">{player.rebounds} RPG, {player.assists} APG</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={!selectedPlayer || loading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    selectedPlayer && !loading
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Vote'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Vote Submitted!</h3>
                <p className="text-gray-300">Thank you for participating in MVP voting.</p>
                <p className="text-gray-300 text-sm mt-2">
                  You voted for: <span className="text-orange-400 font-semibold">{localStorage.getItem('dba-mvp-vote-for')}</span>
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Live Results</h2>
              {!showResults && (
                <button
                  onClick={() => setShowResults(true)}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  Show Results
                </button>
              )}
            </div>

            {showResults ? (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Total Votes: {totalVotes}</p>

                {leaderboard.map((player, index) => {
                  const votes = player.votes || 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                  return (
                    <div key={player.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{player.name}</p>
                            <p className="text-gray-300 text-sm">{player.team}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{votes} votes</p>
                          <p className="text-gray-300 text-sm">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {totalVotes === 0 && (
                  <p className="text-gray-400 text-center py-8">No votes yet. Be the first to vote!</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300">Vote to see live results!</p>
              </div>
            )}
          </div>
        </div>

        {/* MVP Criteria */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">MVP Criteria</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Statistical Excellence</h3>
              <p className="text-gray-300 text-sm">Outstanding individual performance across key statistical categories</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Team Impact</h3>
              <p className="text-gray-300 text-sm">Significant contribution to team success and overall performance</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Consistency</h3>
              <p className="text-gray-300 text-sm">Reliable performance throughout the season in crucial moments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
