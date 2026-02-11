'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/i18n/LanguageContext';

export function AnnouncementBar() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    t.announcement.freeShipping,
    t.announcement.newArrivals,
    t.announcement.memberDiscount,
    t.announcement.limitedOffer,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-stone-900 text-stone-100 py-2.5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p
          className={`text-xs tracking-widest uppercase font-body transition-all duration-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          {messages[currentIndex]}
        </p>
      </div>
    </div>
  );
}
