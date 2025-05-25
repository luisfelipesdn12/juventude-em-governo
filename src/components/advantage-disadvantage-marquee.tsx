import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCardAdvUnforeseen } from "./GameCardAdvUnforeseen";
import { type AdvantageUnforeseenCard } from "@/lib/data";
import { useState } from "react";
import { FullscreenAdvDisadvOverlay } from "./FullscreenAdvDisadvOverlay";

interface AdvantageDisadvantageMarqueeProps {
  cards?: AdvantageUnforeseenCard[];
}

export function AdvantageDisadvantageMarquee({ cards }: AdvantageDisadvantageMarqueeProps) {
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
    const skeletonCards = Array.from({ length: 2 }, (_, index) => (
      <CarouselItem key={`skeleton-${index}`} className="basis-1/3">
        <div className="p-1">
          <div
            className="w-full relative card animate-pulse"
            style={{
              aspectRatio: '264/405',
              borderRadius: '16px',
              backgroundColor: '#f3f4f6',
            }}
          >
            <div className="px-8 absolute left-0 right-0 h-3/5 top-3/10">
              <div className="w-full h-full flex flex-col items-center pt-2 gap-[10%]">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
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
            {cards.map((card, index) => (
              <CarouselItem key={`${card.id}-${index}`} className="basis-1/3">
                <div className="p-1">
                  <GameCardAdvUnforeseen
                    card={card}
                    onClick={() => handleCardClick(index)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <FullscreenAdvDisadvOverlay
        cards={cards}
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        initialIndex={selectedCardIndex}
      />
    </>
  );
}

export default AdvantageDisadvantageMarquee; 