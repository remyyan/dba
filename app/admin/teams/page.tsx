"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllTeams, getAllPlayers, Player, Team, getFreeAgents, releasePlayer, signFreeAgent, addTradeActivity } from "@/lib/data";

interface Trade {
  id: string;
  fromTeam: string;
  toTeam: string;
  playersOffered: Player[];
  playersRequested: Player[];
  status: 'pending' | 'approved' | 'rejected';
  proposedBy: string;
  proposedAt: Date;
  notes?: string;
}

export default function AdminTeamsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState(getAllTeams());
  const [players, setPlayers] = useState(getAllPlayers());
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedFromTeam, setSelectedFromTeam] = useState<string>("");
  const [selectedToTeam, setSelectedToTeam] = useState<string>("");
  const [playersOffered, setPlayersOffered] = useState<Player[]>([]);
  const [playersRequested, setPlayersRequested] = useState<Player[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeNotes, setTradeNotes] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'history' | 'freeagents'>('overview');
  const [freeAgents, setFreeAgents] = useState(getFreeAgents());
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [playerToRelease, setPlayerToRelease] = useState<{player: Player, team: string} | null>(null);
  const [releaseReason, setReleaseReason] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleProposeTrade = () => {
    if (!selectedFromTeam || !selectedToTeam || playersOffered.length === 0 || playersRequested.length === 0) {
      alert('Please select teams and players for the trade');
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      fromTeam: selectedFromTeam,
      toTeam: selectedToTeam,
      playersOffered,
      playersRequested,
      status: 'pending',
      proposedBy: user.email || 'Admin',
      proposedAt: new Date(),
      notes: tradeNotes
    };

    setTrades([...trades, newTrade]);

    // Reset form
    setSelectedFromTeam("");
    setSelectedToTeam("");
    setPlayersOffered([]);
    setPlayersRequested([]);
    setTradeNotes("");
    setShowTradeModal(false);
  };

  const executeTrade = (trade: Trade) => {
    // Update player teams
    const updatedPlayers = players.map(player => {
      // Players going from fromTeam to toTeam
      if (trade.playersOffered.some(p => p.name === player.name)) {
        return { ...player, team: trade.toTeam };
      }
      // Players going from toTeam to fromTeam
      if (trade.playersRequested.some(p => p.name === player.name)) {
        return { ...player, team: trade.fromTeam };
      }
      return player;
    });

    // Update teams with new rosters
    const updatedTeams = teams.map(team => ({
      ...team,
      players: updatedPlayers.filter(p => p.team === team.name)
    }));

    setPlayers(updatedPlayers);
    setTeams(updatedTeams);

    // Update trade status
    setTrades(trades.map(t =>
      t.id === trade.id ? { ...t, status: 'approved' as const } : t
    ));

    // Add trade activity to feed
    addTradeActivity(trade.fromTeam, trade.toTeam, trade.playersOffered, trade.playersRequested);

    console.log('Trade executed:', trade);
  };

  const rejectTrade = (tradeId: string) => {
    setTrades(trades.map(t =>
      t.id === tradeId ? { ...t, status: 'rejected' as const } : t
    ));
  };

  const getAvailablePlayersForTeam = (teamName: string) => {
    return players.filter(p => p.team === teamName);
  };

  const pendingTrades = trades.filter(t => t.status === 'pending');
  const completedTrades = trades.filter(t => t.status !== 'pending');

  const handleReleasePlayer = (player: Player, team: string) => {
    setPlayerToRelease({ player, team });
    setShowReleaseModal(true);
  };

  const confirmReleasePlayer = () => {
    if (playerToRelease) {
      const success = releasePlayer(playerToRelease.player.name, playerToRelease.team, releaseReason);
      if (success) {
        // Refresh data
        setPlayers(getAllPlayers());
        setTeams(getAllTeams());
        setFreeAgents(getFreeAgents());
      }
    }
    setShowReleaseModal(false);
    setPlayerToRelease(null);
    setReleaseReason("");
  };

  const handleSignFreeAgent = (playerName: string, toTeam: string) => {
    const success = signFreeAgent(playerName, toTeam);
    if (success) {
      // Refresh data
      setPlayers(getAllPlayers());
      setTeams(getAllTeams());
      setFreeAgents(getFreeAgents());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-3xl font-bold text-white hover:text-orange-400 transition-colors">
                <span className="text-orange-400">DBA</span> Admin
              </Link>
              <span className="text-gray-300 text-sm">Team Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-white hover:text-orange-400 transition-colors"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
              <p className="text-xl text-gray-300">Manage team rosters, player transfers, and trade proposals</p>
            </div>
            <button
              onClick={() => setShowTradeModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🔄 Propose Trade
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'overview', label: 'Team Overview', icon: '🏀' },
              { id: 'trades', label: 'Active Trades', icon: '🔄' },
              { id: 'history', label: 'Trade History', icon: '📋' },
              { id: 'freeagents', label: 'Free Agents', icon: '🆓' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Team Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {teams.map((team) => (
                <div key={team.name} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                  <div className={`${team.color === 'red' ? 'bg-red-600/20' : 'bg-yellow-600/20'} p-6`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                        <p className="text-gray-300">
                          {team.wins}-{team.losses} ({team.winPercentage}% win rate)
                        </p>
                      </div>
                      <div className={`w-16 h-16 ${team.color === 'red' ? 'bg-red-600' : 'bg-yellow-600'} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">
                          {team.name === 'Los Sigmas' ? 'LS' : 'GD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Roster ({team.players.length} players)</h4>
                      <div className="text-sm text-gray-300">
                        Active: {team.players.filter(p => p.points > 0).length}
                      </div>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {team.players.map((player) => (
                        <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${player.points > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                              <div>
                                <p className="font-semibold text-white">{player.name}</p>
                                <p className="text-gray-300 text-sm">
                                  {player.points > 0
                                    ? `${player.points} PPG, ${player.rebounds} RPG, ${player.assists} APG`
                                    : 'No stats recorded'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                              Edit
                            </button>
                            <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors">
                              Trade
                            </button>
                            <button
                              onClick={() => handleReleasePlayer(player, team.name)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Release
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Team Stats Summary */}
                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                      <h5 className="text-white font-semibold mb-3">Team Statistics</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-300">Total Points:</span>
                          <span className="text-white font-semibold ml-2">
                            {team.players.reduce((sum, p) => sum + p.points, 0).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-300">Total Rebounds:</span>
                          <span className="text-white font-semibold ml-2">
                            {team.players.reduce((sum, p) => sum + p.rebounds, 0).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-300">Total Assists:</span>
                          <span className="text-white font-semibold ml-2">
                            {team.players.reduce((sum, p) => sum + p.assists, 0).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-300">Avg FG%:</span>
                          <span className="text-white font-semibold ml-2">
                            {team.players.length > 0
                              ? (team.players.reduce((sum, p) => sum + p.fieldGoalPercentage, 0) / team.players.length * 100).toFixed(1)
                              : '0.0'
                            }%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Trades Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-6">
              {pendingTrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Trades</h3>
                  <p className="text-gray-300 mb-6">There are currently no pending trade proposals.</p>
                  <button
                    onClick={() => setShowTradeModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Propose New Trade
                  </button>
                </div>
              ) : (
                pendingTrades.map((trade) => (
                  <div key={trade.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Trade Proposal</h3>
                        <p className="text-gray-300 text-sm">
                          Proposed by {trade.proposedBy} on {trade.proposedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => executeTrade(trade)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => rejectTrade(trade.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      {/* From Team */}
                      <div className="bg-blue-600/20 p-4 rounded-lg">
                        <h4 className="text-white font-bold mb-3">{trade.fromTeam} Sends:</h4>
                        <div className="space-y-2">
                          {trade.playersOffered.map((player) => (
                            <div key={player.name} className="bg-white/10 p-2 rounded text-sm">
                              <div className="text-white font-semibold">{player.name}</div>
                              <div className="text-gray-300 text-xs">
                                {player.points} PPG, {player.rebounds} RPG, {player.assists} APG
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trade Arrow */}
                      <div className="text-center">
                        <div className="text-4xl text-orange-400">⇄</div>
                        <p className="text-gray-300 text-sm mt-2">Trade</p>
                      </div>

                      {/* To Team */}
                      <div className="bg-green-600/20 p-4 rounded-lg">
                        <h4 className="text-white font-bold mb-3">{trade.toTeam} Sends:</h4>
                        <div className="space-y-2">
                          {trade.playersRequested.map((player) => (
                            <div key={player.name} className="bg-white/10 p-2 rounded text-sm">
                              <div className="text-white font-semibold">{player.name}</div>
                              <div className="text-gray-300 text-xs">
                                {player.points} PPG, {player.rebounds} RPG, {player.assists} APG
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {trade.notes && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <h5 className="text-white font-semibold text-sm mb-1">Notes:</h5>
                        <p className="text-gray-300 text-sm">{trade.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Trade History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {completedTrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Trade History</h3>
                  <p className="text-gray-300">No trades have been completed yet.</p>
                </div>
              ) : (
                completedTrades.map((trade) => (
                  <div key={trade.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {trade.status === 'approved' ? '✅ Completed Trade' : '❌ Rejected Trade'}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {trade.proposedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.status === 'approved'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      <div className="bg-blue-600/20 p-4 rounded-lg">
                        <h4 className="text-white font-bold mb-3">{trade.fromTeam}</h4>
                        <div className="space-y-2">
                          {trade.playersOffered.map((player) => (
                            <div key={player.name} className="text-sm text-gray-300">
                              {player.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl text-gray-400">⇄</div>
                      </div>

                      <div className="bg-green-600/20 p-4 rounded-lg">
                        <h4 className="text-white font-bold mb-3">{trade.toTeam}</h4>
                        <div className="space-y-2">
                          {trade.playersRequested.map((player) => (
                            <div key={player.name} className="text-sm text-gray-300">
                              {player.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Free Agents Tab */}
          {activeTab === 'freeagents' && (
            <div className="space-y-6">
              {freeAgents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🆓</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Free Agents</h3>
                  <p className="text-gray-300">All players are currently signed to teams.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Available Free Agents</h3>
                    <div className="text-sm text-gray-300">
                      {freeAgents.length} player{freeAgents.length !== 1 ? 's' : ''} available
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freeAgents.map((freeAgent) => (
                      <div key={freeAgent.player.name} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                        <div className="bg-gray-600/20 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xl font-bold text-white">{freeAgent.player.name}</h4>
                              <p className="text-gray-300 text-sm">
                                Released by {freeAgent.releasedBy}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">FA</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-4">
                            <div className="text-gray-300 text-sm mb-2">Player Stats:</div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-white font-bold">{freeAgent.player.points}</div>
                                <div className="text-gray-400">PPG</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">{freeAgent.player.rebounds}</div>
                                <div className="text-gray-400">RPG</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">{freeAgent.player.assists}</div>
                                <div className="text-gray-400">APG</div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4 p-3 bg-white/5 rounded-lg">
                            <div className="text-gray-300 text-xs mb-1">Release Info:</div>
                            <div className="text-white text-sm">
                              {freeAgent.releaseDate.toLocaleDateString()}
                            </div>
                            {freeAgent.reason && (
                              <div className="text-gray-400 text-xs mt-1">
                                Reason: {freeAgent.reason}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="text-gray-300 text-sm mb-2">Sign to team:</div>
                            {teams.filter(t => t.name !== "Free Agents").map((team) => (
                              <button
                                key={team.name}
                                onClick={() => handleSignFreeAgent(freeAgent.player.name, team.name)}
                                className={`w-full px-3 py-2 rounded text-sm font-semibold transition-colors ${
                                  team.name === 'Golden Dragons'
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                              >
                                Sign to {team.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Trade Proposal Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Propose Trade</h3>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Team Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">From Team</label>
                  <select
                    value={selectedFromTeam}
                    onChange={(e) => setSelectedFromTeam(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select team...</option>
                    {teams.map((team) => (
                      <option key={team.name} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">To Team</label>
                  <select
                    value={selectedToTeam}
                    onChange={(e) => setSelectedToTeam(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select team...</option>
                    {teams.filter(t => t.name !== selectedFromTeam).map((team) => (
                      <option key={team.name} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Player Selection */}
              {selectedFromTeam && selectedToTeam && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Players Offered */}
                  <div className="bg-blue-600/20 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-3">{selectedFromTeam} Offers:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {getAvailablePlayersForTeam(selectedFromTeam).map((player) => (
                        <div key={player.name} className="flex items-center space-x-3 p-2 bg-white/10 rounded">
                          <input
                            type="checkbox"
                            checked={playersOffered.some(p => p.name === player.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPlayersOffered([...playersOffered, player]);
                              } else {
                                setPlayersOffered(playersOffered.filter(p => p.name !== player.name));
                              }
                            }}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{player.name}</div>
                            <div className="text-gray-300 text-xs">
                              {player.points} PPG, {player.rebounds} RPG, {player.assists} APG
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Players Requested */}
                  <div className="bg-green-600/20 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-3">{selectedToTeam} Offers:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {getAvailablePlayersForTeam(selectedToTeam).map((player) => (
                        <div key={player.name} className="flex items-center space-x-3 p-2 bg-white/10 rounded">
                          <input
                            type="checkbox"
                            checked={playersRequested.some(p => p.name === player.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPlayersRequested([...playersRequested, player]);
                              } else {
                                setPlayersRequested(playersRequested.filter(p => p.name !== player.name));
                              }
                            }}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{player.name}</div>
                            <div className="text-gray-300 text-xs">
                              {player.points} PPG, {player.rebounds} RPG, {player.assists} APG
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Notes */}
              <div>
                <label className="block text-white font-semibold mb-2">Trade Notes (Optional)</label>
                <textarea
                  value={tradeNotes}
                  onChange={(e) => setTradeNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  rows={3}
                  placeholder="Add any notes about this trade..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProposeTrade}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={!selectedFromTeam || !selectedToTeam || playersOffered.length === 0 || playersRequested.length === 0}
                >
                  Propose Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Release Player Modal */}
      {showReleaseModal && playerToRelease && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">📤</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Release Player</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to release <span className="font-semibold text-white">{playerToRelease.player.name}</span> from {playerToRelease.team}?
              </p>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2 text-left">Reason (Optional)</label>
                <textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  rows={3}
                  placeholder="e.g., Salary cap, performance, team restructuring..."
                />
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReleasePlayer}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Release Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Denlow Basketball Association. Admin Panel.</p>
        </div>
      </footer>
    </div>
  );
}