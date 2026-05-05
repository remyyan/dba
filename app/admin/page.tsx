"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTeams, getAllPlayers, addNewPlayer, updatePlayer, transferPlayer, cleanupQuarterPlayers, cleanupDuplicateTeams, updateTeamRecords, recalculatePlayerAveragesFromGames, updateGamesWithSeason, updateGameLiveStreamUrl, CURRENT_SEASON, ALL_SEASONS, saveGameShotData, loadGameShotData, ShotEntry, HighlightEntry } from '@/lib/firebase-data';
import { addActivity } from '@/lib/activities';
import { importGameFromCSV } from '@/lib/csv-importer';
import Navigation from '@/components/Navigation';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'trade' | 'drop' | 'csv' | 'shots'>('csv');

  // Shot Entry states
  const [gameNumber, setGameNumber] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [shots, setShots] = useState<Array<{
    x: number;
    y: number;
    made: boolean;
    type: '2P' | '3P' | 'FT';
    timestamp: string;
    playerId: string;
    distanceFt: number;
  }>>([]);
  const [highlights, setHighlights] = useState<Array<{timestamp: string, playerId: string, type: string, description: string}>>([]);
  const [nextShotType, setNextShotType] = useState<'2P' | '3P' | 'FT'>('2P');
  const [nextShotMade, setNextShotMade] = useState(true);
  const [nextShotQuarter, setNextShotQuarter] = useState('Q1');
  const [nextShotTime, setNextShotTime] = useState('');
  const [nextShotPlayerId, setNextShotPlayerId] = useState('');
  const [nextShotPlayerSearch, setNextShotPlayerSearch] = useState('');
  const [highlightQuarter, setHighlightQuarter] = useState('Q1');
  const [highlightTime, setHighlightTime] = useState('');
  const [highlightPlayerId, setHighlightPlayerId] = useState('');
  const [highlightPlayerSearch, setHighlightPlayerSearch] = useState('');
  const [highlightType, setHighlightType] = useState('made-shot');
  const [highlightDescription, setHighlightDescription] = useState('');

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

  // Auto-save to Firestore whenever shots/highlights change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!gameNumber || (shots.length === 0 && highlights.length === 0)) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveGameShotData(parseInt(gameNumber), selectedSeason, youtubeUrl, shots as ShotEntry[], highlights as HighlightEntry[])
        .catch(err => console.error('Auto-save failed:', err));
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [shots, highlights, gameNumber, selectedSeason, youtubeUrl]);

  // Auto-load when a valid game number is typed
  const loadedGameRef = useRef('');
  useEffect(() => {
    const num = parseInt(gameNumber);
    if (!gameNumber || isNaN(num) || loadedGameRef.current === `${selectedSeason}_${gameNumber}`) return;
    loadedGameRef.current = `${selectedSeason}_${gameNumber}`;
    loadGameShotData(num, selectedSeason).then(data => {
      if (data) {
        setShots(data.shots);
        setHighlights(data.highlights);
        if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
        setMessage(`📂 Loaded ${data.shots.length} shots and ${data.highlights.length} highlights for Game ${gameNumber}`);
      }
    }).catch(err => console.error('Auto-load failed:', err));
  }, [gameNumber, selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
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

  const calculateShotDistanceFeet = (xPct: number, yPct: number) => {
    // Court SVG uses 500x470 with playable area ~450px tall (10..460) ~= 47ft half court.
    const shotX = (xPct / 100) * 500;
    const shotY = (yPct / 100) * 470;
    const hoopX = 250;
    const hoopY = 35;
    const feetPerPixel = 47 / 450;
    const distancePx = Math.sqrt((shotX - hoopX) ** 2 + (shotY - hoopY) ** 2);
    return Math.round(distancePx * feetPerPixel * 10) / 10;
  };

  const handleAddFreeThrow = (made: boolean) => {
    const newShot = {
      x: 50, y: 57, // fixed FT line position (~15ft, center)
      made,
      type: 'FT' as const,
      timestamp: nextShotTime.trim() ? `${nextShotQuarter} ${nextShotTime.trim()}` : nextShotQuarter,
      playerId: nextShotPlayerId.trim(),
      distanceFt: 15
    };
    setShots(prev => [...prev, newShot]);
  };

  const handleCourtClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const distanceFt = calculateShotDistanceFeet(x, y);
    const newShot = {
      x,
      y,
      made: nextShotMade,
      type: nextShotType,
      timestamp: nextShotTime.trim() ? `${nextShotQuarter} ${nextShotTime.trim()}` : nextShotQuarter,
      playerId: nextShotPlayerId.trim(),
      distanceFt
    };
    setShots([...shots, newShot]);
  };

  const handleAddHighlight = () => {
    if (!highlightPlayerId || !highlightDescription) {
      setMessage('Please fill in all highlight fields');
      return;
    }

    const newHighlight = {
      timestamp: highlightTime.trim() ? `${highlightQuarter} ${highlightTime.trim()}` : highlightQuarter,
      playerId: highlightPlayerId,
      type: highlightType,
      description: highlightDescription
    };

    setHighlights([...highlights, newHighlight]);
    setHighlightTime('');
    setHighlightPlayerId('');
    setHighlightPlayerSearch('');
    setHighlightDescription('');
  };

  const handleExportData = () => {
    if (!gameNumber) {
      setMessage('Please enter a game number');
      return;
    }

    // Export shots CSV
    const shotsCSV = ['gameNumber,season,timestamp,playerId,shotX,shotY,made,type,distanceFt'];
    shots.forEach((shot, idx) => {
      shotsCSV.push(
        `${gameNumber},${selectedSeason},"${shot.timestamp || ''}","${shot.playerId || `Player${idx + 1}`}",${shot.x},${shot.y},${shot.made ? 'Yes' : 'No'},${shot.type},${shot.distanceFt}`
      );
    });

    // Export highlights CSV
    const highlightsCSV = ['gameNumber,timestamp,playerId,type,description'];
    highlights.forEach((highlight) => {
      highlightsCSV.push(`${gameNumber},"${highlight.timestamp}","${highlight.playerId}","${highlight.type}","${highlight.description}"`);
    });

    // Download shots
    const shotsLink = document.createElement('a');
    shotsLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(shotsCSV.join('\n'));
    shotsLink.download = `Game${gameNumber}_${selectedSeason}_shots.csv`;
    shotsLink.click();

    // Download highlights
    const highlightsLink = document.createElement('a');
    highlightsLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(highlightsCSV.join('\n'));
    highlightsLink.download = `Game${gameNumber}_${selectedSeason}_highlights.csv`;
    highlightsLink.click();

    setMessage(`✅ Exported ${shots.length} shots and ${highlights.length} highlights for Game ${gameNumber}`);
  };

  const handleClearShots = () => {
    if (confirm('Clear all shot data? This cannot be undone.')) {
      setShots([]);
      setHighlights([]);
      setGameNumber('');
      loadedGameRef.current = '';
    }
  };

  const getEmbedUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return '';

    try {
      const parsed = new URL(trimmed);

      // YouTube watch/share URLs -> embed URL
      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.hostname.includes('youtu.be')) {
        const videoId = parsed.pathname.replace('/', '');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      // Twitch channel URL -> embed URL
      if (parsed.hostname.includes('twitch.tv')) {
        const channel = parsed.pathname.split('/').filter(Boolean)[0];
        if (channel) {
          return `https://player.twitch.tv/?channel=${channel}&parent=localhost`;
        }
      }

      // Already embeddable URL
      return trimmed;
    } catch {
      return '';
    }
  };

  const handleSaveLiveStream = async () => {
    const gameNum = parseInt(gameNumber);
    if (!gameNum || !youtubeUrl.trim()) {
      setMessage('Enter game number and a valid stream URL first.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      await updateGameLiveStreamUrl(gameNum, selectedSeason, youtubeUrl);
      setMessage(`Saved live stream URL for Game ${gameNum} (${selectedSeason}).`);
    } catch (error) {
      setMessage('Error saving live stream URL.');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
            { key: 'shots', label: 'Shot Maps & Highlights', icon: '🎯' },
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

          {activeTab === 'shots' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Shot Map & Highlights Entry</h2>
              <p className="text-gray-400 mb-6">Watch the game footage and click on the court to place shots. Add highlights as you review.</p>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Court and Shot Entry */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Game Number</label>
                    <input
                      type="number"
                      value={gameNumber}
                      onChange={(e) => setGameNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      placeholder="e.g., 1"
                      min="1"
                    />
                  </div>

                  {/* Shot Type Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Shot Type</label>
                      <select
                        value={nextShotType === 'FT' ? '2P' : nextShotType}
                        onChange={(e) => setNextShotType(e.target.value as '2P' | '3P')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="2P">2-Pointer</option>
                        <option value="3P">3-Pointer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Result</label>
                      <select
                        value={nextShotMade ? 'made' : 'missed'}
                        onChange={(e) => setNextShotMade(e.target.value === 'made')}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="made">Made ✓</option>
                        <option value="missed">Missed ✗</option>
                      </select>
                    </div>
                  </div>

                  {/* Free throw quick buttons */}
                  <div>
                    <label className="block text-white font-medium mb-2">Free Throws</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddFreeThrow(true)}
                        className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Made FT ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddFreeThrow(false)}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Missed FT ✗
                      </button>
                    </div>
                  </div>

                  {/* Shot metadata */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white font-medium mb-2">Shot Timestamp</label>
                      <div className="flex gap-2">
                        <select
                          value={nextShotQuarter}
                          onChange={(e) => setNextShotQuarter(e.target.value)}
                          className="px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
                        >
                          <option value="Q1">Q1</option>
                          <option value="Q2">Q2</option>
                          <option value="Q3">Q3</option>
                          <option value="Q4">Q4</option>
                          <option value="OT">OT</option>
                        </select>
                        <input
                          type="text"
                          value={nextShotTime}
                          onChange={(e) => setNextShotTime(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                          placeholder="2:10"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-white font-medium mb-2">Player</label>
                      <input
                        type="text"
                        value={nextShotPlayerSearch}
                        onChange={(e) => { setNextShotPlayerSearch(e.target.value); setNextShotPlayerId(''); }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                        placeholder="Search player..."
                      />
                      {nextShotPlayerSearch && !nextShotPlayerId && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg max-h-40 overflow-y-auto">
                          {players.filter(p => p.name?.toLowerCase().includes(nextShotPlayerSearch.toLowerCase()) || p.id?.toLowerCase().includes(nextShotPlayerSearch.toLowerCase())).map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setNextShotPlayerId(p.id); setNextShotPlayerSearch(p.name || p.id); }}
                              className="w-full text-left px-4 py-2 text-white hover:bg-white/10 text-sm"
                            >
                              {p.name || p.id} <span className="text-gray-400 text-xs">({p.team})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Court SVG */}
                  <div className="bg-orange-600 rounded-xl p-4 cursor-crosshair">
                    <svg
                      viewBox="0 0 500 470"
                      onClick={handleCourtClick}
                      className="w-full bg-orange-500 rounded-lg border-2 border-white"
                    >
                      {/* Outer boundary */}
                      <rect x="10" y="10" width="480" height="450" fill="none" stroke="white" strokeWidth="2" />

                      {/* Hoop + backboard */}
                      <line x1="220" y1="22" x2="280" y2="22" stroke="white" strokeWidth="2" />
                      <circle cx="250" cy="35" r="9" fill="none" stroke="white" strokeWidth="2" />

                      {/* Paint / key */}
                      <rect x="170" y="10" width="160" height="190" fill="none" stroke="white" strokeWidth="2" />

                      {/* Free throw circle (top solid, bottom dashed) */}
                      <path d="M 215 200 A 35 35 0 0 1 285 200" fill="none" stroke="white" strokeWidth="2" />
                      <path d="M 285 200 A 35 35 0 0 1 215 200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" opacity="0.8" />

                      {/* Three-point line */}
                      <line x1="45" y1="10" x2="45" y2="140" stroke="white" strokeWidth="2" />
                      <line x1="455" y1="10" x2="455" y2="140" stroke="white" strokeWidth="2" />
                      <path d="M 45 140 A 205 205 0 0 0 455 140" fill="none" stroke="white" strokeWidth="2" />
                      
                      {/* Render shots */}
                      {shots.map((shot, idx) => (
                        <circle
                          key={idx}
                          cx={(shot.x / 100) * 500}
                          cy={(shot.y / 100) * 470}
                          r="8"
                          fill={shot.made ? '#10b981' : '#ef4444'}
                          opacity="0.7"
                        />
                      ))}
                    </svg>
                    <p className="text-white text-sm mt-2">← Click on court to place shots (uses timestamp/player above)</p>
                  </div>

                  {/* Shots List */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Shots Placed: {shots.length}</h3>
                    <div className="bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                      {shots.length > 0 ? (
                        shots.map((shot, idx) => (
                          <div key={idx} className="text-sm text-gray-300">
                            {shot.timestamp || `Shot ${idx + 1}`}: {shot.playerId || 'Unknown'} - {shot.made ? '✓ Made' : '✗ Missed'} {shot.type} from {shot.distanceFt} ft
                            <button
                              onClick={() => setShots(shots.filter((_, i) => i !== idx))}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No shots yet. Click on the court to add shots.</p>
                      )}
                    </div>
                  </div>

                  {/* Play Log */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Play Log</h3>
                    <div className="bg-white/5 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2">
                      {shots.length > 0 ? (
                        [...shots].map((shot, idx) => (
                          <div key={idx} className="text-sm text-gray-200 border-b border-white/10 pb-2">
                            <div className="font-semibold">
                              {shot.timestamp || `Play ${idx + 1}`} • {shot.playerId || 'Unknown'}
                            </div>
                            <div className="text-gray-300">
                              {shot.made ? 'Made' : 'Missed'} {shot.type} from {shot.distanceFt} ft
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No plays yet. Add shots to build the log.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Highlights Sidebar */}
                <div className="space-y-6">
                  <div className="space-y-3 bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white">Live Stream</h3>
                    <p className="text-xs text-gray-300">
                      Saving link for <span className="text-orange-300 font-semibold">{selectedSeason}</span> • Game {gameNumber || '—'}
                    </p>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm"
                      placeholder="Paste YouTube/Twitch stream URL"
                    />
                    <button
                      onClick={handleSaveLiveStream}
                      disabled={submitting || !gameNumber || !youtubeUrl.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-4 py-2 rounded font-semibold transition-colors text-sm"
                    >
                      🔗 Save Live Link to Game
                    </button>
                    {getEmbedUrl(youtubeUrl) && (
                      <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
                        <iframe
                          src={getEmbedUrl(youtubeUrl)}
                          title="Live Stream Preview"
                          className="w-full aspect-video"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">Highlights ({highlights.length})</h3>
                  <p className="text-xs text-gray-300 -mt-3">
                    You are tagging highlights for <span className="text-orange-300 font-semibold">{selectedSeason}</span>.
                  </p>
                  
                  <div className="space-y-3 bg-white/5 rounded-lg p-4">
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">Timestamp</label>
                      <div className="flex gap-2">
                        <select
                          value={highlightQuarter}
                          onChange={(e) => setHighlightQuarter(e.target.value)}
                          className="px-2 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-orange-400 text-sm"
                        >
                          <option value="Q1">Q1</option>
                          <option value="Q2">Q2</option>
                          <option value="Q3">Q3</option>
                          <option value="Q4">Q4</option>
                          <option value="OT">OT</option>
                        </select>
                        <input
                          type="text"
                          value={highlightTime}
                          onChange={(e) => setHighlightTime(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm"
                          placeholder="2:35"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-white font-medium mb-2 text-sm">Player</label>
                      <input
                        type="text"
                        value={highlightPlayerSearch}
                        onChange={(e) => { setHighlightPlayerSearch(e.target.value); setHighlightPlayerId(''); }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm"
                        placeholder="Search player..."
                      />
                      {highlightPlayerSearch && !highlightPlayerId && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded max-h-36 overflow-y-auto">
                          {players.filter(p => p.name?.toLowerCase().includes(highlightPlayerSearch.toLowerCase()) || p.id?.toLowerCase().includes(highlightPlayerSearch.toLowerCase())).map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setHighlightPlayerId(p.id); setHighlightPlayerSearch(p.name || p.id); }}
                              className="w-full text-left px-3 py-2 text-white hover:bg-white/10 text-sm"
                            >
                              {p.name || p.id} <span className="text-gray-400 text-xs">({p.team})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">Play Type</label>
                      <select
                        value={highlightType}
                        onChange={(e) => setHighlightType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-orange-400 text-sm"
                      >
                        <option value="made-shot">Made Shot</option>
                        <option value="blocked-shot">Blocked Shot</option>
                        <option value="steal">Steal</option>
                        <option value="assist">Assist</option>
                        <option value="rebound">Rebound</option>
                        <option value="dunk">Dunk</option>
                        <option value="three-pointer">3-Pointer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2 text-sm">Description</label>
                      <textarea
                        value={highlightDescription}
                        onChange={(e) => setHighlightDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm h-20"
                        placeholder="e.g., Alley-oop from X to Y"
                      />
                    </div>

                    <button
                      onClick={handleAddHighlight}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold transition-colors text-sm"
                    >
                      + Add Highlight
                    </button>
                  </div>

                  {/* Highlights List */}
                  <div className="bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {highlights.length > 0 ? (
                      highlights.map((h, idx) => (
                        <div key={idx} className="text-xs text-gray-300 border-b border-white/10 pb-2">
                          <p className="font-semibold">{h.timestamp} - {h.type}</p>
                          <p className="text-gray-400">{h.description}</p>
                          <button
                            onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300 text-xs mt-1"
                          >
                            remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">No highlights yet. Add them as you review.</p>
                    )}
                  </div>

                  {/* Export Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleExportData}
                      disabled={shots.length === 0 && highlights.length === 0}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-4 py-2 rounded font-semibold transition-colors text-sm"
                    >
                      📥 Export CSVs
                    </button>
                    <button
                      onClick={handleClearShots}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors text-sm"
                    >
                      🗑️ Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
