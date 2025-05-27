"use client";

import { useLocalStorage } from '@uidotdev/usehooks';
import { PastGame, PastGamesArray } from '@/lib/types/past-games';

export function usePastGames() {
  const [pastGames, setPastGames] = useLocalStorage<PastGamesArray>('pastGames', []);

  const addPastGame = (roomId: string, cityId: number, cityName?: string) => {
    const newGame: PastGame = {
      joinedAt: new Date().toISOString(),
      roomId,
      cityId,
      cityName,
    };

    // Add to the beginning of the array (most recent first)
    // Also remove duplicates based on roomId and cityId
    const filteredGames = pastGames.filter(
      game => !(game.roomId === roomId && game.cityId === cityId)
    );
    
    setPastGames([newGame, ...filteredGames]);
  };

  const removePastGame = (roomId: string, cityId: number) => {
    setPastGames(pastGames.filter(
      game => !(game.roomId === roomId && game.cityId === cityId)
    ));
  };

  const clearPastGames = () => {
    setPastGames([]);
  };

  return {
    pastGames,
    addPastGame,
    removePastGame,
    clearPastGames,
  };
} 