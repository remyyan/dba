import { GamePlayerStats } from './data';

export interface CSVGameData {
  gameNumber: number;
  team1Score: number;
  team2Score: number;
  team1Players: GamePlayerStats[];
  team2Players: GamePlayerStats[];
  quarters?: {
    q1: { team1: number; team2: number };
    q2: { team1: number; team2: number };
    q3: { team1: number; team2: number };
    q4: { team1: number; team2: number };
  };
}

export function parseGameCSV(csvContent: string): CSVGameData | null {
  try {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 15) {
      throw new Error('Invalid CSV format: insufficient data');
    }

    // Extract game number from first line - handle both "Game 1" and "Game:3" formats
    const gameNumberMatch = lines[0].match(/Game[:\s]*(\d+)/i);
    const gameNumber = gameNumberMatch ? parseInt(gameNumberMatch[1]) : 1;

    // Find the header line with column names
    const headerIndex = lines.findIndex(line =>
      line.includes('Players,Points:,Rebounds:,Assists:,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,STL,BLK,MINS')
    );

    if (headerIndex === -1) {
      throw new Error('Could not find header row with expected format');
    }

    // Find team 1 section (starts right after first header)
    const team1StartIndex = headerIndex + 1;

    // Find team 2 section (look for second "Team:" marker and header)
    const team2HeaderIndex = lines.findIndex((line, index) =>
      index > team1StartIndex + 3 && line.includes('Players,Points:,Rebounds:,Assists:,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,STL,BLK,MINS')
    );

    if (team2HeaderIndex === -1) {
      throw new Error('Could not find team 2 data section');
    }

    const team2StartIndex = team2HeaderIndex + 1;

    // Parse team 1 players (Golden Dragons) - from team1StartIndex until we hit "Game Totals"
    const team1EndIndex = lines.findIndex((line, index) =>
      index > team1StartIndex && line.startsWith('Game Totals')
    );
    const team1Players = parseTeamPlayers(lines, team1StartIndex, team1EndIndex);

    // Parse team 2 players (Los Sigmas) - from team2StartIndex until we hit "Game Totals"
    const team2EndIndex = lines.findIndex((line, index) =>
      index > team2StartIndex && line.startsWith('Game Totals')
    );
    const team2Players = parseTeamPlayers(lines, team2StartIndex, team2EndIndex);

    // Find final scores
    const finalScoreIndex = lines.findIndex(line => line.includes('Final Score'));
    let team1Score = 0;
    let team2Score = 0;

    if (finalScoreIndex !== -1 && finalScoreIndex + 1 < lines.length) {
      const scoreData = lines[finalScoreIndex + 1].split(',');
      team1Score = parseInt(scoreData[1]) || 0;
      team2Score = parseInt(scoreData[2]) || 0;
    }

    // Parse quarter scores
    const quarters = parseQuarterScores(lines, finalScoreIndex);

    return {
      gameNumber,
      team1Score,
      team2Score,
      team1Players,
      team2Players,
      quarters
    };

  } catch (error) {
    console.error('Error parsing CSV:', error);
    return null;
  }
}

function parseTeamPlayers(lines: string[], startIndex: number, endIndex: number): GamePlayerStats[] {
  const players: GamePlayerStats[] = [];

  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    if (!line || line.includes('Game Totals') || line.includes('Team:') || line.includes('Final Score')) {
      break;
    }

    const data = line.split(',');
    if (data.length < 16) {
      continue;
    }

    const name = data[0].trim();
    // Skip empty rows or rows with just zeros/empty values
    if (name === '' || name === '0' || !name) {
      continue;
    }

    // Parse stats with proper handling of empty values and #DIV/0! errors
    const parseNumber = (value: string): number => {
      if (!value || value.trim() === '' || value.includes('#DIV/0!')) return 0;
      const num = parseFloat(value.trim());
      return isNaN(num) ? 0 : num;
    };

    const player: GamePlayerStats = {
      name,
      points: parseNumber(data[1]),
      rebounds: parseNumber(data[2]),
      assists: parseNumber(data[3]),
      fgm: parseNumber(data[4]),
      fga: parseNumber(data[5]),
      fgPercentage: parseNumber(data[6]),
      threePM: parseNumber(data[7]),
      threePA: parseNumber(data[8]),
      threePPercentage: parseNumber(data[9]),
      ftm: parseNumber(data[10]),
      fta: parseNumber(data[11]),
      ftPercentage: parseNumber(data[12]),
      steals: parseNumber(data[13]),
      blocks: parseNumber(data[14]),
      minutes: parseNumber(data[15])
    };

    // Only add players with actual game participation (non-zero minutes or stats)
    if (player.minutes > 0 || player.points > 0 || player.rebounds > 0 || player.assists > 0) {
      players.push(player);
    }
  }

  return players;
}

function parseQuarterScores(lines: string[], finalScoreIndex: number): {
  q1: { team1: number; team2: number };
  q2: { team1: number; team2: number };
  q3: { team1: number; team2: number };
  q4: { team1: number; team2: number };
} | undefined {
  if (finalScoreIndex === -1) return undefined;

  const quarters = {
    q1: { team1: 0, team2: 0 },
    q2: { team1: 0, team2: 0 },
    q3: { team1: 0, team2: 0 },
    q4: { team1: 0, team2: 0 }
  };

  // Look for quarter data after final score
  for (let i = finalScoreIndex + 2; i < Math.min(finalScoreIndex + 6, lines.length); i++) {
    const line = lines[i];
    if (!line) continue;

    const data = line.split(',');
    if (data.length < 3) continue;

    const quarterLabel = data[0].trim();
    const team1Value = data[1].trim();
    const team2Value = data[2].trim();

    // Handle "?" values in quarter scores
    const team1Score = (team1Value === '?' || team1Value === '') ? 0 : parseInt(team1Value) || 0;
    const team2Score = (team2Value === '?' || team2Value === '') ? 0 : parseInt(team2Value) || 0;

    if (quarterLabel === 'Q1') {
      quarters.q1 = { team1: team1Score, team2: team2Score };
    } else if (quarterLabel === 'Q2') {
      quarters.q2 = { team1: team1Score, team2: team2Score };
    } else if (quarterLabel === 'Q3') {
      quarters.q3 = { team1: team1Score, team2: team2Score };
    } else if (quarterLabel === 'Q4') {
      quarters.q4 = { team1: team1Score, team2: team2Score };
    }
  }

  return quarters;
}

export function validateGameData(gameData: CSVGameData): string[] {
  const errors: string[] = [];

  if (!gameData.gameNumber || gameData.gameNumber < 1) {
    errors.push('Invalid game number');
  }

  if (gameData.team1Score < 0 || gameData.team2Score < 0) {
    errors.push('Invalid team scores');
  }

  if (gameData.team1Players.length === 0 && gameData.team2Players.length === 0) {
    errors.push('No player data found');
  }

  // Validate player stats
  [...gameData.team1Players, ...gameData.team2Players].forEach((player, index) => {
    if (!player.name || player.name.trim() === '') {
      errors.push(`Player ${index + 1}: Missing name`);
    }

    if (player.points < 0 || player.rebounds < 0 || player.assists < 0) {
      errors.push(`${player.name}: Negative stats not allowed`);
    }

    if (player.fga > 0 && player.fgm > player.fga) {
      errors.push(`${player.name}: Field goals made cannot exceed attempts`);
    }

    if (player.threePA > 0 && player.threePM > player.threePA) {
      errors.push(`${player.name}: Three-pointers made cannot exceed attempts`);
    }

    if (player.fta > 0 && player.ftm > player.fta) {
      errors.push(`${player.name}: Free throws made cannot exceed attempts`);
    }
  });

  return errors;
}

export function formatPlayerStatsForDisplay(player: GamePlayerStats): string {
  return `${player.name}: ${player.points} PTS, ${player.rebounds} REB, ${player.assists} AST, ${player.fgm}/${player.fga} FG (${(player.fgPercentage * 100).toFixed(1)}%), ${player.threePM}/${player.threePA} 3P (${(player.threePPercentage * 100).toFixed(1)}%), ${player.ftm}/${player.fta} FT (${(player.ftPercentage * 100).toFixed(1)}%), ${player.steals} STL, ${player.blocks} BLK, ${player.minutes} MIN`;
}
