import { type Card } from '@/lib/data';
import { categoriesProperties } from '@/lib/categories-properties';

interface GameCardProps {
  card: Card;
  categoryName: string;
  className?: string;
  onClick?: () => void;
}

export function GameCard({ card, categoryName, className = "", onClick }: GameCardProps) {
  const bgImage = categoriesProperties[categoryName] || categoriesProperties['Infraestrutura'];

  return (
    <div
      className={`w-full relative card cursor-grab select-none ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={{
        backgroundImage: `url(${bgImage.cardBg})`,
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
                className="flex items-start gap-1 text-gray-900 text-[150%] sm:text-[150%] lg:text-[115%] xl:text-[95%] 2xl:text-[85%]"
              >
                <svg className="min-w-max mt-0.5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill={bgImage.color} d="M8 19V5l11 7z"></path></svg>
                {metric.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 