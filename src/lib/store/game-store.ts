import { create } from 'zustand';
import { getCategoriesWithCards, selectRandomCardsFromCategories, selectRandomAdvantageAndUnforeseen, type Category, type Card as GameCard, type AdvantageUnforeseenCard } from '@/lib/data';

export interface CardWithCategory {
  card: GameCard;
  categoryName: string;
}

interface GameState {
  // State
  dindins: number | undefined;
  situationCards: CardWithCategory[] | undefined;
  advantageDisadvantageCards: AdvantageUnforeseenCard[] | undefined;
  categories: Category[];
  loadingCards: boolean;
  loadingAdvDisadvCards: boolean;
  
  // Actions
  setDindins: (dindins: number | undefined) => void;
  setSituationCards: (cards: CardWithCategory[] | undefined) => void;
  setAdvantageDisadvantageCards: (cards: AdvantageUnforeseenCard[] | undefined) => void;
  setCategories: (categories: Category[]) => void;
  setLoadingCards: (loading: boolean) => void;
  setLoadingAdvDisadvCards: (loading: boolean) => void;
  
  // Async actions
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
  // Initial state
  dindins: undefined,
  situationCards: undefined,
  advantageDisadvantageCards: undefined,
  categories: [],
  loadingCards: false,
  loadingAdvDisadvCards: false,
  
  // Basic setters
  setDindins: (dindins) => set({ dindins }),
  setSituationCards: (situationCards) => set({ situationCards }),
  setAdvantageDisadvantageCards: (advantageDisadvantageCards) => set({ advantageDisadvantageCards }),
  setCategories: (categories) => set({ categories }),
  setLoadingCards: (loadingCards) => set({ loadingCards }),
  setLoadingAdvDisadvCards: (loadingAdvDisadvCards) => set({ loadingAdvDisadvCards }),
  
  // Async actions
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
    const min = 40000;
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