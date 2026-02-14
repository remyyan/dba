import {
  Game,
  GamePlayer,
  Player,
  Team,
  createGame,
  createPlayer,
  updatePlayer,
  getAllPlayers,
  getAllTeams,
  createTeam,
  calculatePlayerEfficiency,
  calculatePlayerScore,
  updateTeamRecords,
  CURRENT_SEASON
} from './firebase-data';
import { addActivity } from './activities';

export interface CSVGameData {
  gameNumber: number;
  date: string;
  team1Score: number;
  team2Score: number;
  players: CSVPlayerData[];
  quarters?: {
    q1: { team1: number; team2: number };
    q2: { team1: number; team2: number };
    q3: { team1: number; team2: number };
    q4: { team1: number; team2: number };
  };
}

export interface CSVPlayerData {
  name: string;
  team: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes: number;
  fgm: number;
  fga: number;
  threePM: number;
  threePA: number;
  ftm: number;
  fta: number;
}

export function parseCSVContent(csvContent: string): CSVGameData {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);

  // Extract game info from first line
  const gameNumber = extractGameNumber(lines[0] || '');
  const date = new Date().toLocaleDateString(); // Use current date for now

  const players: CSVPlayerData[] = [];
  let team1Score = 0;
  let team2Score = 0;
  let currentTeam = '';

  // Parse the CSV line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines, headers, and quarter lines
    if (!line ||
        line.includes('Players,Points') ||
        line.includes('Game Totals') ||
        line.startsWith('Q1') ||
        line.startsWith('Q2') ||
        line.startsWith('Q3') ||
        line.startsWith('Q4')) {
      continue;
    }

    // Extract final scores (usually the next line after "Final Score")
    if (line.includes('Final Score')) {
      const nextLine = lines[i + 1];
      const lineAfterNext = lines[i + 2];

      // Try the immediate next line first
      if (nextLine && nextLine.split(',').length >= 3) {
        const scores = nextLine.split(',');
        if (scores[1] && scores[2] && scores[1] !== '' && scores[2] !== '') {
          team1Score = parseInt(scores[1]) || 0;
          team2Score = parseInt(scores[2]) || 0;
          console.log('Extracted final scores from next line:', { team1Score, team2Score, nextLine });
        }
      }
      // If that didn't work, try the line after next
      else if (lineAfterNext && lineAfterNext.split(',').length >= 3) {
        const scores = lineAfterNext.split(',');
        if (scores[1] && scores[2] && scores[1] !== '' && scores[2] !== '') {
          team1Score = parseInt(scores[1]) || 0;
          team2Score = parseInt(scores[2]) || 0;
          console.log('Extracted final scores from line after next:', { team1Score, team2Score, lineAfterNext });
        }
      }

      continue;
    }

    // Check if this line indicates a team section
    if (line.includes('Team:')) {
      // Try to parse team name after "Team:"; if absent, fall back to toggling.
      const after = line.split('Team:')[1]?.trim() || '';
      const normalized = after.toLowerCase();
      if (normalized.includes('golden')) {
        currentTeam = 'Golden Dragons';
      } else if (normalized.includes('sigma') || normalized.includes('los')) {
        currentTeam = 'Los Sigmas';
      } else {
        currentTeam = currentTeam === '' ? 'Golden Dragons' : 'Los Sigmas';
      }
      continue;
    }

    // Try to parse as player data
    const player = parsePlayerRow(line, currentTeam);
    if (player && player.name) {
      players.push(player);
    }
  }

  // If no final scores found, calculate from player totals
  if (team1Score === 0 && team2Score === 0) {
    const team1Players = players.filter(p => p.team === 'Golden Dragons');
    const team2Players = players.filter(p => p.team === 'Los Sigmas');

    team1Score = team1Players.reduce((sum, p) => sum + p.points, 0);
    team2Score = team2Players.reduce((sum, p) => sum + p.points, 0);
    console.log('Calculated scores from players:', { team1Score, team2Score });
  }

  // Extract quarter scores if available
  const quarters = extractQuarterScores(lines);

  console.log('Final game data:', { gameNumber, team1Score, team2Score, playersCount: players.length });

  return {
    gameNumber,
    date,
    team1Score,
    team2Score,
    players,
    quarters
  };
}

function extractQuarterScores(lines: string[]): any {
  const quarters: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('Q1')) {
      const scores = line.split(',');
      if (scores.length >= 3) {
        quarters.q1 = {
          team1: parseInt(scores[1]) || 0,
          team2: parseInt(scores[2]) || 0
        };
      }
    } else if (line.startsWith('Q2')) {
      const scores = line.split(',');
      if (scores.length >= 3) {
        quarters.q2 = {
          team1: parseInt(scores[1]) || 0,
          team2: parseInt(scores[2]) || 0
        };
      }
    } else if (line.startsWith('Q3')) {
      const scores = line.split(',');
      if (scores.length >= 3) {
        const q3Team1 = scores[1] === '?' ? 0 : parseInt(scores[1]) || 0;
        const q3Team2 = scores[2] === '?' ? 0 : parseInt(scores[2]) || 0;
        quarters.q3 = {
          team1: q3Team1,
          team2: q3Team2
        };
      }
    } else if (line.startsWith('Q4')) {
      const scores = line.split(',');
      if (scores.length >= 3) {
        quarters.q4 = {
          team1: parseInt(scores[1]) || 0,
          team2: parseInt(scores[2]) || 0
        };
      }
    }
  }

  // Only return quarters if we have at least one quarter
  if (Object.keys(quarters).length > 0) {
    return quarters;
  }

  return undefined;
}

function extractGameNumber(firstLine: string): number {
  const gameMatch = firstLine.match(/game\s*(\d+)/i);
  if (gameMatch) {
    return parseInt(gameMatch[1]);
  }

  // Default to next game number
  return Date.now() % 1000; // Temporary fallback
}

function extractDate(firstLine: string): string | null {
  // Try to find date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/
  ];

  for (const pattern of datePatterns) {
    const match = firstLine.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function isPlayerDataRow(line: string): boolean {
  const parts = line.split(',');
  return parts.length >= 10 && !isNaN(Number(parts[2])); // Check if third column is a number (points)
}

function parsePlayerRow(line: string, team: string): CSVPlayerData | null {
  const parts = line.split(',').map(part => part.trim());

  if (parts.length < 16) return null;

  const name = parts[0];
  const nameLower = (name || '').trim().toLowerCase();
  if (!name || nameLower === '' || nameLower === 'players' || nameLower.includes('total') || nameLower.includes('team')) {
    return null;
  }

  try {
    // Handle #DIV/0! errors in CSV
    const parseValue = (value: string): number => {
      if (!value || value === '#DIV/0!' || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      name,
      team: team || 'Golden Dragons', // Use the team parameter
      points: parseValue(parts[1]),
      rebounds: parseValue(parts[2]),
      assists: parseValue(parts[3]),
      fgm: parseValue(parts[4]),
      fga: parseValue(parts[5]),
      threePM: parseValue(parts[7]),
      threePA: parseValue(parts[8]),
      ftm: parseValue(parts[10]),
      fta: parseValue(parts[11]),
      steals: parseValue(parts[13]),
      blocks: parseValue(parts[14]),
      minutes: parseValue(parts[15]),
      turnovers: parseValue(parts[16]) // New column at the end
    };
  } catch (error) {
    console.error('Error parsing player row:', line, error);
    return null;
  }
}

function determineTeam(playerName: string): string {
  // Based on your CSV structure, determine team by player position in file
  // You may need to adjust this logic based on your specific CSV format
  const goldenDragonsPlayers = [
    'J. Bai', 'R. Yan', 'A. Liang', 'J. Zheng', 'K. Zheng', 'J. Huang', 'A. Zheng'
  ];

  const losSigmasPlayers = [
    'A. Guo', 'N. Ho', 'J. Guo', 'E. Zheng', 'A. Huang', 'J. Liang', 'R. Zheng'
  ];

  if (goldenDragonsPlayers.some(name => playerName.includes(name) || name.includes(playerName))) {
    return 'Golden Dragons';
  }

  if (losSigmasPlayers.some(name => playerName.includes(name) || name.includes(playerName))) {
    return 'Los Sigmas';
  }

  // Default fallback - you might want to make this more sophisticated
  return 'Golden Dragons';
}

function isTeam1Player(playerName: string): boolean {
  return determineTeam(playerName) === 'Golden Dragons';
}

function isTeam2Player(playerName: string): boolean {
  return determineTeam(playerName) === 'Los Sigmas';
}

export async function importGameFromCSV(csvContent: string, importedBy: string, season: string = CURRENT_SEASON): Promise<string> {
  try {
    const gameData = parseCSVContent(csvContent);

    // Get existing players to match IDs
    const existingPlayers = await getAllPlayers();

    // Convert CSV players to GamePlayer format
    const team1Players: GamePlayer[] = [];
    const team2Players: GamePlayer[] = [];

    for (const csvPlayer of gameData.players) {
      const fgPercentage = csvPlayer.fga > 0 ? csvPlayer.fgm / csvPlayer.fga : 0;
      const threePPercentage = csvPlayer.threePA > 0 ? csvPlayer.threePM / csvPlayer.threePA : 0;
      const ftPercentage = csvPlayer.fta > 0 ? csvPlayer.ftm / csvPlayer.fta : 0;

      // Find matching player ID
      const existingPlayer = existingPlayers.find(p =>
        p.name.toLowerCase() === csvPlayer.name.toLowerCase()
      );

      const gamePlayer: GamePlayer = {
        playerId: existingPlayer?.id || '', // Use existing player ID if found
        playerName: csvPlayer.name,
        team: csvPlayer.team,
        points: csvPlayer.points,
        rebounds: csvPlayer.rebounds,
        assists: csvPlayer.assists,
        steals: csvPlayer.steals,
        blocks: csvPlayer.blocks,
        turnovers: csvPlayer.turnovers || 0,
        minutes: csvPlayer.minutes,
        fgm: csvPlayer.fgm,
        fga: csvPlayer.fga,
        fgPercentage,
        threePM: csvPlayer.threePM,
        threePA: csvPlayer.threePA,
        threePPercentage,
        ftm: csvPlayer.ftm,
        fta: csvPlayer.fta,
        ftPercentage,
        efficiency: 0 // Will be calculated
      };

      gamePlayer.efficiency = calculatePlayerEfficiency(gamePlayer);

      if (csvPlayer.team === 'Golden Dragons') {
        team1Players.push(gamePlayer);
      } else {
        team2Players.push(gamePlayer);
      }
    }

    // Find player of the game
    const allPlayers = [...team1Players, ...team2Players];
    const playerOfTheGame = allPlayers.reduce((best, current) => {
      const currentScore = calculatePlayerScore(current);
      const bestScore = calculatePlayerScore(best);
      return currentScore > bestScore ? current : best;
    });

    // Create game object
    const gameBase = {
      gameNumber: gameData.gameNumber,
      season, // Include the season
      date: gameData.date,
      team1: 'Golden Dragons',
      team2: 'Los Sigmas',
      team1Score: gameData.team1Score,
      team2Score: gameData.team2Score,
      team1Players,
      team2Players,
      playerOfTheGame: {
        playerId: playerOfTheGame.playerId,
        playerName: playerOfTheGame.playerName,
        team: playerOfTheGame.team,
        score: calculatePlayerScore(playerOfTheGame)
      }
    };

    // Only add quarters if they exist and are valid
    const game: any = { ...gameBase };
    if (gameData.quarters && typeof gameData.quarters === 'object') {
      game.quarters = gameData.quarters;
    }

    console.log('About to save game to Firebase:', {
      gameNumber: game.gameNumber,
      team1Score: game.team1Score,
      team2Score: game.team2Score,
      team1: game.team1,
      team2: game.team2
    });

    // Save game to Firebase
    const gameId = await createGame(game);

    // Update player season averages
    await updatePlayerAverages(gameData.players);

    // Update team records based on all games
    await updateTeamRecords();

    // Create activity
    await addActivity({
      type: 'transfer',
      description: `Game ${gameData.gameNumber} imported - ${game.team1} ${game.team1Score}, ${game.team2} ${game.team2Score}`,
      playerName: playerOfTheGame.playerName,
      details: `Imported by ${importedBy}. Player of the Game: ${playerOfTheGame.playerName} (${calculatePlayerScore(playerOfTheGame)} pts)`
    });

    return gameId;
  } catch (error) {
    console.error('Error importing game from CSV:', error);
    throw error;
  }
}

async function updatePlayerAverages(csvPlayers: CSVPlayerData[]): Promise<void> {
  const existingPlayers = await getAllPlayers();

  for (const csvPlayer of csvPlayers) {
    let existingPlayer = existingPlayers.find(p =>
      p.name.toLowerCase() === csvPlayer.name.toLowerCase()
    );

    if (!existingPlayer) {
      // Create new player
      const newPlayer: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = {
        name: csvPlayer.name,
        team: csvPlayer.team,
        gamesPlayed: 1,
        points: csvPlayer.points,
        rebounds: csvPlayer.rebounds,
        assists: csvPlayer.assists,
        steals: csvPlayer.steals,
        blocks: csvPlayer.blocks,
        turnovers: csvPlayer.turnovers || 0,
        minutes: csvPlayer.minutes,
        fgm: csvPlayer.fgm,
        fga: csvPlayer.fga,
        fgPercentage: csvPlayer.fga > 0 ? csvPlayer.fgm / csvPlayer.fga : 0,
        threePM: csvPlayer.threePM,
        threePA: csvPlayer.threePA,
        threePPercentage: csvPlayer.threePA > 0 ? csvPlayer.threePM / csvPlayer.threePA : 0,
        ftm: csvPlayer.ftm,
        fta: csvPlayer.fta,
        ftPercentage: csvPlayer.fta > 0 ? csvPlayer.ftm / csvPlayer.fta : 0,
        efficiency: 0,
        playerScore: 0
      };

      newPlayer.efficiency = calculatePlayerEfficiency({
        playerId: '',
        playerName: newPlayer.name,
        team: newPlayer.team,
        points: newPlayer.points,
        rebounds: newPlayer.rebounds,
        assists: newPlayer.assists,
        steals: newPlayer.steals,
        blocks: newPlayer.blocks,
        turnovers: newPlayer.turnovers,
        minutes: newPlayer.minutes,
        fgm: newPlayer.fgm,
        fga: newPlayer.fga,
        fgPercentage: newPlayer.fgPercentage,
        threePM: newPlayer.threePM,
        threePA: newPlayer.threePA,
        threePPercentage: newPlayer.threePPercentage,
        ftm: newPlayer.ftm,
        fta: newPlayer.fta,
        ftPercentage: newPlayer.ftPercentage,
        efficiency: 0
      });

      newPlayer.playerScore = calculatePlayerScore({
        playerId: '',
        playerName: newPlayer.name,
        team: newPlayer.team,
        points: newPlayer.points,
        rebounds: newPlayer.rebounds,
        assists: newPlayer.assists,
        steals: newPlayer.steals,
        blocks: newPlayer.blocks,
        turnovers: newPlayer.turnovers,
        minutes: newPlayer.minutes,
        fgm: newPlayer.fgm,
        fga: newPlayer.fga,
        fgPercentage: newPlayer.fgPercentage,
        threePM: newPlayer.threePM,
        threePA: newPlayer.threePA,
        threePPercentage: newPlayer.threePPercentage,
        ftm: newPlayer.ftm,
        fta: newPlayer.fta,
        ftPercentage: newPlayer.ftPercentage,
        efficiency: newPlayer.efficiency
      });

      await createPlayer(newPlayer);
    } else {
      // Update existing player averages
      const games = existingPlayer.gamesPlayed + 1;
      const existingTurnovers = existingPlayer.turnovers || 0;
      const updates: Partial<Player> = {
        gamesPlayed: games,
        team: csvPlayer.team, // Update team in case of trades
        points: ((existingPlayer.points * existingPlayer.gamesPlayed) + csvPlayer.points) / games,
        rebounds: ((existingPlayer.rebounds * existingPlayer.gamesPlayed) + csvPlayer.rebounds) / games,
        assists: ((existingPlayer.assists * existingPlayer.gamesPlayed) + csvPlayer.assists) / games,
        steals: ((existingPlayer.steals * existingPlayer.gamesPlayed) + csvPlayer.steals) / games,
        blocks: ((existingPlayer.blocks * existingPlayer.gamesPlayed) + csvPlayer.blocks) / games,
        turnovers: ((existingTurnovers * existingPlayer.gamesPlayed) + (csvPlayer.turnovers || 0)) / games,
        minutes: ((existingPlayer.minutes * existingPlayer.gamesPlayed) + csvPlayer.minutes) / games,
        fgm: ((existingPlayer.fgm * existingPlayer.gamesPlayed) + csvPlayer.fgm) / games,
        fga: ((existingPlayer.fga * existingPlayer.gamesPlayed) + csvPlayer.fga) / games,
        threePM: ((existingPlayer.threePM * existingPlayer.gamesPlayed) + csvPlayer.threePM) / games,
        threePA: ((existingPlayer.threePA * existingPlayer.gamesPlayed) + csvPlayer.threePA) / games,
        ftm: ((existingPlayer.ftm * existingPlayer.gamesPlayed) + csvPlayer.ftm) / games,
        fta: ((existingPlayer.fta * existingPlayer.gamesPlayed) + csvPlayer.fta) / games,
      };

      // Recalculate percentages
      updates.fgPercentage = updates.fga! > 0 ? updates.fgm! / updates.fga! : 0;
      updates.threePPercentage = updates.threePA! > 0 ? updates.threePM! / updates.threePA! : 0;
      updates.ftPercentage = updates.fta! > 0 ? updates.ftm! / updates.fta! : 0;

      await updatePlayer(existingPlayer.id!, updates);
    }
  }
}
