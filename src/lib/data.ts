import modelData from '../../model.json';

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
  cards: Card[];
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

export const getCategories = (): Category[] => {
  return modelData.categories;
};

export const getCategory = (id: string): Category | undefined => {
  return getCategories().find(category => category.id === id);
};

export const getItems = (): Item[] => {
  return modelData.items;
};

export const getItemsByCategory = (categoryId: string): Item[] => {
  return getItems().filter(item => item.category_id === categoryId);
};

export const getCategoryNameById = (categoryId: string): string => {
  const category = getCategory(categoryId);
  return category ? category.name : 'Unknown Category';
};

// Calculate average points for a card
export const calculateCardAverage = (metrics: Metric[]): number => {
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, metric) => acc + metric.points, 0);
  return Math.round((sum / metrics.length) * 10) / 10; // Round to 1 decimal place
}; 