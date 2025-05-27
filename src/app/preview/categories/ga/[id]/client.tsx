'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GameCardOpenGov } from '@/components/GameCardOpenGov';
import { useAppStore } from '@/lib/store';
import type { OpenGovernmentCard } from '@/lib/data';
import { openGovCategoriesProperties } from '@/lib/categories-properties';

interface OpenGovCategoryClientProps {
  categoryName: string;
  initialCards: OpenGovernmentCard[];
  cardBg: string;
}

export function OpenGovCategoryClient({ categoryName, initialCards, cardBg }: OpenGovCategoryClientProps) {
  const [cards, setCards] = useState<OpenGovernmentCard[]>(initialCards);
  const { activeOpenGovCategory, fetchOpenGovCategory } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchOpenGovCategory(categoryName);
    setLoading(false);
  }, [categoryName, fetchOpenGovCategory]);

  // Update cards when activeOpenGovCategory changes
  useEffect(() => {
    if (activeOpenGovCategory && activeOpenGovCategory.name === categoryName) {
      setCards(activeOpenGovCategory.cards);
    }
  }, [activeOpenGovCategory, categoryName]);

  // Get category properties
  const properties = openGovCategoriesProperties[categoryName];

  // If loading, show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 
        className="text-3xl font-bold mb-8"
        style={{ color: properties?.color }}
      >
        {categoryName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <GameCardOpenGov
            key={card.id}
            card={card}
            categoryName={categoryName}
            cardBg={cardBg}
          />
        ))}
      </div>

      <div className="mt-8">
        <Link href="/preview/categories">
          <Button 
            variant="outline"
            style={{
              borderColor: properties?.color,
              color: properties?.color,
            }}
          >
            Voltar
          </Button>
        </Link>
      </div>
    </div>
  );
}
