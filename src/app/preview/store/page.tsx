import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { getItems, getCategoryNameById } from '@/lib/data';

export default function StorePage() {
  const items = getItems();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Loja</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <p><span className="font-medium">Categoria:</span> {getCategoryNameById(item.category_id)}</p>
                <p><span className="font-medium">Preço:</span> {item.price} Dindins</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/preview">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    </div>
  );
} 