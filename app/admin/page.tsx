"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTeams, getAllPlayers, addNewPlayer, updatePlayer, transferPlayer, cleanupQuarterPlayers, cleanupDuplicateTeams, updateTeamRecords, recalculatePlayerAveragesFromGames, updateGamesWithSeason, CURRENT_SEASON, ALL_SEASONS } from '@/lib/firebase-data';
import { addActivity } from '@/lib/activities';
import { importGameFromCSV } from '@/lib/csv-importer';
import Navigation from '@/components/Navigation';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'trade' | 'drop' | 'csv'>('csv');

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('Golden Dragons');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [newPlayerHeight, setNewPlayerHeight] = useState('');
  const [newPlayerWeight, setNewPlayerWeight] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [newPlayerJerseyNumber, setNewPlayerJerseyNumber] = useState('');
  // Edit player states
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerTeam, setEditPlayerTeam] = useState('');
  const [editPlayerPosition, setEditPlayerPosition] = useState('');
  const [editPlayerHeight, setEditPlayerHeight] = useState('');
  const [editPlayerWeight, setEditPlayerWeight] = useState('');
  const [editPlayerAge, setEditPlayerAge] = useState('');
  const [editPlayerJerseyNumber, setEditPlayerJerseyNumber] = useState('');
  const [tradePlayer, setTradePlayer] = useState('');
  const [tradeFromTeam, setTradeFromTeam] = useState('');
  const [tradeToTeam, setTradeToTeam] = useState('');
  const [dropPlayer, setDropPlayer] = useState('');
  const [dropFromTeam, setDropFromTeam] = useState('');

  // CSV Import states
  const [, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Load data function
  const loadData = async () => {
    try {
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
      console.log('Admin data refreshed:', {
        teams: teamsData.length,
        players: playersData.length,
        playersByTeam: {
          'Golden Dragons': playersData.filter(p => p.team === 'Golden Dragons').length,
          'Los Sigmas': playersData.filter(p => p.team === 'Los Sigmas').length,
          'Free Agent': playersData.filter(p => p.team === 'Free Agent').length
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data from Firebase');
    }
  };

  // Load data on component mount
  useEffect(() => {
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
        position: newPlayerPosition || undefined,
        height: newPlayerHeight || undefined,
        weight: newPlayerWeight ? parseInt(newPlayerWeight) : undefined,
        age: newPlayerAge ? parseInt(newPlayerAge) : undefined,
        jerseyNumber: newPlayerJerseyNumber ? parseInt(newPlayerJerseyNumber) : undefined,
        gamesPlayed: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
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
      setNewPlayerTeam('Golden Dragons');
      setNewPlayerPosition('');
      setNewPlayerHeight('');
      setNewPlayerWeight('');
      setNewPlayerAge('');
      setNewPlayerJerseyNumber('');

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

  const handleSelectPlayerForEdit = (player: any) => {
    setSelectedPlayer(player);
    setEditPlayerName(player.name);
    setEditPlayerTeam(player.team);
    setEditPlayerPosition(player.position || '');
    setEditPlayerHeight(player.height || '');
    setEditPlayerWeight(player.weight ? player.weight.toString() : '');
    setEditPlayerAge(player.age ? player.age.toString() : '');
    setEditPlayerJerseyNumber(player.jerseyNumber ? player.jerseyNumber.toString() : '');
  };

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    setSubmitting(true);
    setMessage('');

    try {
      // Update the player in Firebase
      await updatePlayer(selectedPlayer.id, {
        name: editPlayerName,
        team: editPlayerTeam,
        position: editPlayerPosition || undefined,
        height: editPlayerHeight || undefined,
        weight: editPlayerWeight ? parseInt(editPlayerWeight) : undefined,
        age: editPlayerAge ? parseInt(editPlayerAge) : undefined,
        jerseyNumber: editPlayerJerseyNumber ? parseInt(editPlayerJerseyNumber) : undefined,
      });

      // Create activity
      await addActivity({
        type: 'transfer',
        description: `${editPlayerName} profile updated by admin`,
        playerName: editPlayerName,
        details: `Player details updated`
      });

      setMessage(`Successfully updated ${editPlayerName}!`);
      setSelectedPlayer(null);
      setEditPlayerName('');
      setEditPlayerTeam('');
      setEditPlayerPosition('');
      setEditPlayerHeight('');
      setEditPlayerWeight('');
      setEditPlayerAge('');
      setEditPlayerJerseyNumber('');

      // Reload data to reflect changes
      const [teamsData, playersData] = await Promise.all([
        getAllTeams(),
        getAllPlayers()
      ]);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setMessage('Error updating player. Please try again.');
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
      const gameId = await importGameFromCSV(csvContent, user?.email || 'admin', selectedSeason);
      setMessage(`Successfully imported game for ${selectedSeason}! Game ID: ${gameId}`);
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
      await loadData();
    } catch (error) {
      setMessage('Error cleaning up quarter players.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      await cleanupDuplicateTeams();
      setMessage('Successfully removed duplicate teams from database!');

      // Reload data
      await loadData();
    } catch (error) {
      setMessage('Error cleaning up duplicate teams.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecalculateRecords = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      await updateTeamRecords(selectedSeason);
      setMessage(`Successfully recalculated team records for ${selectedSeason}!`);

      // Reload data
      await loadData();
    } catch (error) {
      setMessage('Error recalculating team records.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecalculatePlayerAverages = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      const result = await recalculatePlayerAveragesFromGames(selectedSeason);
      setMessage(`Successfully recalculated player averages for ${selectedSeason}! Updated ${result.playersUpdated}/${result.playersTotal} players.`);

      // Reload data
      await loadData();
    } catch (error) {
      setMessage('Error recalculating player averages.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMigrateGamesToSeason = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      const result = await updateGamesWithSeason(selectedSeason, { onlyMissingSeason: true });
      setMessage(`Successfully tagged ${result.gamesUpdated}/${result.gamesTotal} games with season ${selectedSeason}!`);

      // Reload data
      await loadData();
    } catch (error) {
      setMessage('Error migrating games to season.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">DBA Admin Panel</h1>
          <button
            onClick={loadData}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🔄 Refresh Data
          </button>
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
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {[
            { key: 'csv', label: 'Import CSV Game', icon: '📊' },
            { key: 'add', label: 'Add Player', icon: '➕' },
            { key: 'edit', label: 'Edit Player', icon: '✏️' },
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
                    <li>• Player stats should include: Points, Rebounds, Assists, FGM, FGA, 3PM, 3PA, FTM, FTA, STL, BLK, MIN, TOV</li>
                    <li>• Turnovers (TOV) should be in the last column for the 2026-2027 season</li>
                    <li>• System will auto-calculate averages, efficiency, and player scores</li>
                    <li>• Player of the Game will be automatically determined</li>
                  </ul>
                </div>

                <form onSubmit={handleCSVImport} className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Season</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                      {ALL_SEASONS.map((season) => (
                        <option key={season} value={season} className="bg-slate-800">
                          {season}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    Remove incorrectly imported data and duplicates
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleCleanupQuarters}
                      disabled={submitting}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {submitting ? 'Cleaning...' : 'Remove Quarter "Players"'}
                    </button>
                    <button
                      onClick={handleCleanupDuplicates}
                      disabled={submitting}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {submitting ? 'Cleaning...' : 'Remove Duplicate Teams'}
                    </button>
                    <button
                      onClick={handleRecalculateRecords}
                      disabled={submitting}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {submitting ? 'Calculating...' : `Recalculate Team Records (${selectedSeason})`}
                    </button>
                    <button
                      onClick={handleRecalculatePlayerAverages}
                      disabled={submitting}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {submitting ? 'Calculating...' : `Recalculate Player Averages (${selectedSeason})`}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Data Migration</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Tag existing games with a season (only updates games without a season field)
                  </p>
                  <button
                    onClick={handleMigrateGamesToSeason}
                    disabled={submitting}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {submitting ? 'Migrating...' : `Tag Untagged Games as ${selectedSeason}`}
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

                {/* Additional Player Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Position</label>
                    <select
                      value={newPlayerPosition}
                      onChange={(e) => setNewPlayerPosition(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                      <option value="">Select position</option>
                      <option value="G">Guard (G)</option>
                      <option value="F">Forward (F)</option>
                      <option value="C">Center (C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Jersey Number</label>
                    <input
                      type="number"
                      value={newPlayerJerseyNumber}
                      onChange={(e) => setNewPlayerJerseyNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      placeholder="e.g., 23"
                      min="0"
                      max="99"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Height</label>
                    <input
                      type="text"
                      value={newPlayerHeight}
                      onChange={(e) => setNewPlayerHeight(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      placeholder="e.g., 6'2&quot;"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Weight (lbs)</label>
                    <input
                      type="number"
                      value={newPlayerWeight}
                      onChange={(e) => setNewPlayerWeight(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      placeholder="e.g., 180"
                      min="100"
                      max="400"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Age</label>
                    <input
                      type="number"
                      value={newPlayerAge}
                      onChange={(e) => setNewPlayerAge(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      placeholder="e.g., 25"
                      min="16"
                      max="50"
                    />
                  </div>
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

          {activeTab === 'edit' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Edit Player</h2>

              {!selectedPlayer ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Select a Player to Edit</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player: any) => (
                      <div
                        key={player.id}
                        onClick={() => handleSelectPlayerForEdit(player)}
                        className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{player.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            player.team === 'Golden Dragons' ? 'bg-yellow-600 text-white' :
                            player.team === 'Los Sigmas' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {player.team}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          <div>Position: {player.position || 'N/A'}</div>
                          <div>PPG: {(player.points || 0).toFixed(1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Editing: {selectedPlayer.name}</h3>
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ← Back to Player List
                    </button>
                  </div>

                  <form onSubmit={handleEditPlayer} className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Player Name</label>
                      <input
                        type="text"
                        value={editPlayerName}
                        onChange={(e) => setEditPlayerName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                        placeholder="Enter player name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Team</label>
                      <select
                        value={editPlayerTeam}
                        onChange={(e) => setEditPlayerTeam(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="Golden Dragons">Golden Dragons</option>
                        <option value="Los Sigmas">Los Sigmas</option>
                        <option value="Free Agent">Free Agent</option>
                      </select>
                    </div>

                    {/* Additional Player Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Position</label>
                        <select
                          value={editPlayerPosition}
                          onChange={(e) => setEditPlayerPosition(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                        >
                          <option value="">Select position</option>
                          <option value="G">Guard (G)</option>
                          <option value="F">Forward (F)</option>
                          <option value="C">Center (C)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Jersey Number</label>
                        <input
                          type="number"
                          value={editPlayerJerseyNumber}
                          onChange={(e) => setEditPlayerJerseyNumber(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                          placeholder="e.g., 23"
                          min="0"
                          max="99"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Height</label>
                        <input
                          type="text"
                          value={editPlayerHeight}
                          onChange={(e) => setEditPlayerHeight(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                          placeholder="e.g., 6'2&quot;"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Weight (lbs)</label>
                        <input
                          type="number"
                          value={editPlayerWeight}
                          onChange={(e) => setEditPlayerWeight(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                          placeholder="e.g., 180"
                          min="100"
                          max="400"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Age</label>
                        <input
                          type="number"
                          value={editPlayerAge}
                          onChange={(e) => setEditPlayerAge(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                          placeholder="e.g., 25"
                          min="16"
                          max="50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                      >
                        {submitting ? 'Updating...' : 'Update Player'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlayer(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
            const teamPlayers = players.filter((player: any) => player.team === teamName);
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
                      <div key={player.id || player.name} className="flex justify-between items-center text-white">
                        <span>{player.name}</span>
                        <span className="text-gray-400">{(player.points || 0).toFixed(1)} PPG</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No players found for {teamName}</p>
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
