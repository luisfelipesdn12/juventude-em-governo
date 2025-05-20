'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function CategoriesPage() {
  const { categories, fetchCategories, subscribeToCategories, loadingCategories } = useAppStore();
  
  useEffect(() => {
    // Fetch initial data
    fetchCategories();
    
    // Set up realtime subscription
    const unsubscribe = subscribeToCategories();
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [fetchCategories, subscribeToCategories]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Categorias</h1>
      
      {loadingCategories && categories.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg">Carregando categorias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/preview/categories/${category.id}`}>
              <Button 
                variant="outline" 
                className="w-full h-24 text-lg"
                >
                {category.name}
              </Button>
            </Link>
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