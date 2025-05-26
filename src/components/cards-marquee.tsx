import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCard } from "./GameCard";
import { GameCardSkeleton } from "./GameCardSkeleton";
import { FullscreenCardsOverlay } from "./FullscreenCardsOverlay";
import { useState } from "react";
import { type CardWithCategory } from "@/lib/store/game-store";

interface CardsMarqueeProps {
  cards?: CardWithCategory[];
}

export function CardsMarquee({ cards }: CardsMarqueeProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  const handleCardClick = (index: number) => {
    setSelectedCardIndex(index);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
  };

  // If no cards provided, show skeleton cards
  if (!cards || cards.length === 0) {
    const skeletonCards = Array.from({ length: 6 }, (_, index) => (
      <CarouselItem key={`skeleton-${index}`} className="basis-1/3">
        <div className="p-1">
          <GameCardSkeleton
            categoryName={["Infraestrutura", "Educação", "Moradia", "População", "Saúde", "Esporte, Cultura e Lazer"][index % 6]}
          />
        </div>
      </CarouselItem>
    ));

    return (
      <div className="relative flex w-full flex-col items-center justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl"
        >
          <CarouselContent className="h-80">
            {skeletonCards}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex w-full flex-col items-center justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl"
        >
          <CarouselContent className="">
            {cards.map(({ card, categoryName }, index) => (
              <CarouselItem key={`${card.id}-${index}`} className="basis-2/5">
                <div className="p-1">
                  <GameCard
                    card={card}
                    categoryName={categoryName}
                    onClick={() => handleCardClick(index)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <FullscreenCardsOverlay
        cards={cards}
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        initialIndex={selectedCardIndex}
      />
    </>
  );
}

export default CardsMarquee;
