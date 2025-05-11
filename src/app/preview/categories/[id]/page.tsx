import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { getCategory, calculateCardAverage } from '@/lib/data';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = getCategory(id);

  if (!category) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.cards.map((card) => {
          const avgPoints = calculateCardAverage(card.metrics);
          
          return (
            <Card key={card.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Carta {card.id}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
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