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

// Create a custom nanoid function that generates 6 uppercase alphanumeric characters
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export interface Room {
  id: string;
  name: string;
  institution: string;
  class: string;
  settings: {
    time: number;
  };
  cities: {
    id: number;
    name: string;
    state: 'drawing' | 'ready';
    initial_budget: number;
    budget: number;
    initial_cards: {
      id: number;
      category_id: number;
    }[];
    // Random results for the game
    situation_cards?: {
      card: {
        id: string;
        metrics: {
          id: string;
          text: string;
          points: number;
        }[];
      };
      categoryName: string;
    }[];
    advantage_disadvantage_cards?: {
      id: string;
      type: 'Vantagem' | 'Imprevisto';
      text: string;
      effect: string;
      category_id: string;
      points: number;
    }[];
  }[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface RoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Omit<Room, 'id'>) => Promise<Room>;
  getRoom: (id: string) => Promise<Room | undefined>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  updateCityInRoom: (roomId: string, cityId: number, cityData: Partial<Room['cities'][0]>) => Promise<void>;
  removeCityFromRoom: (roomId: string, cityId: number) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  subscribeToRooms: (callback: (rooms: Room[]) => void) => () => void;
  subscribeToRoom: (id: string, callback: (room: Room | undefined) => void) => () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  loading: false,
  error: null,
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: async (roomData) => {
    set({ loading: true, error: null });
    
    try {
      const id = nanoid();
      const timestamp = new Date();
      
      const newRoom: Room = {
        ...roomData,
        id,
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      };

      // Add the document to Firestore
      await addDoc(collection(db, `rooms`), newRoom);

      // Update the local state
      set((state) => ({ 
        rooms: [...state.rooms, newRoom],
        loading: false 
      }));
      
      return newRoom;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add room',
        loading: false 
      });
      throw error;
    }
  },
  
  getRoom: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Query Firestore for the room with matching id
      const q = query(collection(db, 'rooms'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        set({ loading: false });
        return undefined;
      }
      
      // Get the first matching document
      const roomData = querySnapshot.docs[0].data() as Room;
      set({ loading: false });
      
      return roomData;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get room',
        loading: false 
      });
      throw error;
    }
  },
  
  updateRoom: async (id, updatedData) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'rooms'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Room with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'rooms', querySnapshot.docs[0].id);
      
      // Update the document
      const updatedRoom = {
        ...updatedData,
        updatedAt: new Date(),
      };
      
      await updateDoc(docRef, updatedRoom);
      
      // Update the local state
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === id ? { ...room, ...updatedData, updatedAt: Timestamp.fromDate(new Date()) } : room
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update room',
        loading: false 
      });
      throw error;
    }
  },
  
  updateCityInRoom: async (roomId, cityId, cityData) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'rooms'), where('id', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Room with id ${roomId} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'rooms', querySnapshot.docs[0].id);
      const currentRoom = querySnapshot.docs[0].data() as Room;
      
      // Update the document
      const updatedRoom = {
        ...currentRoom,
        cities: currentRoom.cities.map((city) =>
          city.id === cityId ? { ...city, ...cityData } : city
        ),
        updatedAt: new Date(),
      };
      
      await updateDoc(docRef, updatedRoom);
      
      // Update the local state
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === roomId ? { ...room, cities: updatedRoom.cities } : room
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update city in room',
        loading: false 
      });
      throw error;
    }
  },
  
  removeCityFromRoom: async (roomId, cityId) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'rooms'), where('id', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Room with id ${roomId} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'rooms', querySnapshot.docs[0].id);
      const currentRoom = querySnapshot.docs[0].data() as Room;
      
      // Update the document
      const updatedRoom = {
        ...currentRoom,
        cities: currentRoom.cities.filter((city) => city.id !== cityId),
        updatedAt: new Date(),
      };
      
      await updateDoc(docRef, updatedRoom);
      
      // Update the local state
      set((state) => ({
        rooms: state.rooms.map((room) =>
          room.id === roomId ? { ...room, cities: updatedRoom.cities } : room
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove city from room',
        loading: false 
      });
      throw error;
    }
  },
  
  deleteRoom: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'rooms'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Room with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'rooms', querySnapshot.docs[0].id);
      
      // Delete the document
      await deleteDoc(docRef);
      
      // Update the local state
      set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete room',
        loading: false 
      });
      throw error;
    }
  },
  
  subscribeToRooms: (callback) => {
    // Set up a real-time listener for all rooms
    const unsubscribe = onSnapshot(
      collection(db, 'rooms'),
      (snapshot) => {
        const rooms = snapshot.docs.map((doc) => doc.data() as Room);
        set({ rooms, loading: false });
        callback(rooms);
      },
      (error) => {
        set({ 
          error: error.message,
          loading: false 
        });
      }
    );
    
    return unsubscribe;
  },
  
  subscribeToRoom: (id, callback) => {
    // Set up a real-time listener for a specific room
    const q = query(collection(db, 'rooms'), where('id', '==', id));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(undefined);
          return;
        }
        
        const roomData = snapshot.docs[0].data() as Room;
        callback(roomData);
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