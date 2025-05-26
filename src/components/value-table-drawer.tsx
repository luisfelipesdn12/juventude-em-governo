"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useGameStore } from "@/lib/store/game-store";
import { useRoomStore, Room } from "@/lib/store/room-store";
import { usePlayerStore } from "@/lib/store/player-store";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Item } from "@/lib/data";
import { categoriesProperties } from "@/lib/categories-properties";

interface ValueTableDrawerProps {
    children: React.ReactNode;
}

interface ItemWithCategory extends Item {
    categoryName: string;
}

export function ValueTableDrawer({ children }: ValueTableDrawerProps) {
    const [open, setOpen] = useState(false);
    const [itemsByCategory, setItemsByCategory] = useState<Record<string, ItemWithCategory[]>>({});
    const [currentDindins, setCurrentDindins] = useState<number>(0);
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>(undefined);
    const [currentCityData, setCurrentCityData] = useState<Room['cities'][0] | undefined>(undefined);

    // Try to get room/city info from URL params if available
    const params = useParams();
    const urlRoomId = params?.roomId as string;
    const urlCityId = params?.cityId ? parseInt(params.cityId as string) : undefined;

    // App store for items and categories
    const {
        items,
        categories,
        loadingItems,
        loadingCategories,
        fetchItems,
        fetchCategories,
        subscribeToItems,
        subscribeToCategories
    } = useAppStore();

    // Game store for budget
    const { dindins, setDindins } = useGameStore();

    // Room and player stores for real-time budget updates
    const { subscribeToRoom, updateCityInRoom } = useRoomStore();
    const { player } = usePlayerStore();

    // Load data when drawer opens
    useEffect(() => {
        if (open) {
            fetchItems();
            fetchCategories();

            // Set up real-time subscriptions
            const unsubItems = subscribeToItems();
            const unsubCategories = subscribeToCategories();

            return () => {
                unsubItems();
                unsubCategories();
            };
        }
    }, [open, fetchItems, fetchCategories, subscribeToItems, subscribeToCategories]);

    // Set up real-time room subscription to get budget updates
    useEffect(() => {
        if (open) {
            // Try to get room and city info from URL params first, then fallback to player store
            const roomId = urlRoomId || player?.roomId;
            const cityId = urlCityId || player?.cityId;

            if (roomId && cityId !== undefined) {
                const unsubscribeRoom = subscribeToRoom(roomId, (room: Room | undefined) => {
                    if (room) {
                        setCurrentRoom(room);
                        const cityData = room.cities.find(c => c.id === cityId);
                        if (cityData) {
                            setCurrentCityData(cityData);
                            // Update game store dindins with the real-time budget
                            setDindins(cityData.budget);
                            setCurrentDindins(cityData.budget);
                        }
                    }
                });

                return () => {
                    unsubscribeRoom();
                };
            }
        }
    }, [open, urlRoomId, urlCityId, player?.roomId, player?.cityId, subscribeToRoom, setDindins]);

    // Use current dindins (either from real-time updates or fallback to game store)
    const displayDindins = currentDindins || dindins || 0;

    // Process items with category names
    useEffect(() => {
        if (items.length > 0 && categories.length > 0) {
            const processedItems = items.map(item => {
                const category = categories.find(cat => cat.id === item.category_id);
                return {
                    ...item,
                    categoryName: category ? category.name : 'Categoria Desconhecida'
                };
            });

            // Group items by category
            const grouped = processedItems.reduce((acc, item) => {
                const categoryId = item.category_id;
                if (!acc[categoryId]) {
                    acc[categoryId] = [];
                }
                acc[categoryId].push(item);
                return acc;
            }, {} as Record<string, ItemWithCategory[]>);

            setItemsByCategory(grouped);
        }
    }, [items, categories]);

    // Function to handle item purchase
    const handleItemPurchase = async (item: ItemWithCategory) => {
        if (!currentRoom || !currentCityData) return;
        
        const roomId = urlRoomId || player?.roomId;
        const cityId = urlCityId || player?.cityId;
        
        if (!roomId || cityId === undefined) return;

        // Check if can buy
        const canBuy = displayDindins >= item.price;
        const alreadyBought = currentCityData.items?.includes(item.id);
        
        if (!canBuy || alreadyBought) return;

        try {
            // Calculate new budget
            const newBudget = currentCityData.budget - item.price;
            
            // Add item to purchased items
            const newItems = [...(currentCityData.items || []), item.id];
            
            // Calculate points increase based on item metrics
            const newPoints = { ...currentCityData.points };
            
            // Find the category for this item to update points
            const category = categories.find(cat => cat.id === item.category_id);
            if (category && item.metrics) {
                const categoryName = category.name;

                // Get current points for this category (default to 0 if not exists)
                const currentCategoryPoints = newPoints[categoryName] ?? 0;

                // Calculate total points increase from all metrics in this item
                const totalPointsIncrease = item.metrics.reduce((total, metric) => {
                    // Apply percentage increase to current situation card points
                    const basePoints = currentCategoryPoints ?? 0;
                    const pointsPercentage = metric.points_percentage_increase ?? 0;
                    const pointsIncrease = (basePoints * pointsPercentage) / 100;
                    return (total ?? 0) + (pointsIncrease ?? 0);
                }, 0);
                
                // Update category points
                newPoints[categoryName] = (currentCategoryPoints ?? 0) + (totalPointsIncrease ?? 0);
            }

            // Update city in room
            await updateCityInRoom(roomId, cityId, {
                budget: newBudget,
                items: newItems,
                points: newPoints
            });

        } catch (error) {
            console.error('Error purchasing item:', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
                <DrawerHeader>
                    <DrawerTitle>Tabela de Valores</DrawerTitle>
                </DrawerHeader>

                <div className="px-4 pb-4 overflow-y-auto flex-1">
                    {loadingItems || loadingCategories ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Carregando itens...</span>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                        </div>
                    ) : (
                        <Tabs defaultValue={categories[0]?.id} className="w-full">
                            <TabsList className="flex w-full">
                                {categories.map((category) => (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id}
                                        title={category.name}
                                    >
                                        <div className="aspect-square w-full rounded-full bg-muted-foreground" style={{
                                            backgroundColor: categoriesProperties[category.name]?.color,
                                            backgroundImage: `url(${categoriesProperties[category.name]?.icon})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }}>

                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categories.map((category) => (
                                <TabsContent key={category.id} value={category.id} className="space-y-3">
                                    {itemsByCategory[category.id]?.length > 0 ? (
                                        <div className="grid gap-3">
                                            {itemsByCategory[category.id].map((item) => {
                                                const canBuy = displayDindins && displayDindins >= item.price;
                                                const alreadyBought = currentCityData?.items?.includes(item.id) || false;

                                                return (
                                                    <Card key={item.id}
                                                        className="p-3 px-8 rounded-full cursor-pointer transition-all hover:scale-[1.02]"
                                                        style={{
                                                            backgroundColor: categoriesProperties[category.name]?.color,
                                                            opacity: canBuy && !alreadyBought ? 1 : 0.5,
                                                        }}
                                                        onClick={() => handleItemPurchase(item)}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <h4 className="text-2xl">{item.name}</h4>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <div className="font-bold text-2xl">
                                                                    {alreadyBought ? (
                                                                        <>
                                                                            <CheckCircle className="w-6 h-6" />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            D$ {formatPrice(item.price)}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                Nenhum item encontrado nesta categoria
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>

                <DrawerFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-4xl font-bold flex justify-between w-full">
                            <h1>
                                Total
                            </h1>
                            <p>
                                D$ {displayDindins ? formatPrice(displayDindins) : "0"}
                            </p>
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 