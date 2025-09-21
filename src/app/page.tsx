
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getProductsByCategory, getCategories, Product, getBanners, Banner } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Umbrella, Dumbbell, HeartPulse, Sparkles, Tag, Sofa, Stethoscope, BookOpen, ToyBrick, Car, ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { Countdown } from '@/components/countdown';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonalizedRecommendations } from '@/components/personalized-recommendations';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Apparel': <Dumbbell className="h-8 w-8" />,
  'Electronics': <Sparkles className="h-8 w-8" />,
  'Groceries': <HeartPulse className="h-8 w-8" />,
  'Accessories': <Tag className="h-8 w-8" />,
  'Sports & Outdoors': <Umbrella className="h-8 w-8" />,
  'Home & Kitchen': <Sofa className="h-8 w-8" />,
  'Beauty & Personal Care': <Stethoscope className="h-8 w-8" />,
  'Books': <BookOpen className="h-8 w-8" />,
  'Toys & Games': <ToyBrick className="h-8 w-8" />,
  'Automotive': <Car className="h-8 w-8" />,
};

function HeroCarousel({ banners, isLoading }: { banners: Banner[], isLoading: boolean }) {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    duration: 30
  }, [
    Autoplay({ 
      delay: 4000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true
    }), 
    Fade()
  ]);

  if (isLoading) {
    return (
      <div className="aspect-w-3 aspect-h-1 relative overflow-hidden rounded-lg">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg group" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner, index) => (
          <Link href={banner.link} key={banner.id} className="relative flex-[0_0_100%] group/banner">
            <div className="aspect-[3/1] relative overflow-hidden">
              <Image
                src={banner.imageUrl}
                alt={banner.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover/banner:scale-110"
                data-ai-hint={banner.alt}
                priority={index === 0}
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover/banner:bg-black/10 transition-all duration-500"></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [hotDeals, setHotDeals] = useState<Product[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
  const [apparelProducts, setApparelProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [
          allBanners,
          hotDealProducts, 
          allCategories
        ] = await Promise.all([
            getBanners(),
            getProducts({ hotDealsOnly: true }),
            getCategories()
        ]);
        
        setBanners(allBanners);
        setHotDeals(hotDealProducts);
        
        const electronicsCat = allCategories.find(c => c.name === 'Electronics');
        if (electronicsCat) {
            const electronics = await getProductsByCategory(electronicsCat.slug);
            setElectronicsProducts(electronics.slice(0, 5));
        }

        const apparelCat = allCategories.find(c => c.name === 'Apparel');
        if (apparelCat) {
            const apparel = await getProductsByCategory(apparelCat.slug);
            setApparelProducts(apparel.slice(0, 5));
        }
        
        setCategories(allCategories);
      } catch (error) {
          console.error("Failed to fetch data for homepage", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);

  return (
    <div className="flex flex-col bg-background">
      <section className="container px-4 py-2">
        <HeroCarousel banners={banners} isLoading={isLoading} />
      </section>

      <section id="categories" className="py-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
              Top Categories
            </h2>
            <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="w-full flex space-x-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-1/6 rounded-2xl" />)}
            </div>
          ) : (
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
              loop: true,
              duration: 25,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              })
            ]}
            className="w-full group/carousel"
          >
            <CarouselContent className="gap-3">
               {categories.map((category, index) => {
                 // Define colorful gradient backgrounds for each category
                 const gradientColors = [
                   'from-pink-500 to-rose-500',
                   'from-blue-500 to-cyan-500', 
                   'from-purple-500 to-violet-500',
                   'from-green-500 to-emerald-500',
                   'from-orange-500 to-red-500',
                   'from-indigo-500 to-blue-500',
                   'from-yellow-500 to-orange-500',
                   'from-teal-500 to-green-500',
                   'from-red-500 to-pink-500',
                   'from-violet-500 to-purple-500'
                 ];
                 const bgGradient = gradientColors[index % gradientColors.length];
                 
                 return (
                <CarouselItem key={index} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                   <Link href={`/category/${category.slug}`}>
                    <Card className="group relative overflow-hidden h-32 rounded-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                      {/* Colorful gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent group-hover:from-white/10 group-hover:via-white/20 group-hover:to-white/10 transition-all duration-500"></div>
                      
                      <div className="relative h-full flex flex-col items-center justify-center p-4">
                        {/* Icon with colorful effects */}
                        <div className="relative mb-3">
                          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} rounded-2xl blur-lg group-hover:scale-125 transition-all duration-500 opacity-20 group-hover:opacity-40`}></div>
                          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl group-hover:shadow-2xl`}>
                            <div className="text-white group-hover:scale-110 transition-transform duration-300">
                              {categoryIcons[category.name] || <Sparkles className="h-8 w-8" />}
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Name */}
                        <h3 className="text-sm font-bold text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300 leading-tight">
                          {category.name}
                        </h3>
                      </div>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
                    </Card>
                  </Link>
                </CarouselItem>
               )})}
            </CarouselContent>
          </Carousel>
          )}
        </div>
      </section>

      <section id="hot-deals" className="py-6 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-4 text-center sm:text-left">
            <h2 className="text-lg font-semibold">
              Hot Deals
            </h2>
             <Countdown targetDate={futureDate.toISOString()} />
            <Link href="#" className="text-sm font-medium text-primary hover:underline mt-2 sm:mt-0">
              View All
            </Link>
          </div>
          {isLoading ? (
             <div className="w-full flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1/5 space-y-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
                {hotDeals.map(product => (
                <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                    <ProductCard product={product} />
                </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
          )}
        </div>
      </section>
      
      <PersonalizedRecommendations />

      <section id="electronics" className="py-6">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Electronics
            </h2>
             <Link href="/category/electronics" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
           {isLoading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
           ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {electronicsProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           )}
        </div>
      </section>

      <section id="apparel" className="py-6 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Apparel
            </h2>
            <Link href="/category/apparel" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
           {isLoading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
           ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {apparelProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           )}
        </div>
      </section>

    </div>
  );
}
