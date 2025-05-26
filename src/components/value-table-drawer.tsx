"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
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
    const { dindins } = useGameStore();

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
                                            {itemsByCategory[category.id].map((item) => (
                                                <Card key={item.id} className="p-3 px-8 rounded-full" style={{
                                                    backgroundColor: categoriesProperties[category.name]?.color,
                                                }}>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                            <h4 className="text-2xl">{item.name}</h4>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="font-bold text-2xl">
                                                                D$ {formatPrice(item.price)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
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
                                D$ {dindins ? formatPrice(dindins) : "0"}
                            </p>
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 