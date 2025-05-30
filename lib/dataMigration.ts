import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAllPlayers, getAllTeams, getAllGames } from './data';

// Collections
const PLAYERS_COLLECTION = 'players';
const TEAMS_COLLECTION = 'teams';
const GAMES_COLLECTION = 'games';
const SETTINGS_COLLECTION = 'settings';

export const migrateDataToFirebase = async () => {
  try {
    console.log('🚀 Starting data migration to Firebase...');

    // Check if data already exists
    const playersSnapshot = await getDocs(collection(db, PLAYERS_COLLECTION));
    if (!playersSnapshot.empty) {
      console.log('⚠️ Data already exists in Firebase. Skipping migration.');
      return { success: true, message: 'Data already exists' };
    }

    // Migrate Players
    console.log('📊 Migrating players...');
    const players = getAllPlayers();
    const playerPromises = players.map(async (player) => {
      const playerData = {
        name: player.name,
        team: player.team,
        points: player.points,
        careerHigh: player.careerHigh,
        rebounds: player.rebounds,
        assists: player.assists,
        threePointersMade: player.threePointersMade,
        fieldGoalPercentage: player.fieldGoalPercentage,
        threePointPercentage: player.threePointPercentage,
        freeThrowPercentage: player.freeThrowPercentage,
        steals: player.steals,
        blocks: player.blocks,
        minutes: player.minutes,
        freeThrowAttempts: player.freeThrowAttempts,
        mvpVotes: player.mvpVotes || 0,
        isActive: player.points > 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return addDoc(collection(db, PLAYERS_COLLECTION), playerData);
    });

    await Promise.all(playerPromises);
    console.log(`✅ Migrated ${players.length} players`);

    // Migrate Teams
    console.log('🏀 Migrating teams...');
    const teams = getAllTeams();
    const teamPromises = teams.map(async (team) => {
      const teamData = {
        name: team.name,
        wins: team.wins,
        losses: team.losses,
        winPercentage: team.winPercentage,
        color: team.color,
        playerCount: team.players.length,
        activePlayerCount: team.players.filter(p => p.points > 0).length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Use team name as document ID for easier querying
      return setDoc(doc(db, TEAMS_COLLECTION, team.name.toLowerCase().replace(/\s+/g, '-')), teamData);
    });

    await Promise.all(teamPromises);
    console.log(`✅ Migrated ${teams.length} teams`);

    // Migrate Games
    console.log('🏆 Migrating games...');
    const games = getAllGames();
    const gamePromises = games.map(async (game) => {
      const gameData = {
        gameNumber: game.gameNumber,
        date: game.date,
        team1Score: game.team1Score,
        team2Score: game.team2Score,
        team1Name: 'Golden Dragons',
        team2Name: 'Los Sigmas',
        team1Players: game.team1Players,
        team2Players: game.team2Players,
        quarters: game.quarters || null,
        status: 'Final',
        winner: game.team2Score > game.team1Score ? 'Los Sigmas' : 'Golden Dragons',
        totalScore: game.team1Score + game.team2Score,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return addDoc(collection(db, GAMES_COLLECTION), gameData);
    });

    await Promise.all(gamePromises);
    console.log(`✅ Migrated ${games.length} games`);

    // Add initial settings
    console.log('⚙️ Setting up initial configuration...');
    const settingsData = {
      currentSeason: '2024',
      mvpVotingEnabled: true,
      totalGamesPlayed: games.length,
      leagueStartDate: '2024-01-15',
      lastUpdated: new Date()
    };

    await setDoc(doc(db, SETTINGS_COLLECTION, 'league-config'), settingsData);
    console.log('✅ Initial settings configured');

    console.log('🎉 Data migration completed successfully!');
    return { 
      success: true, 
      message: `Successfully migrated ${players.length} players, ${teams.length} teams, and ${games.length} games to Firebase!` 
    };

  } catch (error) {
    console.error('❌ Error during data migration:', error);
    return { 
      success: false, 
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Function to check if data exists in Firebase
export const checkFirebaseData = async () => {
  try {
    const playersSnapshot = await getDocs(collection(db, PLAYERS_COLLECTION));
    const teamsSnapshot = await getDocs(collection(db, TEAMS_COLLECTION));
    const gamesSnapshot = await getDocs(collection(db, GAMES_COLLECTION));

    return {
      players: playersSnapshot.size,
      teams: teamsSnapshot.size,
      games: gamesSnapshot.size,
      hasData: playersSnapshot.size > 0 || teamsSnapshot.size > 0 || gamesSnapshot.size > 0
    };
  } catch (error) {
    console.error('Error checking Firebase data:', error);
    return {
      players: 0,
      teams: 0,
      games: 0,
      hasData: false
    };
  }
};

// Function to clear all data (use with caution!)
export const clearFirebaseData = async () => {
  try {
    console.log('🗑️ Clearing Firebase data...');
    
    // This is a simple implementation - in production you'd want batch operations
    const collections = [PLAYERS_COLLECTION, TEAMS_COLLECTION, GAMES_COLLECTION];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`✅ Cleared ${collectionName}`);
    }
    
    return { success: true, message: 'All data cleared successfully' };
  } catch (error) {
    console.error('Error clearing data:', error);
    return { success: false, message: 'Failed to clear data' };
  }
};
