'use server';

import { notFound } from 'next/navigation';
import { getOpenGovernmentCardsByCategory } from '@/lib/data';
import { openGovCategoriesProperties } from '@/lib/categories-properties';
import { OpenGovCategoryClient } from './client';

interface OpenGovCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OpenGovCategoryPage({ params }: OpenGovCategoryPageProps) {
  const { id } = await params;
  
  // Convert id back to category name
  const categoryName = decodeURIComponent(id);

  // Check if this is a valid open government category
  if (!openGovCategoriesProperties[categoryName]) {
    return notFound();
  }
  
  // Get initial cards for this category
  const initialCards = await getOpenGovernmentCardsByCategory(categoryName);
  
  return (
    <OpenGovCategoryClient
      categoryName={categoryName}
      initialCards={initialCards}
      cardBg={openGovCategoriesProperties[categoryName].cardBg}
    />
  );
}
