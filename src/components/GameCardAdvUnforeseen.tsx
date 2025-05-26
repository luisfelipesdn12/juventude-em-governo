import { type AdvantageUnforeseenCard } from '@/lib/data';

const bgImages: Record<'Vantagem' | 'Imprevisto', {
  src: string;
  color: string;
}> = {
  'Vantagem': {
    src: '/assets/fundo_cartas/frente-cartas-de-vantagem.svg',
    color: '#53B685',
  },
  'Imprevisto': {
    src: '/assets/fundo_cartas/frente-cartas-de-imprevisto.svg',
    color: '#B51641',
  },
};

interface GameCardAdvUnforeseenProps {
  card: AdvantageUnforeseenCard;
  className?: string;
  onClick?: () => void;
}

export function GameCardAdvUnforeseen({ card, className = "", onClick }: GameCardAdvUnforeseenProps) {
  const bgImage = bgImages[card.type] || bgImages['Vantagem'];

  return (
    <div
      className={`w-full relative card cursor-grab select-none ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={{
        backgroundImage: `url(${bgImage.src})`,
        aspectRatio: '264/405',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '16px',
      }}
      onClick={onClick}
    >
      <div className="px-8 absolute left-0 right-0 h-3/5 top-2/10">
        <div className="w-full h-full flex flex-col items-center pt-2 gap-[10%]">
          <h1
            className="text-[220%] lg:text-[150%] xl:text-[130%] 2xl:text-[140%] font-bold font-['peachy-keen-jf']"
            style={{
              color: bgImage.color,
            }}
          >
            {card.type}
          </h1>
          <div className="text-center" style={{
              color: bgImage.color,
            }}>
            <p className="text-[100%] font-bold">{card.text}</p>
            <p className="text-[100%]">{card.effect}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 