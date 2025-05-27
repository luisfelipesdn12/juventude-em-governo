import { create } from 'zustand';
import { db } from './firebase';
import { collection, doc, onSnapshot, query, getDocs, getDoc, where } from 'firebase/firestore';
import type { Category, Item, OpenGovernmentCard } from './data';
import { openGovCategoriesProperties } from './categories-properties';

// Define the store state
interface AppState {
  // Categories
  categories: Category[];
  loadingCategories: boolean;
  fetchCategories: () => Promise<void>;
  subscribeToCategories: () => () => void;
  
  // Open Government Categories
  openGovCategories: Array<{ id: string; name: string }>;
  loadingOpenGovCategories: boolean;
  fetchOpenGovCategories: () => void;
  
  // Active Category
  activeCategory: Category | null;
  loadingCategory: boolean;
  fetchCategory: (id: string) => Promise<void>;
  subscribeToCategory: (id: string) => () => void;
  
  // Active Open Government Category
  activeOpenGovCategory: { id: string; name: string; cards: OpenGovernmentCard[] } | null;
  loadingOpenGovCategory: boolean;
  fetchOpenGovCategory: (categoryName: string) => Promise<void>;
  
  // Items
  items: Item[];
  loadingItems: boolean;
  fetchItems: () => Promise<void>;
  fetchItemsByCategory: (categoryId: string) => Promise<void>;
  subscribeToItems: () => () => void;
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  // Categories
  categories: [],
  loadingCategories: false,
  fetchCategories: async () => {
    try {
      set({ loadingCategories: true });
      const categoriesRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      set({ categories: categoriesData, loadingCategories: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ loadingCategories: false });
    }
  },
  subscribeToCategories: () => {
    const categoriesRef = collection(db, 'categories');
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      set({ categories: categoriesData });
    }, (error) => {
      console.error('Error in categories subscription:', error);
    });
    
    return unsubscribe;
  },
  
  // Open Government Categories
  openGovCategories: [],
  loadingOpenGovCategories: false,
  fetchOpenGovCategories: () => {
    // Open government categories are static, defined in the properties file
    const openGovCategoriesData = Object.keys(openGovCategoriesProperties).map((name) => ({
      id: name,
      name: name,
    }));
    set({ openGovCategories: openGovCategoriesData });
  },
  
  // Active Category
  activeCategory: null,
  loadingCategory: false,
  fetchCategory: async (id: string) => {
    try {
      set({ loadingCategory: true });
      const categoryRef = doc(db, 'categories', id);
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        set({ activeCategory: null, loadingCategory: false });
        return;
      }
      
      const category: Category = {
        id: categoryDoc.id,
        name: categoryDoc.data().name,
      };
      
      // Get cards for this category
      const cardsRef = collection(db, `categories/${id}/cards`);
      const cardsSnapshot = await getDocs(cardsRef);
      
      category.cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        metrics: doc.data().metrics,
      }));
      
      set({ activeCategory: category, loadingCategory: false });
    } catch (error) {
      console.error('Error fetching category:', error);
      set({ loadingCategory: false });
    }
  },
  subscribeToCategory: (id: string) => {
    // Subscribe to the category document
    const categoryRef = doc(db, 'categories', id);
    const categoryUnsubscribe = onSnapshot(categoryRef, async (docSnapshot) => {
      if (!docSnapshot.exists()) {
        set({ activeCategory: null });
        return;
      }
      
      const category: Category = {
        id: docSnapshot.id,
        name: docSnapshot.data().name,
      };
      
      // Subscribe to cards subcollection
      const cardsRef = collection(db, `categories/${id}/cards`);
      const cardsSnapshot = await getDocs(cardsRef);
      
      category.cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        metrics: doc.data().metrics,
      }));
      
      set({ activeCategory: category });
    }, (error) => {
      console.error('Error in category subscription:', error);
    });
    
    return categoryUnsubscribe;
  },
  
  // Active Open Government Category
  activeOpenGovCategory: null,
  loadingOpenGovCategory: false,
  fetchOpenGovCategory: async (categoryName: string) => {
    try {
      set({ loadingOpenGovCategory: true });
      
      const category: { id: string; name: string; cards: OpenGovernmentCard[] } = {
        id: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/,/g, ''),
        name: categoryName,
        cards: [],
      };
      
      // Get cards for this category from open_government_cards collection
      const cardsRef = collection(db, 'open_government_cards');
      const q = query(cardsRef, where('category', '==', categoryName));
      const cardsSnapshot = await getDocs(q);
      
      category.cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.data().category,
        text: doc.data().text,
        price: doc.data().price,
        reward: doc.data().reward,
      }));
      
      set({ activeOpenGovCategory: category, loadingOpenGovCategory: false });
    } catch (error) {
      console.error('Error fetching open government category:', error);
      set({ loadingOpenGovCategory: false });
    }
  },
  
  // Items
  items: [],
  loadingItems: false,
  fetchItems: async () => {
    try {
      set({ loadingItems: true });
      const itemsRef = collection(db, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      const itemsData = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        category_id: doc.data().category_id,
        metrics: doc.data().metrics,
      }));
      set({ items: itemsData, loadingItems: false });
    } catch (error) {
      console.error('Error fetching items:', error);
      set({ loadingItems: false });
    }
  },
  fetchItemsByCategory: async (categoryId: string) => {
    try {
      set({ loadingItems: true });
      const itemsRef = collection(db, 'items');
      const q = query(itemsRef, where('category_id', '==', categoryId));
      const itemsSnapshot = await getDocs(q);
      const itemsData = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        category_id: doc.data().category_id,
        metrics: doc.data().metrics,
      }));
      set({ items: itemsData, loadingItems: false });
    } catch (error) {
      console.error('Error fetching items by category:', error);
      set({ loadingItems: false });
    }
  },
  subscribeToItems: () => {
    const itemsRef = collection(db, 'items');
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        category_id: doc.data().category_id,
        metrics: doc.data().metrics,
      }));
      set({ items: itemsData });
    }, (error) => {
      console.error('Error in items subscription:', error);
    });
    
    return unsubscribe;
  },
})); 