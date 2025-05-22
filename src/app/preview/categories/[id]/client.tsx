'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { calculateCardAverage, type Category } from '@/lib/data';
import { useAppStore } from '@/lib/store';
// import FundoCartaEducacao from '@/publicassets/fundo_cartas/frente-carta-educacao.svg';

interface CategoryClientProps {
  initialCategory: Category;
  id: string;
}

export function CategoryClient({ initialCategory, id }: CategoryClientProps) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const { subscribeToCategory } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set up realtime subscription
    const unsubscribe = subscribeToCategory(id);

    // Setup listener for category updates
    const { activeCategory } = useAppStore.getState();

    // Update the local state when the store changes
    const unsub = useAppStore.subscribe((state) => {
      if (state.activeCategory) {
        setCategory(state.activeCategory);
        setLoading(false);
      }
    });

    // Initial update if activeCategory is already available
    if (activeCategory) {
      setCategory(activeCategory);
    }

    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
      unsub();
    };
  }, [id, subscribeToCategory]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 p-6">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {category.cards?.map((card) => {
          // const avgPoints = calculateCardAverage(card.metrics);

          return (
            <div key={card.id}
              className="w-full relative card"
              style={{
                backgroundImage: `url(/assets/fundo_cartas/frente-carta-educacao.svg)`,
                aspectRatio: '264/405',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '16px',
              }}
            >
              <div className="px-8 absolute left-0 right-0 h-3/5 top-3/10">
                <div className="w-full h-full flex flex-col items-center pt-2 gap-[2%]">
                  <h1 className="text-[220%] lg:text-[150%] xl:text-[130%] 2xl:text-[140%] font-bold text-[#51BAA9] font-['peachy-keen-jf']">
                    {category.name}
                  </h1>
                  <ul className="list-disc ml-[12%] mr-[5%]">
                    {card.metrics.map((metric) => (
                      <li
                        key={metric.id}
                        className="text-gray-900 text-[150%] sm:text-[150%] lg:text-[115%] xl:text-[95%] 2xl:text-[85%]"
                      >
                        {metric.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.cards?.map((card) => {
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