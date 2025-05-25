import { type Card } from '@/lib/data';

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

interface GameCardProps {
  card: Card;
  categoryName: string;
  className?: string;
  onClick?: () => void;
}

export function GameCard({ card, categoryName, className = "", onClick }: GameCardProps) {
  const bgImage = bgImages[categoryName] || bgImages['Infraestrutura'];

  return (
    <div
      className={`w-full relative card ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
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
      <div className="px-8 absolute left-0 right-0 h-3/5 top-3/10">
        <div className="w-full h-full flex flex-col items-center pt-2 gap-[2%]">
          <h1
            className="text-[220%] lg:text-[150%] xl:text-[130%] 2xl:text-[140%] font-bold font-['peachy-keen-jf']"
            style={{
              color: bgImage.color,
            }}
          >
            {categoryName}
          </h1>
          <ul className="list-disc ml-[12%] mr-[5%]">
            {card.metrics.map((metric) => (
              <li
                key={metric.id}
                className="text-gray-900 text-[150%] sm:text-[150%] lg:text-[115%] xl:text-[95%] 2xl:text-[85%]"
              >
                {metric.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 