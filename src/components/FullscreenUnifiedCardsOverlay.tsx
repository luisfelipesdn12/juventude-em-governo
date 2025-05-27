import * as React from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GameCard } from "./GameCard";
import { GameCardAdvUnforeseen } from "./GameCardAdvUnforeseen";
import { GameCardOpenGov } from "./GameCardOpenGov";
import type { CarouselApi } from "@/components/ui/carousel";
import { type CardWithCategory } from "@/lib/store/game-store";
import { type AdvantageUnforeseenCard, type OpenGovernmentCard } from "@/lib/data";
import { openGovCategoriesProperties } from "@/lib/categories-properties";

type UnifiedCard = 
  | { type: 'situation'; data: CardWithCategory }
  | { type: 'advantage-disadvantage'; data: AdvantageUnforeseenCard }
  | { type: 'open-government'; data: OpenGovernmentCard };

interface FullscreenUnifiedCardsOverlayProps {
  situationCards?: CardWithCategory[];
  advantageDisadvantageCards?: AdvantageUnforeseenCard[];
  openGovernmentCards?: OpenGovernmentCard[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function FullscreenUnifiedCardsOverlay({ 
  situationCards = [],
  advantageDisadvantageCards = [],
  openGovernmentCards = [],
  isOpen, 
  onClose, 
  initialIndex = 0 
}: FullscreenUnifiedCardsOverlayProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(initialIndex);

  // Combine all cards into a single array for the carousel
  const allCards: UnifiedCard[] = [
    ...situationCards.map(item => ({
      type: 'situation' as const,
      data: item
    })),
    ...advantageDisadvantageCards.map(item => ({
      type: 'advantage-disadvantage' as const,
      data: item
    })),
    ...openGovernmentCards.map(item => ({
      type: 'open-government' as const,
      data: item
    }))
  ];

  React.useEffect(() => {
    if (!api) return;

    // Set initial slide
    api.scrollTo(initialIndex);
    setCurrent(initialIndex);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, initialIndex]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || allCards.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Card counter */}
        <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-2 text-white">
          {current + 1} / {allCards.length}
        </div>

        {/* Carousel */}
        <Carousel 
          className="w-full max-w-md"
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {allCards.map((item, index) => (
              <CarouselItem key={`${item.type}-${index}`}>
                <div className="p-1">
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      {item.type === 'situation' ? (
                        <GameCard
                          card={item.data.card}
                          categoryName={item.data.categoryName}
                          className="cursor-default"
                        />
                      ) : item.type === 'advantage-disadvantage' ? (
                        <GameCardAdvUnforeseen
                          card={item.data}
                          className="cursor-default"
                        />
                      ) : (
                        <GameCardOpenGov
                          card={item.data}
                          categoryName={item.data.category}
                          cardBg={openGovCategoriesProperties[item.data.category].cardBg}
                          className="cursor-default"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
          <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
        </Carousel>
      </div>
    </div>
  );
} 