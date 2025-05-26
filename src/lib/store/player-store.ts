import { create } from 'zustand';
import { customAlphabet } from 'nanoid';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create a custom nanoid function that generates a shorter ID for players
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export interface Player {
  id: string;
  roomId: string;
  cityId: number; // ID of the city within the room
  cityName: string;
  playerCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface PlayerState {
  player: Player | null;
  loading: boolean;
  error: string | null;
  setPlayer: (player: Player | null) => void;
  
  // Check if a room exists
  roomExists: (roomId: string) => Promise<boolean>;
  
  // Add a player to a room
  joinRoom: (roomId: string, cityName: string, playerCount: number) => Promise<Player | null>;
  
  // Get a player by ID
  getPlayer: (id: string) => Promise<Player | null>;
  
  // Update a player
  updatePlayer: (id: string, playerData: Partial<Player>) => Promise<void>;
  
  // Delete a player
  leaveRoom: (id: string) => Promise<void>;
  
  // Subscribe to player updates
  subscribeToPlayer: (id: string, callback: (player: Player | null) => void) => () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  loading: false,
  error: null,
  
  setPlayer: (player) => set({ player }),
  
  roomExists: async (roomId) => {
    set({ loading: true, error: null });
    
    try {
      // Query Firestore for the room with matching id
      const q = query(collection(db, 'rooms'), where('id', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      set({ loading: false });
      return !querySnapshot.empty;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to check room existence',
        loading: false 
      });
      return false;
    }
  },
  
  joinRoom: async (roomId, cityName, playerCount) => {
    set({ loading: true, error: null });
    
    try {
      // First check if the room exists
      const q = query(collection(db, 'rooms'), where('id', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        set({ 
          error: `Sala com código ${roomId} não encontrada`,
          loading: false 
        });
        return null;
      }
      
      // Get the room data
      const roomData = querySnapshot.docs[0].data();
      
      // Generate a unique city ID (simple incrementing based on existing cities)
      const cityId = roomData.cities ? roomData.cities.length + 1 : 1;
      
      // Create a city for this player in the room
      const city = {
        id: cityId,
        name: cityName,
        state: 'drawing' as const,
      };

      // Add the city to the room
      const updatedCities = [...(roomData.cities || []), city];
      await updateDoc(doc(db, 'rooms', querySnapshot.docs[0].id), {
        cities: updatedCities,
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      // Create a new player
      const id = nanoid();
      const timestamp = new Date();
      
      const newPlayer: Player = {
        id,
        roomId,
        cityId,
        cityName,
        playerCount,
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      };
      
      // Add the player to Firestore
      await addDoc(collection(db, 'players'), newPlayer);
      
      // Update local state
      set({ 
        player: newPlayer,
        loading: false 
      });
      
      return newPlayer;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join room',
        loading: false 
      });
      return null;
    }
  },

  getPlayer: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Query Firestore for the player with matching id
      const q = query(collection(db, 'players'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        set({ loading: false });
        return null;
      }
      
      // Get the player data
      const playerData = querySnapshot.docs[0].data() as Player;
      set({ 
        player: playerData,
        loading: false 
      });
      
      return playerData;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get player',
        loading: false 
      });
      return null;
    }
  },
  
  updatePlayer: async (id, playerData) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'players'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Player with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'players', querySnapshot.docs[0].id);
      
      // Update the document
      const updatedPlayer = {
        ...playerData,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updatedPlayer);
      
      // Update the local state
      set((state) => ({
        player: state.player && state.player.id === id 
          ? { ...state.player, ...playerData, updatedAt: Timestamp.fromDate(new Date()) } 
          : state.player,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update player',
        loading: false 
      });
      throw error;
    }
  },
  
  leaveRoom: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'players'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Player with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'players', querySnapshot.docs[0].id);
      
      // Delete the document
      await deleteDoc(docRef);
      
      // Update the local state
      set({ 
        player: null,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to leave room',
        loading: false 
      });
      throw error;
    }
  },
  
  subscribeToPlayer: (id, callback) => {
    // Set up a real-time listener for a specific player
    const q = query(collection(db, 'players'), where('id', '==', id));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }
        
        const playerData = snapshot.docs[0].data() as Player;
        set({ player: playerData });
        callback(playerData);
      },
      (error) => {
        set({ 
          error: error.message,
          loading: false 
        });
      }
    );
    
    return unsubscribe;
  }
})); 