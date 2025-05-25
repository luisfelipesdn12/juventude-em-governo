import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export interface Metric {
  id: string;
  text: string;
  points: number;
}

export interface Card {
  id: string;
  metrics: Metric[];
}

export interface Category {
  id: string;
  name: string;
  cards?: Card[];
}

export interface ItemMetric {
  id: string;
  points_percentage_increase: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  category_id: string;
  metrics: ItemMetric[];
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategory = async (id: string): Promise<Category | undefined> => {
  try {
    const categoryRef = doc(db, 'categories', id);
    const categoryDoc = await getDoc(categoryRef);
    
    if (!categoryDoc.exists()) {
      return undefined;
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
    
    return category;
  } catch (error) {
    console.error('Error getting category:', error);
    return undefined;
  }
};

export const getItems = async (): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    return itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      price: doc.data().price,
      category_id: doc.data().category_id,
      metrics: doc.data().metrics,
    }));
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
};

export const getItemsByCategory = async (categoryId: string): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, where('category_id', '==', categoryId));
    const itemsSnapshot = await getDocs(q);
    return itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      price: doc.data().price,
      category_id: doc.data().category_id,
      metrics: doc.data().metrics,
    }));
  } catch (error) {
    console.error('Error getting items by category:', error);
    return [];
  }
};

export const getCategoryNameById = async (categoryId: string): Promise<string> => {
  try {
    const category = await getCategory(categoryId);
    return category ? category.name : 'Unknown Category';
  } catch (error) {
    console.error('Error getting category name:', error);
    return 'Unknown Category';
  }
};

// Calculate average points for a card
export const calculateCardAverage = (metrics: Metric[]): number => {
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, metric) => acc + metric.points, 0);
  return Math.round((sum / metrics.length) * 10) / 10; // Round to 1 decimal place
};

export const getCategoriesWithCards = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    const categories: Category[] = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const category: Category = {
        id: categoryDoc.id,
        name: categoryDoc.data().name,
      };
      
      // Get cards for this category
      const cardsRef = collection(db, `categories/${categoryDoc.id}/cards`);
      const cardsSnapshot = await getDocs(cardsRef);
      
      category.cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        metrics: doc.data().metrics,
      }));
      
      categories.push(category);
    }
    
    return categories;
  } catch (error) {
    console.error('Error getting categories with cards:', error);
    return [];
  }
};

// Function to randomly select one card from each category
export const selectRandomCardsFromCategories = (categories: Category[]): { card: Card; categoryName: string }[] => {
  const selectedCards: { card: Card; categoryName: string }[] = [];
  
  for (const category of categories) {
    if (category.cards && category.cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * category.cards.length);
      const selectedCard = category.cards[randomIndex];
      selectedCards.push({
        card: selectedCard,
        categoryName: category.name,
      });
    }
  }
  
  return selectedCards;
}; 