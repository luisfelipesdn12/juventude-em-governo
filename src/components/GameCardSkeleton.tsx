import { Skeleton } from "@/components/ui/skeleton";

const bgImages: Record<string, {
  src: string;
  color: string;
}> = {
  'Infraestrutura': {
    src: '/assets/fundo_cartas/frente-carta-infraestrutura.svg',
    color: '#ea5446',
  },
  'Educação': {
    src: '/assets/fundo_cartas/frente-carta-educacao.svg',
    color: '#51BAA9',
  },
  'Moradia': {
    src: '/assets/fundo_cartas/frente-carta-moradia.svg',
    color: '#701954',
  },
  'População': {
    src: '/assets/fundo_cartas/frente-carta-populacao.svg',
    color: '#fab510',
  },
  'Saúde': {
    src: '/assets/fundo_cartas/frente-carta-saude.svg',
    color: '#3567b0',
  },
  'Esporte, Cultura e Lazer': {
    src: '/assets/fundo_cartas/frente-carta-esporte-cultura-lazer.svg',
    color: '#826bad',
  },
  'Transporte': {
    src: '/assets/fundo_cartas/frente-carta-transporte.svg',
    color: '#e7236b',
  },
};

interface GameCardSkeletonProps {
  categoryName?: string;
  className?: string;
}

export function GameCardSkeleton({ categoryName = "Infraestrutura", className = "" }: GameCardSkeletonProps) {
  const bgImage = bgImages[categoryName] || bgImages['Infraestrutura'];

  return (
    <div
      className={`w-full relative card ${className}`}
      style={{
        backgroundImage: `url(${bgImage.src})`,
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