'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { openGovCategoriesProperties } from '@/lib/categories-properties';

export default function CategoriesPage() {
  const { 
    categories, 
    fetchCategories, 
    subscribeToCategories, 
    loadingCategories,
    openGovCategories,
    fetchOpenGovCategories,
    loadingOpenGovCategories 
  } = useAppStore();
  
  useEffect(() => {
    // Fetch initial data
    fetchCategories();
    fetchOpenGovCategories();
    
    // Set up realtime subscription for regular categories
    const unsubscribe = subscribeToCategories();
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [fetchCategories, subscribeToCategories, fetchOpenGovCategories]);

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

      <h1 className="text-3xl font-bold my-8">Categorias Governo Aberto</h1>

      {loadingOpenGovCategories && openGovCategories.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg">Carregando categorias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openGovCategories.map((category) => {
            const properties = openGovCategoriesProperties[category.name];
            return (
              <Link key={category.id} href={`/preview/categories/ga/${category.id}`}>
                <Button 
                  variant="outline" 
                  className="w-full h-24 text-lg border-2"
                  style={{
                    borderColor: properties?.color,
                    color: properties?.color,
                  }}
                >
                  {category.name}
                </Button>
              </Link>
            );
          })}
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