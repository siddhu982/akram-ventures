"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThesisSliderImgItem, getStrapiMediaUrl } from "@/lib/strapi";

interface ThesisSectorsGridProps {
  title?: string;
  items?: ThesisSliderImgItem[];
  /** "slider": Thesis page "Our focus areas" (scrolling row with arrows). "mosaic": home page grid (Group 48099457). */
  layout?: "slider" | "mosaic";
  /** Text of the last card of the mosaic (Strapi: Site Labels) */
  viewMoreLabel?: string;
  viewMoreHref?: string;
}

// Home mosaic: the first five items fill these grid cells in order; the sixth cell is the "view more" card.
const MOSAIC_CARDS = ["sector-card-fintech", "sector-card-food", "sector-card-health", "sector-card-logistics", "sector-card-saas"];

// Figma "Our focus areas": a slider of 330x252 cards (4 visible at 1920) with prev/next arrows.
export default function ThesisSectorsGrid({
  title,
  items = [],
  layout = "slider",
  viewMoreLabel = "",
  viewMoreHref = "/thesis",
}: ThesisSectorsGridProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-sector-card]");
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth / 2;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // "Our " light + "focus" medium + " areas" light (Figma); other titles: last two words medium.
  const renderTitle = (titleStr: string) => {
    const lower = titleStr.toLowerCase();
    const focusIdx = lower.indexOf("focus");
    if (focusIdx !== -1) {
      return (
        <>
          <span>{titleStr.slice(0, focusIdx)}</span>
          <span className="sectors-title-highlight">{titleStr.slice(focusIdx, focusIdx + 5)}</span>
          <span>{titleStr.slice(focusIdx + 5)}</span>
        </>
      );
    }
    const digitalIdx = lower.indexOf("digital innovation");
    if (digitalIdx !== -1) {
      return (
        <>
          <span>{titleStr.slice(0, digitalIdx)}</span>
          <span className="sectors-title-highlight">{titleStr.slice(digitalIdx)}</span>
        </>
      );
    }
    const words = titleStr.trim().split(/\s+/);
    if (words.length > 2) {
      return (
        <>
          <span>{words.slice(0, -2).join(" ") + " "}</span>
          <span className="sectors-title-highlight">{words.slice(-2).join(" ")}</span>
        </>
      );
    }
    return <span>{titleStr}</span>;
  };

  if (layout === "mosaic") {
    return (
      <section className="sectors-section sectors-section-home">
        <div className="sectors-container">
          {title && <h2 className="sectors-title">{renderTitle(title)}</h2>}
          <div className="sectors-grid">
            {items.slice(0, MOSAIC_CARDS.length).map((item, i) => {
              const url = item.img1?.url ? getStrapiMediaUrl(item.img1.url) : null;
              return (
                <div key={item.id ?? i} className={`${MOSAIC_CARDS[i]} group bg-[#EFE9E4]`}>
                  {url && (
                    <Image
                      src={url}
                      alt={item.imgTxt || item.img1?.alternativeText || ""}
                      fill
                      sizes="(min-width:1920px) 690px, 330px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                  <h3 className="sector-card-title">{item.imgTxt}</h3>
                </div>
              );
            })}

            {viewMoreLabel && (
              <Link href={viewMoreHref} className="sector-card-viewmore">
                <svg className="sector-viewmore-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="12" cy="24" r="3.5" fill="#1E1A1A" />
                  <circle cx="24" cy="24" r="3.5" fill="#1E1A1A" />
                  <circle cx="36" cy="24" r="3.5" fill="#1E1A1A" />
                </svg>
                <span className="sector-viewmore-btn">
                  {viewMoreLabel}
                  <svg className="sector-viewmore-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const arrowBtnCls =
    "w-[48px] h-[48px] 2xl:w-[64px] 2xl:h-[64px] shrink-0 rounded-full flex items-center justify-center transition-all duration-200 opacity-50 hover:opacity-100 disabled:opacity-20 disabled:cursor-default";

  return (
    <section className="sectors-section">
      <div className="sectors-container">
        <div className="flex items-center justify-between gap-4 mb-[28px] lg:mb-[42px] 2xl:mb-[56px]">
          {title && <h2 className="sectors-title !m-0">{renderTitle(title)}</h2>}
          <div className="flex items-center gap-[24px] 2xl:gap-[32px] shrink-0">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              className={arrowBtnCls}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="-0.5" width="63" height="63" rx="31.5" transform="matrix(1 0 0 -1 0 63)" stroke="#1E1A1A"/>
                <path d="M35 38L29 32L30.8947 30.1053L35 26" strokeWidth="2.5" stroke="#1E1A1A"/>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              className={arrowBtnCls}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="w-full h-full scale-x-[-1]" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="-0.5" width="63" height="63" rx="31.5" transform="matrix(1 0 0 -1 0 63)" stroke="#1E1A1A"/>
                <path d="M35 38L29 32L30.8947 30.1053L35 26" strokeWidth="2.5" stroke="#1E1A1A"/>
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-[16px] lg:gap-[22.5px] 2xl:gap-[30px] overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => {
            const url = item.img1?.url ? getStrapiMediaUrl(item.img1.url) : null;
            return (
              <div
                key={item.id ?? i}
                data-sector-card
                className="group relative shrink-0 snap-start overflow-hidden rounded-[12px] 2xl:rounded-[16px] bg-[#EFE9E4] w-[240px] h-[183px] lg:w-[247.5px] lg:h-[189px] 2xl:w-[330px] 2xl:h-[252px]"
              >
                {url && (
                  <Image
                    src={url}
                    alt={item.imgTxt || item.img1?.alternativeText || "Focus area"}
                    fill
                    sizes="330px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                <h3 className="absolute left-[18px] bottom-[12px] 2xl:left-[24px] 2xl:bottom-[16px] m-0 text-white font-medium text-[15px] 2xl:text-[20px] leading-[24.75px] 2xl:leading-[33px] [font-family:var(--font-rubik),Rubik,sans-serif]">
                  {item.imgTxt}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
