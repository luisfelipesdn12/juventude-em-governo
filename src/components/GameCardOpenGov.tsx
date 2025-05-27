import { type OpenGovernmentCard } from '@/lib/data';
// import { openGovCategoriesProperties } from '@/lib/categories-properties';

interface GameCardOpenGovProps {
  card: OpenGovernmentCard;
  categoryName: string;
  cardBg: string;
  className?: string;
  onClick?: () => void;
}

export function GameCardOpenGov({ card, categoryName, cardBg, className = "", onClick }: GameCardOpenGovProps) {
  // const properties = openGovCategoriesProperties[categoryName];

  return (
    <div
      className={`w-full relative card cursor-grab select-none ${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={{
        backgroundImage: `url(${cardBg})`,
        aspectRatio: '264/405',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '16px',
      }}
      onClick={onClick}
    >
      <div className="px-8 absolute left-0 right-0 h-3/5 top-2/10">
        <div className="w-full h-full flex flex-col items-center gap-[5%]">
          <h1
            className="text-[220%] lg:text-[150%] xl:text-[130%] 2xl:text-[140%] font-bold font-['peachy-keen-jf']"
          >
            {categoryName}
          </h1>
          <div className="w-full text-white space-y-2 text-center">
            <p className="text-[150%] sm:text-[150%] lg:text-[115%] xl:text-[95%] 2xl:text-[85%]">
              {card.text}
              {card.reward.type === 'dindins' && (
                <>
                  <br className="" />
                  D$ {card.reward.quantity}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 