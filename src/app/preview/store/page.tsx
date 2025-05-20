'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { Item } from '@/lib/data';

// Extend the Item type to include categoryName
interface ItemWithCategory extends Item {
  categoryName: string;
}

export default function StorePage() {
  const { items, fetchItems, subscribeToItems, categories, fetchCategories, loadingItems } = useAppStore();
  const [itemsWithCategories, setItemsWithCategories] = useState<ItemWithCategory[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    fetchItems();
    fetchCategories();
    
    // Set up realtime subscription
    const unsubItems = subscribeToItems();
    
    // Clean up subscription when component unmounts
    return () => {
      unsubItems();
    };
  }, [fetchItems, fetchCategories, subscribeToItems]);
  
  // Process items with category names
  useEffect(() => {
    if (items.length > 0 && categories.length > 0) {
      const processedItems = items.map(item => {
        const category = categories.find(cat => cat.id === item.category_id);
        return {
          ...item,
          categoryName: category ? category.name : 'Unknown Category'
        };
      });
      setItemsWithCategories(processedItems);
    }
  }, [items, categories]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Loja</h1>

      {loadingItems && itemsWithCategories.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg">Carregando itens...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsWithCategories.map((item) => (
            <Card key={item.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <p><span className="font-medium">Categoria:</span> {item.categoryName}</p>
                  <p><span className="font-medium">Preço:</span> {item.price} Dindins</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/preview">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    </div>
  );
} 