"use client";

import { useEffect, useState } from 'react';
import { PastGame, PastGamesArray } from '@/lib/types/past-games';

export function usePastGames() {
  const [pastGames, setPastGames] = useState<PastGamesArray>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Load past games from localStorage
    try {
      const stored = localStorage.getItem('pastGames');
      if (stored) {
        setPastGames(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading past games from localStorage:', error);
      setPastGames([]);
    }
  }, []);

  // Save to localStorage whenever pastGames changes (but only on client)
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('pastGames', JSON.stringify(pastGames));
      } catch (error) {
        console.error('Error saving past games to localStorage:', error);
      }
    }
  }, [pastGames, isClient]);

  const addPastGame = (roomId: string, cityId: number, cityName?: string) => {
    const newGame: PastGame = {
      joinedAt: new Date().toISOString(),
      roomId,
      cityId,
      cityName,
    };

    // Add to the beginning of the array (most recent first)
    // Also remove duplicates based on roomId and cityId
    setPastGames(prevGames => {
      const filteredGames = prevGames.filter(
        game => !(game.roomId === roomId && game.cityId === cityId)
      );
      return [newGame, ...filteredGames];
    });
  };

  const removePastGame = (roomId: string, cityId: number) => {
    setPastGames(prevGames => 
      prevGames.filter(
        game => !(game.roomId === roomId && game.cityId === cityId)
      )
    );
  };

  const clearPastGames = () => {
    setPastGames([]);
  };

  return {
    pastGames,
    addPastGame,
    removePastGame,
    clearPastGames,
    isClient, // Export this in case components need to know if we're client-side
  };
} 