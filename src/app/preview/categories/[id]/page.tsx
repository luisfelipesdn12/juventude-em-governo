"use server";
import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/data';
import { CategoryClient } from './client';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  
  // Server-side fetch for initial data
  const initialCategory = await getCategory(id);
  
  // If category not found, show 404
  if (!initialCategory) {
    return notFound();
  }

  return <CategoryClient initialCategory={initialCategory} id={id} />;
} 