import { Skeleton } from "@/components/ui/skeleton";
import { categoriesProperties } from "@/lib/categories-properties";
interface GameCardSkeletonProps {
  categoryName?: string;
  className?: string;
}

export function GameCardSkeleton({ categoryName = "Infraestrutura", className = "" }: GameCardSkeletonProps) {
  const bgImage = categoriesProperties[categoryName] || categoriesProperties['Infraestrutura'];

  return (
    <div
      className={`w-full relative card ${className}`}
      style={{
        backgroundImage: `url(${bgImage.cardBg})`,
        aspectRatio: '264/405',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '16px',
      }}
    >
      <div className="px-8 absolute left-0 right-0 h-3/5 top-3/10">
        <div className="w-full h-full flex flex-col items-center pt-2 gap-[2%]">
          <Skeleton 
            className="h-8 w-32 mb-2"
            style={{
              backgroundColor: `${bgImage.color}20`,
            }}
          />
          <div className="ml-[12%] mr-[5%] w-full space-y-2">
            <Skeleton className="h-4 w-full bg-gray-300/50" />
            <Skeleton className="h-4 w-3/4 bg-gray-300/50" />
            <Skeleton className="h-4 w-5/6 bg-gray-300/50" />
          </div>
        </div>
      </div>
    </div>
  );
} 