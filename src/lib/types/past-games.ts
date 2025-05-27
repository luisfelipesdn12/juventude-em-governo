export interface PastGame {
  joinedAt: string; // ISO string date
  roomId: string;
  cityId: number;
  cityName?: string; // Optional, for display purposes
}

export type PastGamesArray = PastGame[]; 