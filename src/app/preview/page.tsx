import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PreviewPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Preview</h1>
      <div className="flex gap-4">
        <Link href="/preview/categories">
          <Button size="lg" className="text-lg px-8 py-6">
            Categorias
          </Button>
        </Link>
        <Link href="/preview/store">
          <Button size="lg" className="text-lg px-8 py-6">
            Loja
          </Button>
        </Link>
      </div>
    </div>
  );
}
