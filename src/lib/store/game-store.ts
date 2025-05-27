import { create } from 'zustand';
import { getCategoriesWithCards, selectRandomCardsFromCategories, selectRandomAdvantageAndUnforeseen, type Category, type Card as GameCard, type AdvantageUnforeseenCard } from '@/lib/data';
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

// Create a custom nanoid function that generates a shorter ID for cities
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export interface CardWithCategory {
  card: GameCard;
  categoryName: string;
  categoryId: string;
  points: number;
}

export interface City {
  id: string;
  roomId: string;
  cityId: number; // ID of the city within the room
  name: string;
  playerCount: number;
  state: 'drawing' | 'ready' | 'finished';
  initial_budget: number;
  budget: number;
  /** Categoria Nome -> Pontos */
  points: Record<string, number>;
  initial_points: Record<string, number>;
  /** Items purchased by this city */
  items: string[]; // Array of item IDs
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
    categoryId: string;
    points: number;
  }[];
  advantage_disadvantage_cards?: {
    id: string;
    type: 'Vantagem' | 'Imprevisto';
    text: string;
    effect: string;
    category_id: string;
    points?: number;
    dindins?: number;
  }[];
  open_government_cards?: {
    id: string;
    category: string;
    text: string;
    price: number;
    reward: {
      type: "dindins" | "points";
      quantity: number;
      category_id?: string;
    };
  }[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface GameState {
  // Game State
  dindins: number | undefined;
  situationCards: CardWithCategory[] | undefined;
  advantageDisadvantageCards: AdvantageUnforeseenCard[] | undefined;
  categories: Category[];
  loadingCards: boolean;
  loadingAdvDisadvCards: boolean;
  
  // City State
  currentCity: City | null;
  loading: boolean;
  error: string | null;
  
  // Game Actions
  setDindins: (dindins: number | undefined) => void;
  setSituationCards: (cards: CardWithCategory[] | undefined) => void;
  setAdvantageDisadvantageCards: (cards: AdvantageUnforeseenCard[] | undefined) => void;
  setCategories: (categories: Category[]) => void;
  setLoadingCards: (loading: boolean) => void;
  setLoadingAdvDisadvCards: (loading: boolean) => void;
  
  // City Actions
  setCurrentCity: (city: City | null) => void;
  
  // Room Management
  roomExists: (roomId: string) => Promise<boolean>;
  joinRoom: (roomId: string, cityName: string, playerCount: number) => Promise<City | null>;
  
  // City Management
  getCity: (id: string) => Promise<City | null>;
  updateCity: (id: string, cityData: Partial<City>) => Promise<void>;
  leaveRoom: (id: string) => Promise<void>;
  subscribeToCity: (id: string, callback: (city: City | null) => void) => () => void;
  
  // Async Game Actions
  loadCategories: () => Promise<void>;
  generateRandomDindins: () => number;
  generateSituationCards: () => CardWithCategory[] | null;
  generateAdvantageDisadvantageCards: () => Promise<AdvantageUnforeseenCard[] | null>;
  
  // Reset actions
  resetGameState: () => void;
  resetDindins: () => void;
  resetSituationCards: () => void;
  resetAdvantageDisadvantageCards: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial game state
  dindins: undefined,
  situationCards: undefined,
  advantageDisadvantageCards: undefined,
  categories: [],
  loadingCards: false,
  loadingAdvDisadvCards: false,
  
  // Initial city state
  currentCity: null,
  loading: false,
  error: null,
  
  // Game setters
  setDindins: (dindins) => set({ dindins }),
  setSituationCards: (situationCards) => set({ situationCards }),
  setAdvantageDisadvantageCards: (advantageDisadvantageCards) => set({ advantageDisadvantageCards }),
  setCategories: (categories) => set({ categories }),
  setLoadingCards: (loadingCards) => set({ loadingCards }),
  setLoadingAdvDisadvCards: (loadingAdvDisadvCards) => set({ loadingAdvDisadvCards }),
  
  // City setters
  setCurrentCity: (city) => set({ currentCity: city }),
  
  // Room Management
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
      
      // Create a city object for the room
      const roomCity = {
        id: cityId,
        name: cityName,
        state: 'drawing' as const,
        initial_budget: 0,
        budget: 0,
        points: {},
        initial_points: {},
        items: [],
      };

      // Add the city to the room
      const updatedCities = [...(roomData.cities || []), roomCity];
      await updateDoc(doc(db, 'rooms', querySnapshot.docs[0].id), {
        cities: updatedCities,
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      // Create a new city record for tracking the player's session
      const id = nanoid();
      const timestamp = new Date();
      
      const newCity: City = {
        id,
        roomId,
        cityId,
        name: cityName,
        playerCount,
        state: 'drawing',
        initial_budget: 0,
        budget: 0,
        points: {},
        initial_points: {},
        items: [],
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      };
      
      // Add the city to Firestore cities collection for session tracking
      await addDoc(collection(db, 'cities'), newCity);
      
      // Update local state
      set({ 
        currentCity: newCity,
        loading: false 
      });
      
      return newCity;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join room',
        loading: false 
      });
      return null;
    }
  },

  // City Management
  getCity: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Query Firestore for the city with matching id
      const q = query(collection(db, 'cities'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        set({ loading: false });
        return null;
      }
      
      // Get the city data
      const cityData = querySnapshot.docs[0].data() as City;
      set({ 
        currentCity: cityData,
        loading: false 
      });
      
      return cityData;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get city',
        loading: false 
      });
      return null;
    }
  },
  
  updateCity: async (id, cityData) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'cities'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`City with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'cities', querySnapshot.docs[0].id);
      
      // Update the document
      const updatedCity = {
        ...cityData,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updatedCity);
      
      // Update the local state
      set((state) => ({
        currentCity: state.currentCity && state.currentCity.id === id 
          ? { ...state.currentCity, ...cityData, updatedAt: Timestamp.fromDate(new Date()) } 
          : state.currentCity,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update city',
        loading: false 
      });
      throw error;
    }
  },
  
  leaveRoom: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Find the document in Firestore
      const q = query(collection(db, 'cities'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`City with id ${id} not found`);
      }
      
      // Get the document reference
      const docRef = doc(db, 'cities', querySnapshot.docs[0].id);
      
      // Delete the document
      await deleteDoc(docRef);
      
      // Update the local state
      set({ 
        currentCity: null,
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
  
  subscribeToCity: (id, callback) => {
    // Set up a real-time listener for a specific city
    const q = query(collection(db, 'cities'), where('id', '==', id));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }
        
        const cityData = snapshot.docs[0].data() as City;
        set({ currentCity: cityData });
        callback(cityData);
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
  
  // Async game actions
  loadCategories: async () => {
    set({ loadingCards: true });
    try {
      const categoriesData = await getCategoriesWithCards();
      set({ categories: categoriesData });
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      set({ loadingCards: false });
    }
  },
  
  generateRandomDindins: () => {
    // 1. de 40 mil a 400 mil
    // 2. tem que ser múltiplo de 100
    const min = 130000;
    const max = 400000;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    const multipleOf100 = Math.floor(random / 100) * 100;
    set({ dindins: multipleOf100 });
    return multipleOf100;
  },
  
  generateSituationCards: () => {
    const { categories } = get();
    if (categories.length > 0) {
      const selectedCards = selectRandomCardsFromCategories(categories);
      set({ situationCards: selectedCards });
      return selectedCards;
    }
    return null;
  },
  
  generateAdvantageDisadvantageCards: async () => {
    set({ loadingAdvDisadvCards: true });
    try {
      const selectedCards = await selectRandomAdvantageAndUnforeseen();
      set({ advantageDisadvantageCards: selectedCards });
      return selectedCards;
    } catch (error) {
      console.error('Error selecting advantage/disadvantage cards:', error);
      return null;
    } finally {
      set({ loadingAdvDisadvCards: false });
    }
  },
  
  // Reset actions
  resetGameState: () => set({
    dindins: undefined,
    situationCards: undefined,
    advantageDisadvantageCards: undefined,
  }),
  
  resetDindins: () => set({ dindins: undefined }),
  resetSituationCards: () => set({ situationCards: undefined }),
  resetAdvantageDisadvantageCards: () => set({ advantageDisadvantageCards: undefined }),
})); 