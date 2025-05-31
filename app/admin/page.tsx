"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTeams, getAllPlayers, addNewPlayer, transferPlayer, cleanupQuarterPlayers } from '@/lib/firebase-data';
import { addActivity } from '@/lib/activities';
import { importGameFromCSV } from '@/lib/csv-importer';
import Navigation from '@/components/Navigation';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'trade' | 'drop' | 'csv'>('csv');

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('Golden Dragons');
  const [tradePlayer, setTradePlayer] = useState('');
  const [tradeFromTeam, setTradeFromTeam] = useState('');
  const [tradeToTeam, setTradeToTeam] = useState('');
  const [dropPlayer, setDropPlayer] = useState('');
  const [dropFromTeam, setDropFromTeam] = useState('');

  // CSV Import states
  const [, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, playersData] = await Promise.all([
          getAllTeams(),
          getAllPlayers()
        ]);
        setTeams(teamsData);
        setPlayers(playersData);
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage('Error loading data from Firebase');
      }
    };

    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

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

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Create the player in Firebase
      const playerId = await addNewPlayer({
        name: newPlayerName,
        team: newPlayerTeam,
        gamesPlayed: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        minutes: 0,
        fgm: 0,
        fga: 0,
        fgPercentage: 0,
        threePM: 0,
        threePA: 0,
        threePPercentage: 0,
        ftm: 0,
        fta: 0,
        ftPercentage: 0,
        efficiency: 0,
        playerScore: 0
      });

      // Create activity
      await addActivity({
        type: 'signing',
        description: `${newPlayerName} signed with ${newPlayerTeam}`,
        playerName: newPlayerName,
        toTeam: newPlayerTeam,
        details: `Added by admin`
      });

      setMessage(`Successfully added ${newPlayerName} to ${newPlayerTeam}! Player ID: ${playerId}`);
      setNewPlayerName('');

      // Reload data to reflect changes
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error adding player. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTradePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Transfer the player
      await transferPlayer(tradePlayer, tradeFromTeam, tradeToTeam);

      // Create activity
      await addActivity({
        type: 'trade',
        description: `${tradePlayer} traded from ${tradeFromTeam} to ${tradeToTeam}`,
        playerName: tradePlayer,
        fromTeam: tradeFromTeam,
        toTeam: tradeToTeam,
        details: `Traded by admin`
      });

      setMessage(`Successfully traded ${tradePlayer} from ${tradeFromTeam} to ${tradeToTeam}!`);
      setTradePlayer('');
      setTradeFromTeam('');
      setTradeToTeam('');

      // Reload data to reflect changes
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error processing trade. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDropPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Transfer player to Free Agent
      await transferPlayer(dropPlayer, dropFromTeam, 'Free Agent');

      // Create activity
      await addActivity({
        type: 'drop',
        description: `${dropPlayer} dropped from ${dropFromTeam}`,
        playerName: dropPlayer,
        fromTeam: dropFromTeam,
        toTeam: 'Free Agent',
        details: `Released by admin`
      });

      setMessage(`Successfully dropped ${dropPlayer} from ${dropFromTeam}!`);
      setDropPlayer('');
      setDropFromTeam('');

      // Reload data to reflect changes
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error dropping player. Please try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) {
      setMessage('Please select a CSV file first.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const gameId = await importGameFromCSV(csvContent, user?.email || 'admin');
      setMessage(`Successfully imported game! Game ID: ${gameId}`);
      setCsvContent('');
      setCsvFile(null);

      // Reload data
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error importing CSV. Please check the file format and try again.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCleanupQuarters = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      await cleanupQuarterPlayers();
      setMessage('Successfully removed quarter "players" from database!');

      // Reload data
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error cleaning up quarter players.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">DBA Admin Panel</h1>

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
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {[
            { key: 'csv', label: 'Import CSV Game', icon: '📊' },
            { key: 'add', label: 'Add Player', icon: '➕' },
            { key: 'trade', label: 'Trade Player', icon: '🔄' },
            { key: 'drop', label: 'Drop Player', icon: '❌' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {activeTab === 'csv' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Import Game from CSV</h2>
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-blue-300 font-semibold mb-2">CSV Format Requirements:</h3>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Use the same format as your existing Game1.csv, Game2.csv, Game3.csv files</li>
                    <li>• Player stats should include: Points, Rebounds, Assists, FGM, FGA, 3PM, 3PA, FTM, FTA, STL, BLK, MIN</li>
                    <li>• System will auto-calculate averages, efficiency, and player scores</li>
                    <li>• Player of the Game will be automatically determined</li>
                  </ul>
                </div>

                <form onSubmit={handleCSVImport} className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Select CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                      required
                    />
                  </div>

                  {csvContent && (
                    <div>
                      <label className="block text-white font-medium mb-2">CSV Preview</label>
                      <textarea
                        value={csvContent.slice(0, 500) + (csvContent.length > 500 ? '...' : '')}
                        readOnly
                        className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 text-sm"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !csvContent}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {submitting ? 'Importing Game...' : 'Import Game'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Database Cleanup</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Remove incorrectly imported quarter data that was treated as players
                  </p>
                  <button
                    onClick={handleCleanupQuarters}
                    disabled={submitting}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {submitting ? 'Cleaning...' : 'Remove Quarter "Players"'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Add New Player</h2>
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Player Name</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Team</label>
                  <select
                    value={newPlayerTeam}
                    onChange={(e) => setNewPlayerTeam(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                  >
                    <option value="Golden Dragons">Golden Dragons</option>
                    <option value="Los Sigmas">Los Sigmas</option>
                    <option value="Free Agent">Free Agent</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Player'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'trade' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Trade Player</h2>
              <form onSubmit={handleTradePlayer} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Player Name</label>
                  <input
                    type="text"
                    value={tradePlayer}
                    onChange={(e) => setTradePlayer(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">From Team</label>
                    <select
                      value={tradeFromTeam}
                      onChange={(e) => setTradeFromTeam(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      required
                    >
                      <option value="">Select team</option>
                      <option value="Golden Dragons">Golden Dragons</option>
                      <option value="Los Sigmas">Los Sigmas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">To Team</label>
                    <select
                      value={tradeToTeam}
                      onChange={(e) => setTradeToTeam(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      required
                    >
                      <option value="">Select team</option>
                      <option value="Golden Dragons">Golden Dragons</option>
                      <option value="Los Sigmas">Los Sigmas</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Processing...' : 'Process Trade'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'drop' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Drop Player</h2>
              <form onSubmit={handleDropPlayer} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Player Name</label>
                  <input
                    type="text"
                    value={dropPlayer}
                    onChange={(e) => setDropPlayer(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">From Team</label>
                  <select
                    value={dropFromTeam}
                    onChange={(e) => setDropFromTeam(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    required
                  >
                    <option value="">Select team</option>
                    <option value="Golden Dragons">Golden Dragons</option>
                    <option value="Los Sigmas">Los Sigmas</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitting ? 'Dropping...' : 'Drop Player'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Current Rosters */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {['Golden Dragons', 'Los Sigmas'].map((teamName) => {
            const teamPlayers = players.filter((player: any) => player.team === teamName && player.points > 0);
            return (
              <div key={teamName} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className={`text-xl font-bold mb-4 ${
                  teamName === 'Golden Dragons' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {teamName} Roster ({teamPlayers.length} players)
                </h3>
                <div className="space-y-2">
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map((player: any) => (
                      <div key={player.name} className="flex justify-between items-center text-white">
                        <span>{player.name}</span>
                        <span className="text-gray-400">{player.points.toFixed(1)} PPG</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No players found</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
