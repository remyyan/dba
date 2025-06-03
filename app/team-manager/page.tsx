"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTeams, getAllPlayers, transferPlayer, addNewPlayer, createTradeProposal, getTradeProposals, respondToTradeProposal, cancelTradeProposal } from '@/lib/firebase-data';
import { addActivity } from '@/lib/activities';
import Navigation from '@/components/Navigation';

export default function TeamManagerPage() {
  const { user, isTeamManager, managedTeam, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'drop' | 'trade'>('add');

  // Form states
  const [selectedFreeAgent, setSelectedFreeAgent] = useState('');
  const [dropPlayer, setDropPlayer] = useState('');

  // Trade states
  const [tradeProposals, setTradeProposals] = useState<any[]>([]);
  const [myPlayers, setMyPlayers] = useState<string[]>([]);
  const [theirPlayers, setTheirPlayers] = useState<string[]>([]);
  const [otherTeamPlayers, setOtherTeamPlayers] = useState<any[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isTeamManager)) {
      router.push('/login');
    }
  }, [user, isTeamManager, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!managedTeam) return;

      try {
        const [teamsData, playersData] = await Promise.all([
          getAllTeams(),
          getAllPlayers()
        ]);

        setTeams(teamsData);
        setPlayers(playersData);

        // Filter players by team
        const teamPlayers = playersData.filter((p: any) => p.team === managedTeam);
        const freeAgentPlayers = playersData.filter((p: any) => p.team === 'Free Agent');

        // Get other team players for trading
        const otherTeam = managedTeam === 'Golden Dragons' ? 'Los Sigmas' : 'Golden Dragons';
        const otherTeamPlayersData = playersData.filter((p: any) => p.team === otherTeam);

        setCurrentTeamPlayers(teamPlayers);
        setFreeAgents(freeAgentPlayers);
        setOtherTeamPlayers(otherTeamPlayersData);

        // Load trade proposals
        const proposals = await getTradeProposals(managedTeam);
        setTradeProposals(proposals);
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage('Error loading data');
      } finally {
        setDataLoading(false);
      }
    };

    if (user && isTeamManager && managedTeam) {
      loadData();
    }
  }, [user, isTeamManager, managedTeam]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isTeamManager || !managedTeam) {
    return null;
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFreeAgent) {
      setMessage('Please select a player to sign.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Transfer the player from Free Agent to the team
      await transferPlayer(selectedFreeAgent, 'Free Agent', managedTeam);

      // Create activity
      await addActivity({
        type: 'signing',
        description: `${selectedFreeAgent} signed with ${managedTeam}`,
        playerName: selectedFreeAgent,
        fromTeam: 'Free Agent',
        toTeam: managedTeam,
        details: `Signed by team manager`
      });

      setMessage(`Successfully signed ${selectedFreeAgent} to ${managedTeam}!`);
      setSelectedFreeAgent('');

      // Reload data to reflect changes
      const playersData = await getAllPlayers();
      setPlayers(playersData);
      const teamPlayers = playersData.filter((p: any) => p.team === managedTeam);
      const freeAgentPlayers = playersData.filter((p: any) => p.team === 'Free Agent');
      setCurrentTeamPlayers(teamPlayers);
      setFreeAgents(freeAgentPlayers);
    } catch (error) {
      setMessage('Error signing player. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDropPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropPlayer) {
      setMessage('Please select a player to release.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Transfer the player from team to Free Agent
      await transferPlayer(dropPlayer, managedTeam, 'Free Agent');

      // Create activity
      await addActivity({
        type: 'drop',
        description: `${dropPlayer} dropped from ${managedTeam}`,
        playerName: dropPlayer,
        fromTeam: managedTeam,
        toTeam: 'Free Agent',
        details: `Released by team manager`
      });

      setMessage(`Successfully released ${dropPlayer} from ${managedTeam}!`);
      setDropPlayer('');

      // Reload data to reflect changes
      const playersData = await getAllPlayers();
      setPlayers(playersData);
      const teamPlayers = playersData.filter((p: any) => p.team === managedTeam);
      const freeAgentPlayers = playersData.filter((p: any) => p.team === 'Free Agent');
      setCurrentTeamPlayers(teamPlayers);
      setFreeAgents(freeAgentPlayers);
    } catch (error) {
      setMessage('Error releasing player. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myPlayers.length === 0 || theirPlayers.length === 0) {
      setMessage('Please select at least one player from each team.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const otherTeam = managedTeam === 'Golden Dragons' ? 'Los Sigmas' : 'Golden Dragons';
      
      // Create trade proposal
      await createTradeProposal({
        fromTeam: managedTeam,
        toTeam: otherTeam,
        fromPlayers: myPlayers,
        toPlayers: theirPlayers,
        proposedBy: user?.email || ''
      });

      // Create activity
      await addActivity({
        type: 'trade',
        description: `Trade proposal: ${myPlayers.join(', ')} for ${theirPlayers.join(', ')}`,
        playerName: myPlayers[0], // Use first player for activity
        fromTeam: managedTeam,
        toTeam: otherTeam,
        details: `Multi-player trade proposal created by team manager`
      });

      setMessage(`Trade proposal sent: ${myPlayers.join(', ')} for ${theirPlayers.join(', ')}`);
      setMyPlayers([]);
      setTheirPlayers([]);

      // Reload trade proposals
      const proposals = await getTradeProposals(managedTeam);
      setTradeProposals(proposals);
    } catch (error) {
      setMessage('Error creating trade proposal. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTradeResponse = async (proposalId: string, accept: boolean) => {
    setSubmitting(true);
    setMessage('');

    try {
      const proposal = tradeProposals.find(p => p.id === proposalId);
      if (!proposal) return;

      if (accept) {
        // Execute the trades for all players
        for (let i = 0; i < proposal.fromPlayers.length; i++) {
          await transferPlayer(proposal.fromPlayers[i], proposal.fromTeam, proposal.toTeam);
        }
        for (let i = 0; i < proposal.toPlayers.length; i++) {
          await transferPlayer(proposal.toPlayers[i], proposal.toTeam, proposal.fromTeam);
        }

        // Create activity for the trade
        await addActivity({
          type: 'trade',
          description: `Trade completed: ${proposal.fromPlayers.join(', ')} for ${proposal.toPlayers.join(', ')}`,
          playerName: proposal.fromPlayers[0], // Use first player for activity
          fromTeam: proposal.fromTeam,
          toTeam: proposal.toTeam,
          details: `Multi-player trade completed between teams`
        });
      }

      // Update proposal status
      await respondToTradeProposal(proposalId, accept ? 'accepted' : 'rejected', user?.email || '');

      // Reload data
      const [playersData, proposals] = await Promise.all([
        getAllPlayers(),
        getTradeProposals(managedTeam)
      ]);

      setPlayers(playersData);
      setTradeProposals(proposals);
      const teamPlayers = playersData.filter((p: any) => p.team === managedTeam);
      const otherTeam = managedTeam === 'Golden Dragons' ? 'Los Sigmas' : 'Golden Dragons';
      const otherTeamPlayersData = playersData.filter((p: any) => p.team === otherTeam);
      setCurrentTeamPlayers(teamPlayers);
      setOtherTeamPlayers(otherTeamPlayersData);

      setMessage(accept ? 'Trade completed successfully!' : 'Trade proposal rejected');
    } catch (error) {
      setMessage('Error processing trade. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTrade = async (proposalId: string) => {
    setSubmitting(true);
    setMessage('');

    try {
      await cancelTradeProposal(proposalId);
      const proposals = await getTradeProposals(managedTeam);
      setTradeProposals(proposals);
      setMessage('Trade proposal cancelled');
    } catch (error) {
      setMessage('Error cancelling trade proposal. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Team Manager Panel</h1>
          <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl ${
            managedTeam === 'Golden Dragons' ? 'bg-yellow-600/20 border border-yellow-400' : 'bg-red-600/20 border border-red-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              managedTeam === 'Golden Dragons' ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {managedTeam === 'Golden Dragons' ? '🐉' : '🔥'}
            </div>
            <span className="text-white font-bold text-xl">{managedTeam}</span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-500/20 border border-red-500/50 text-red-200'
              : 'bg-green-500/20 border border-green-500/50 text-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 justify-center">
          {[
            { key: 'add', label: 'Sign Free Agent', icon: '✍️' },
            { key: 'drop', label: 'Release Player', icon: '❌' },
            { key: 'trade', label: 'Trade Players', icon: '🔄' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-2xl mx-auto">
          {activeTab === 'add' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Sign Free Agent</h2>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Select Free Agent</label>
                  <select
                    value={selectedFreeAgent}
                    onChange={(e) => setSelectedFreeAgent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    required
                  >
                    <option value="">Choose a free agent...</option>
                    {freeAgents.map((player: any) => (
                      <option key={player.id} value={player.name}>
                        {player.name} ({player.points.toFixed(1)} PPG)
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-sm mt-2">
                    Player will be signed to {managedTeam}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !selectedFreeAgent}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Signing...' : 'Sign Player'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'drop' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Release Player</h2>
              <form onSubmit={handleDropPlayer} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Select Player to Release</label>
                  <select
                    value={dropPlayer}
                    onChange={(e) => setDropPlayer(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    required
                  >
                    <option value="">Select a player</option>
                    {currentTeamPlayers.map((player: any) => (
                      <option key={player.id} value={player.name}>
                        {player.name} ({player.points.toFixed(1)} PPG)
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-sm mt-2">
                    Player will become a free agent
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !dropPlayer}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Releasing...' : 'Release Player'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'trade' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Trade Players</h2>
              <form onSubmit={handleTrade} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Your Team's Players */}
                  <div>
                    <label className="block text-white font-medium mb-2">Your Players</label>
                    <div className="space-y-2">
                      {currentTeamPlayers.map((player: any) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`my-${player.id}`}
                            checked={myPlayers.includes(player.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMyPlayers([...myPlayers, player.name]);
                              } else {
                                setMyPlayers(myPlayers.filter(p => p !== player.name));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`my-${player.id}`} className="text-white">
                            {player.name} ({player.points.toFixed(1)} PPG)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Their Team's Players */}
                  <div>
                    <label className="block text-white font-medium mb-2">Their Players</label>
                    <div className="space-y-2">
                      {otherTeamPlayers.map((player: any) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`their-${player.id}`}
                            checked={theirPlayers.includes(player.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTheirPlayers([...theirPlayers, player.name]);
                              } else {
                                setTheirPlayers(theirPlayers.filter(p => p !== player.name));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`their-${player.id}`} className="text-white">
                            {player.name} ({player.points.toFixed(1)} PPG)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || myPlayers.length === 0 || theirPlayers.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Creating Trade...' : 'Propose Trade'}
                </button>
              </form>

              {/* Trade Proposals */}
              {tradeProposals.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Trade Proposals</h3>
                  <div className="space-y-4">
                    {tradeProposals.map((proposal) => (
                      <div key={proposal.id} className="bg-black/20 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white">
                            <div className="font-medium">{proposal.fromPlayers.join(', ')}</div>
                            <div className="text-gray-400 text-sm">from {proposal.fromTeam}</div>
                            <div className="mx-2 my-1">↔️</div>
                            <div className="font-medium">{proposal.toPlayers.join(', ')}</div>
                            <div className="text-gray-400 text-sm">from {proposal.toTeam}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            proposal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            proposal.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </span>
                        </div>
                        {proposal.status === 'pending' && (
                          <div className="flex space-x-2 mt-2">
                            {proposal.fromTeam === managedTeam ? (
                              <button
                                onClick={() => handleCancelTrade(proposal.id)}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-sm"
                              >
                                Cancel
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleTradeResponse(proposal.id, true)}
                                  className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded text-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleTradeResponse(proposal.id, false)}
                                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Roster */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className={`text-xl font-bold mb-4 ${
              managedTeam === 'Golden Dragons' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              Current {managedTeam} Roster
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {currentTeamPlayers.length > 0 ? (
                currentTeamPlayers.map((player: any) => (
                  <div key={player.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-white font-medium">{player.name}</span>
                    <div className="text-right">
                      <span className="text-gray-400">{player.points.toFixed(1)} PPG</span>
                      <div className="text-xs text-gray-500">
                        {player.rebounds.toFixed(1)} REB • {player.assists.toFixed(1)} AST
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-400 py-8">
                  No players on the roster yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Free Agents */}
        {activeTab === 'add' && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Available Free Agents ({freeAgents.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {freeAgents.length > 0 ? (
                  freeAgents.map((player: any) => (
                    <div key={player.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white font-medium">{player.name}</span>
                      <div className="text-right">
                        <span className="text-gray-400">{player.points.toFixed(1)} PPG</span>
                        <div className="text-xs text-gray-500">
                          {player.rebounds.toFixed(1)} REB • {player.assists.toFixed(1)} AST
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-400 py-8">
                    No free agents available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
