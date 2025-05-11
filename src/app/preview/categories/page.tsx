import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/data';

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Categorias</h1>
      
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
      
      <div className="mt-8">
        <Link href="/preview">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    </div>
  );
} 