"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Nouvelle Collection Vlisco",
    subtitle: "L'élégance à l'état pur pour vos grandes occasions.",
    image: "https://picsum.photos/seed/wax1/1920/1080?blur=1",
    cta: "Découvrir",
    link: "/catalogue?category=vlisco"
  },
  {
    id: 2,
    title: "Promotions Exclusives",
    subtitle: "Jusqu'à -30% sur une sélection de pagnes Hitarget.",
    image: "https://picsum.photos/seed/wax2/1920/1080?blur=1",
    cta: "Voir les promos",
    link: "/catalogue?promo=true"
  },
  {
    id: 3,
    title: "Uniwax Authentique",
    subtitle: "Des couleurs vibrantes et des motifs uniques.",
    image: "https://picsum.photos/seed/wax3/1920/1080?blur=1",
    cta: "Acheter maintenant",
    link: "/catalogue?category=uniwax"
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-neutral-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover opacity-60"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-2xl text-neutral-200 mb-8 max-w-2xl drop-shadow-md"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Link
                href={slides[current].link}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-lg"
              >
                {slides[current].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm z-10"
        aria-label="Précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm z-10"
        aria-label="Suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-y-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Aller à la diapositive ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === current ? 'bg-amber-500' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
