"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  FounderSlideItem,
  SectionAppearance,
  getStrapiMediaUrl,
} from "@/lib/strapi";

interface FounderCarouselProps {
  slides?: FounderSlideItem[];
  banner?: string;
  appearance?: SectionAppearance | null;
}

export default function FounderCarousel({
  slides = [],
  banner,
  appearance,
}: FounderCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1440);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      } else if (typeof window !== "undefined") {
        setContainerWidth(window.innerWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!slides || slides.length === 0) {
    return null;
  }

  const effectiveSlides = slides;

  // Fluid geometry calculations:
  // Edge padding: 55px on left and right on desktop viewports (>=1024px)
  const isDesktop = containerWidth >= 1024;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;
  const edgePadding = isDesktop ? 55 : isTablet ? 28 : 16;
  const totalEdgePadding = edgePadding * 2;

  // Slide gap between active and adjacent cards: 32px at 1920, 24px at 1440
  const slideGap = isDesktop
    ? Math.max(20, Math.min(36, Math.round(32 * (containerWidth / 1920))))
    : 16;

  // Fluid slide width ensuring the 3 visible slides precisely span the width between the 55px edge paddings:
  // (containerWidth - 2 * edgePadding - 2 * slideGap) / (1 + 2 * 0.771)
  const slideWidth = isDesktop
    ? Math.round((containerWidth - totalEdgePadding - 2 * slideGap) / 2.542)
    : Math.round(Math.min(containerWidth * 0.85, 420));

  // Aspect ratio 687 / 470 = 1.4617
  const slideHeight = Math.round(slideWidth / 1.4617);

  // Swiper spaceBetween so visual gap between active & scaled 0.771 inactive slide is exactly slideGap
  const spaceBetween = Math.round(slideGap - 0.1145 * slideWidth);

  // For smooth looping in a fluid full-width carousel across all screen sizes,
  // ensure sufficient slides so there are never empty gaps while looping.
  const displaySlides =
    effectiveSlides.length < 4
      ? [...effectiveSlides, ...effectiveSlides, ...effectiveSlides, ...effectiveSlides]
      : effectiveSlides.length < 8
      ? [...effectiveSlides, ...effectiveSlides]
      : effectiveSlides;

  const bgCustomUrl = appearance?.backgroundImage?.url
    ? getStrapiMediaUrl(appearance.backgroundImage.url)
    : null;
  const gradientCustomUrl = appearance?.gradientImage?.url
    ? getStrapiMediaUrl(appearance.gradientImage.url)
    : null;
  const headingArtworkUrl = appearance?.headingArtwork?.url
    ? getStrapiMediaUrl(appearance.headingArtwork.url)
    : null;

  const bgMode = appearance?.backgroundMode || "gradient";
  const showGradient =
    bgMode === "gradient" || bgMode === "plain-with-gradient";

  return (
    <section className="relative w-full pt-0 pb-6 sm:pb-8 overflow-hidden select-none">
      {/* Dynamic Background Image if configured in Strapi */}
      {bgCustomUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={bgCustomUrl}
            alt="Section background"
            fill
            className="object-cover"
            priority={false}
            unoptimized
          />
        </div>
      )}

      {/* Dynamic or Default Radial Gradient Ambient Glow matching Figma reference */}
      {showGradient && gradientCustomUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
          <Image
            src={gradientCustomUrl}
            alt="Section gradient"
            fill
            className="object-cover opacity-80"
            priority={false}
            unoptimized
          />
        </div>
      )}

      {/* Optional Heading Artwork from Strapi - scaled 0.75 for 1440 laptop */}
      {headingArtworkUrl && (
        <div className="relative z-10 w-full max-w-[665px] mx-auto mb-5 flex justify-center">
          <Image
            src={headingArtworkUrl}
            alt="Heading artwork"
            width={300}
            height={75}
            className="h-auto max-w-full object-contain"
            unoptimized
          />
        </div>
      )}

      {/* Sliding banner frame: Fluid container with 55px edge padding */}
      <div
        ref={containerRef}
        className="relative z-10 w-full overflow-hidden"
        style={{
          paddingLeft: `${edgePadding}px`,
          paddingRight: `${edgePadding}px`,
        }}
      >
        <Swiper
          key={`swiper-${slideWidth}-${spaceBetween}`}
          modules={[Pagination, Autoplay]}
          centeredSlides={true}
          loop={displaySlides.length > 2}
          slidesPerView="auto"
          spaceBetween={spaceBetween}
          slideToClickedSlide={true}
          speed={600}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          pagination={{
            clickable: true,
            el: ".custom-swiper-pagination",
            bulletClass: "custom-swiper-bullet",
            bulletActiveClass: "custom-swiper-bullet-active",
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex % effectiveSlides.length);
          }}
          className="w-full !overflow-visible pt-0 pb-2"
        >
          {displaySlides.map((slide, idx) => {
            const bgUrl = slide.backgroundImage?.url
              ? slide.backgroundImage.url.startsWith("/images")
                ? slide.backgroundImage.url
                : getStrapiMediaUrl(slide.backgroundImage.url)
              : null;
            const partnerLogoUrl = slide.partnerLogo?.url
              ? slide.partnerLogo.url.startsWith("/images")
                ? slide.partnerLogo.url
                : getStrapiMediaUrl(slide.partnerLogo.url)
              : null;

            return (
              <SwiperSlide
                key={`${slide.id}-${idx}`}
                style={{ width: `${slideWidth}px`, height: `${slideHeight}px` }}
                className="shrink-0 flex items-end justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative w-full h-full rounded-[18px] overflow-hidden origin-bottom transition-all duration-500 ease-out ${
                      isActive
                        ? "z-20 scale-100 grayscale-0 opacity-100 shadow-none ring-0"
                        : "z-10 scale-[0.771] grayscale contrast-[1.05] opacity-100 hover:opacity-95 cursor-pointer"
                    }`}
                    style={
                      !isActive
                        ? {
                            boxShadow:
                              "0px 10px 10px 0px rgba(193, 193, 193, 0.25)",
                          }
                        : undefined
                    }
                  >
                    {/* Background photo from Strapi */}
                    {bgUrl ? (
                      <Image
                        src={bgUrl}
                        alt={slide.innerBannerHeadind || "Founder photo"}
                        fill
                        sizes="(max-width: 768px) 85vw, 515px"
                        className={`object-cover ${
                          isActive ? "mix-blend-multiply" : ""
                        }`}
                        priority={isActive}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}

                    {/* Bottom subtle dark gradient overlay: 176px * 0.75 = 132px */}
                    <div className="absolute inset-x-0 bottom-0 h-[132px] bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    {/* Content footer on active slide (scaled 0.75) */}
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-[21px] flex items-end justify-between gap-3 z-20">
                        {/* Founder details / names from Strapi */}
                        {slide.innerBannerHeadind && (
                          <p className="text-white/95 text-xs lg:text-[13px] font-medium leading-snug drop-shadow-sm whitespace-pre-line max-w-[65%] sm:max-w-[70%]">
                            {slide.innerBannerHeadind}
                          </p>
                        )}

                        {/* Company logo badge from Strapi: 75x24 * 0.75 = 56x18 */}
                        {partnerLogoUrl && (
                          <div className="bg-white rounded-lg px-2.5 py-1 shadow-md flex items-center justify-center shrink-0">
                            <Image
                              src={partnerLogoUrl}
                              alt={
                                slide.partnerLogo?.alternativeText ||
                                "Company logo"
                              }
                              width={56}
                              height={18}
                              className="h-[18px] w-auto object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Pagination Indicator Dots */}
        <div className="custom-swiper-pagination relative z-10 mt-5 lg:mt-6 flex items-center justify-center gap-2" />
      </div>

      {/* Scoped CSS for Swiper navigation dots scaled 0.75 for 1440 laptop */}
      <style jsx global>{`
        .custom-swiper-bullet {
          display: inline-block;
          width: 4.5px;
          height: 4.5px;
          border-radius: 9999px;
          background-color: #d1d5db;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .custom-swiper-bullet:hover {
          background-color: #9ca3af;
        }
        .custom-swiper-bullet-active {
          width: 21px !important;
          height: 4.5px !important;
          border-radius: 9999px !important;
          background: linear-gradient(96deg, #eeab41 0%, #df6e38 100%) !important;
        }
      `}</style>
    </section>
  );
}
