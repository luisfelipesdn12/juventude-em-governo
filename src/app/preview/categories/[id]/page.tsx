'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { calculateCardAverage } from '@/lib/data';
import { useAppStore } from '@/lib/store';

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = params;
  const { activeCategory, fetchCategory, subscribeToCategory, loadingCategory } = useAppStore();
  
  useEffect(() => {
    // Fetch initial data
    fetchCategory(id);
    
    // Set up realtime subscription
    const unsubscribe = subscribeToCategory(id);
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [id, fetchCategory, subscribeToCategory]);

  // If loading, show loading state
  if (loadingCategory && !activeCategory) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carregando...</h1>
      </div>
    );
  }

  // If category not found, show 404
  if (!activeCategory) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{activeCategory.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategory.cards?.map((card) => {
          const avgPoints = calculateCardAverage(card.metrics);
          
          return (
            <Card key={card.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Carta {card.id}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 list-disc">
                  {card.metrics.map((metric) => (
                    <li key={metric.id} className="text-sm">
                      {metric.text} ({metric.points}%)
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="text-lg font-semibold">
                  Média: {avgPoints}%
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Link href="/preview/categories">
          <Button variant="outline">Voltar para Categorias</Button>
        </Link>
      </div>
    </div>
  );
} 