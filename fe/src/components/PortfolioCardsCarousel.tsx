"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { PortfolioCardItem, getStrapiMediaUrl } from "@/lib/strapi";

interface PortfolioCardsCarouselProps {
  title?: string;
  whatWeAre?: string;
  cards?: PortfolioCardItem[];
}

export default function PortfolioCardsCarousel({
  title,
  whatWeAre,
  cards = [],
}: PortfolioCardsCarouselProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  const displayTitle = title ?? "";
  const displaySubtitle = whatWeAre ?? "";
  const effectiveCards = cards;

  // Helper to reliably identify company cards
  const getCompanyKey = (c: PortfolioCardItem): string => {
    const text = (
      (c.partnerLogo?.name || "") +
      " " +
      (c.partnerLogo?.url || "") +
      " " +
      (c.description || "")
    ).toLowerCase();

    if (text.includes("blue-collar") || text.includes("smartstaff") || text.includes("611")) {
      return "smartstaff";
    }
    if (text.includes("jai kisan") || text.includes("rural-focused") || text.includes("kisan")) {
      return "jai kisan";
    }
    if (text.includes("krazy") || text.includes("small ticket loans") || text.includes("609")) {
      return "krazy";
    }
    if (text.includes("signzy") || text.includes("onboarding")) {
      return "signzy";
    }
    if (text.includes("jar") || text.includes("digital gold") || text.includes("micro savings") || text.includes("613")) {
      return "jar";
    }
    return "";
  };

  // Sort cards to match the Figma visual sequence:
  // smartstaff (Far Left) -> Jai Kisan (Near Left) -> Krazy Bee (Center) -> Signzy (Near Right) -> Jar (Far Right)
  const figmaSequence = ["smartstaff", "jai kisan", "krazy", "signzy", "jar"];
  const displayCards = [...effectiveCards].sort((a, b) => {
    const aKey = getCompanyKey(a);
    const bKey = getCompanyKey(b);

    const aIdx = figmaSequence.indexOf(aKey);
    const bIdx = figmaSequence.indexOf(bKey);

    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    return 0;
  });

  // Default active index: Krazy Bee (Center)
  const initialIndex = displayCards.findIndex(
    (c) => getCompanyKey(c) === "krazy"
  );

  const [activeIndex, setActiveIndex] = useState(
    initialIndex !== -1 ? initialIndex : Math.floor(displayCards.length / 2)
  );
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalCards = displayCards.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  // Render Title: "Our " (light) + "portfolio" (bold) + " companies" (light)
  const renderTitle = (titleStr: string) => {
    const target = "portfolio";
    const lower = titleStr.toLowerCase();
    const idx = lower.indexOf(target);

    if (idx !== -1) {
      const before = titleStr.slice(0, idx);
      const matched = titleStr.slice(idx, idx + target.length);
      const after = titleStr.slice(idx + target.length);
      return (
        <>
          <span>{before}</span>
          <span className="portfolio-title-highlight">{matched}</span>
          <span>{after}</span>
        </>
      );
    }
    return <span>{titleStr}</span>;
  };

  return (
    <section
      className="portfolio-carousel-section"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Portfolio companies carousel"
    >
      {/* Section background — Group 48099350 (1920×1479 viewBox, opacity 0.3 + blur baked in).
          Rendered at full natural proportions and vertically centred on the section so the
          Gaussian-blur fade zones overflow above and below — giving the smooth dissolve into white. */}
      <div
        className="absolute left-0 w-full z-0 pointer-events-none select-none"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/portfolio-bg.svg"
          alt=""
          className="w-full h-auto block"
        />
      </div>

      <div className="portfolio-carousel-header">
        {/* Title */}
        <h2 className="portfolio-carousel-title">{renderTitle(displayTitle)}</h2>

        {/* Subtitle */}
        <p className="portfolio-carousel-subtitle">{displaySubtitle}</p>
      </div>

      {/* Component 62 Container: 1522px x 540px at 1920 */}
      <div
        className="portfolio-carousel-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="portfolio-carousel-track">
          {displayCards.map((card, idx) => {
            // Calculate circular offset relative to activeIndex
            let offset = (idx - activeIndex) % totalCards;
            if (offset > Math.floor(totalCards / 2)) offset -= totalCards;
            if (offset < -Math.floor((totalCards - 1) / 2)) offset += totalCards;

            const logoUrl = card.partnerLogo?.url
              ? card.partnerLogo.url.startsWith("/images")
                ? card.partnerLogo.url
                : getStrapiMediaUrl(card.partnerLogo.url)
              : null;

            // Determine card class by offset
            let positionClass = "portfolio-card-hidden-right";
            if (offset === 0) positionClass = "portfolio-card-center";
            else if (offset === -1) positionClass = "portfolio-card-near-left";
            else if (offset === 1) positionClass = "portfolio-card-near-right";
            else if (offset === -2) positionClass = "portfolio-card-far-left";
            else if (offset === 2) positionClass = "portfolio-card-far-right";
            else if (offset < -2) positionClass = "portfolio-card-hidden-left";

            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // Logo dimensions scale down with distance from center:
            // center (0): max-h 50px / 67px@1920  near (±1): max-h 32px / 43px@1920  far (±2): max-h 24px / 32px@1920
            const logoImgWidth = isCenter ? 188 : absOffset === 1 ? 150 : 115;
            const logoImgHeight = isCenter ? 67 : absOffset === 1 ? 43 : 32;
            const logoMaxHClass = isCenter
              ? "max-h-[50px] 2xl:max-h-[67px] max-w-[75%]"
              : absOffset === 1
              ? "max-h-[32px] 2xl:max-h-[43px] max-w-[70%]"
              : "max-h-[24px] 2xl:max-h-[32px] max-w-[65%]";

            return (
              <div
                key={card.id || idx}
                className={`portfolio-card ${positionClass}`}
                onClick={() => setActiveIndex(idx)}
                role="button"
                tabIndex={0}
                aria-current={isCenter ? "true" : undefined}
                aria-label={`View ${card.partnerLogo?.name || "company"}`}
              >
                {/* Company Logo */}
                <div className="portfolio-card-logo-wrap">
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt={card.partnerLogo?.name || "Portfolio Company Logo"}
                      width={logoImgWidth}
                      height={logoImgHeight}
                      className={`w-auto object-contain ${logoMaxHClass}`}
                      unoptimized
                    />
                  )}
                </div>

                {/* Description: always in DOM; CSS transitions handle show/hide */}
                {card.description && (
                  <p className="portfolio-card-description">
                    {card.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons (left / right) Centered Below the Active Card */}
        <div className="portfolio-carousel-nav" aria-label="Carousel Navigation">
          <button
            type="button"
            onClick={prevSlide}
            className="portfolio-nav-btn"
            aria-label="Previous portfolio company"
          >
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="-0.5" width="47" height="47" rx="23.5" transform="matrix(1 0 0 -1 0 47)" stroke="#1E1A1A"/>
              <path d="M27 30L21 24L22.8947 22.1053L27 18" strokeWidth="2.5" stroke="#1E1A1A"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="portfolio-nav-btn"
            aria-label="Next portfolio company"
          >
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="-0.5" width="47" height="47" rx="23.5" transform="matrix(1 0 0 -1 0 47)" stroke="#1E1A1A"/>
              <path d="M21 30L27 24L25.1053 22.1053L21 18" strokeWidth="2.5" stroke="#1E1A1A"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
