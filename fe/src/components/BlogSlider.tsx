"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ReadMoreSvg from "./ReadMoreSvg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  BlogCardItem,
  BlogCardsComponent,
  StoryData,
  getStrapiMediaUrl,
} from "@/lib/strapi";

interface BlogSliderProps {
  title?: string;
  story?: StoryData | null;
  cards?: BlogCardItem[];
  viewAllLabel?: string;
}

// Byline text comes from the story's "by" field in Strapi
function getByLine(by?: string | null): string {
  if (!by || by.trim().length === 0) return "";
  return /^by\s/i.test(by.trim()) ? by.trim() : `by ${by.trim()}`;
}

export default function BlogSlider({
  title = "",
  viewAllLabel = "",
  story,
  cards,
}: BlogSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Extract cards from story if provided
  const storyBlogCards = story?.blogs?.find(
    (b) => b.__component === "story.blog-cards"
  ) as BlogCardsComponent | undefined;

  const displayCards: BlogCardItem[] =
    cards && cards.length > 0
      ? cards
      : storyBlogCards?.card && storyBlogCards.card.length > 0
      ? storyBlogCards.card
      : [];

  if (displayCards.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-white select-none overflow-hidden">
      <div className="w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0">
        {/* Section Header: Title + Navigation Arrows */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 2xl:mb-12">
          <div className="flex items-center gap-3">
            <h2
              style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
              className="text-2xl sm:text-3xl lg:text-[38px] font-medium text-[#1E1A1A] tracking-tight"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/stories"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E1A1A] hover:text-[#EE6723] transition-colors"
            >
              {viewAllLabel}
              <span>↗</span>
            </Link>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                ref={prevRef}
                type="button"
                className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-full border border-gray-200 hover:border-[#EE6723] hover:text-[#EE6723] text-gray-700 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous story slide"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                ref={nextRef}
                type="button"
                className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-full border border-gray-200 hover:border-[#EE6723] hover:text-[#EE6723] text-gray-700 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next story slide"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Navigation, Autoplay]}
          loop={displayCards.length > 3}
          slidesPerView={1.15}
          spaceBetween={16}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 22.5,
            },
            1920: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            // @ts-expect-error Swiper navigation params assignment
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-expect-error Swiper navigation params assignment
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          className="w-full !overflow-visible"
        >
          {displayCards.map((card, idx) => {
            const cardImgUrl = (card.cardImg?.url
              ? getStrapiMediaUrl(card.cardImg.url)
              : null) || "/images/stories/Rectangle 6719.jpg";
            const byLine = getByLine(card.by);

            return (
              <SwiperSlide key={card.id || idx} className="h-auto">
                <article className="w-full max-w-[337.5px] 2xl:max-w-[450px] mx-auto lg:mx-0 h-[464.25px] 2xl:h-[619px] bg-white rounded-[6px] 2xl:rounded-[8px] overflow-hidden flex flex-col group shadow-none select-none border border-neutral-100">
                  {/* Card Image: 450x280 at 1920, 337.5x210 at 1440 */}
                  <div className="relative w-full h-[210px] 2xl:h-[280px] shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={cardImgUrl}
                      alt={card.aboutCard || "Story image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  </div>

                  {/* Card Content: px-[18px] 2xl:px-[24px] pt-[18px] 2xl:pt-[24px] pb-[24px] 2xl:pb-[32px] */}
                  <div className="flex flex-col flex-1 px-[18px] 2xl:px-[24px] pt-[18px] 2xl:pt-[24px] pb-[24px] 2xl:pb-[32px]">
                    {/* Title */}
                    <h3 className="font-medium text-[21px] 2xl:text-[28px] leading-[24.75px] 2xl:leading-[33px] text-[#1E1A1A] line-clamp-2 min-h-[49.5px] 2xl:min-h-[66px] max-h-[49.5px] 2xl:max-h-[66px] group-hover:text-[#EE6723] transition-colors duration-200 m-0 p-0">
                      {card.aboutCard}
                    </h3>

                    {/* By-line */}
                    {byLine ? (
                      <p className="font-rubik text-[15px] 2xl:text-[20px] leading-[18px] 2xl:leading-[24px] text-[#1E1A1A] opacity-70 h-[18px] 2xl:h-[24px] overflow-hidden whitespace-nowrap text-ellipsis mt-[12px] 2xl:mt-[16px] m-0 p-0">
                        {byLine}
                      </p>
                    ) : (
                      <div className="h-[18px] 2xl:h-[24px] mt-[12px] 2xl:mt-[16px]" />
                    )}

                    {/* Description */}
                    {card.description ? (
                      <p className="font-normal text-[12px] 2xl:text-[16px] leading-[21px] 2xl:leading-[28px] text-[#1E1A1A] opacity-70 h-[42px] 2xl:h-[56px] line-clamp-2 overflow-hidden mt-[12px] 2xl:mt-[16px] m-0 p-0">
                        {card.description}
                      </p>
                    ) : (
                      <div className="h-[42px] 2xl:h-[56px] mt-[12px] 2xl:mt-[16px]" />
                    )}

                    {/* Read More */}
                    <div className="mt-auto pt-2">
                      <Link
                        href="/stories"
                        className="group/link inline-flex items-center no-underline text-[#1E1A1A] hover:text-[#EE6723] transition-colors duration-200"
                        aria-label="Read more"
                      >
                        <ReadMoreSvg className="w-[93.75px] h-[24px] 2xl:w-[125px] 2xl:h-[32px] block flex-shrink-0 transition-colors duration-200" />
                      </Link>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
