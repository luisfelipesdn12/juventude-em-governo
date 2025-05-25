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
import { GameCardAdvUnforeseen } from "./GameCardAdvUnforeseen";
import { type AdvantageUnforeseenCard } from "@/lib/data";
import type { CarouselApi } from "@/components/ui/carousel";

interface FullscreenAdvDisadvOverlayProps {
  cards: AdvantageUnforeseenCard[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function FullscreenAdvDisadvOverlay({ 
  cards, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: FullscreenAdvDisadvOverlayProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(initialIndex);

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

  if (!isOpen) return null;

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
          {current + 1} / {cards.length}
        </div>

        {/* Carousel */}
        <Carousel 
          className="w-full max-w-md"
          setApi={setApi}
          opts={{
            align: "center",
            loop: false,
          }}
        >
          <CarouselContent>
            {cards.map((card, index) => (
              <CarouselItem key={`${card.id}-${index}`}>
                <div className="p-1">
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardContent className="p-0">
                      <GameCardAdvUnforeseen
                        card={card}
                        className="cursor-default"
                      />
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