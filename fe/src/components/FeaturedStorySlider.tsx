"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ReadMoreSvg from "./ReadMoreSvg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { StoryData, getStrapiMediaUrl } from "@/lib/strapi";

interface FeaturedStorySliderProps {
  heading?: string;
  stories?: StoryData[];
}

export default function FeaturedStorySlider({
  heading: sectionHeading,
  stories = [],
}: FeaturedStorySliderProps) {
  if (!stories || stories.length === 0) {
    return null;
  }

  const displayStories = stories;
  const isMultiSlide = displayStories.length > 1;

  return (
    <section className="featured-story-section">
      <div className="featured-story-container">
        <Swiper
          modules={[Pagination, Autoplay]}
          loop={isMultiSlide}
          slidesPerView={1}
          spaceBetween={30}
          autoplay={
            isMultiSlide
              ? {
                  delay: 6000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                }
              : false
          }
          pagination={
            isMultiSlide
              ? {
                  clickable: true,
                  el: ".featured-story-pagination",
                  bulletClass: "featured-story-bullet",
                  bulletActiveClass: "featured-story-bullet-active",
                }
              : false
          }
          className="w-full"
        >
          {displayStories.map((story, idx) => {
            const brandLogoUrl = story.brandLogo?.url ? getStrapiMediaUrl(story.brandLogo.url) : null;
            const blogImgUrl = (story.blogImg?.url
              ? getStrapiMediaUrl(story.blogImg.url)
              : null) || "/images/stories/Rectangle 4045.jpg";

            const storyHeading =
              story.shortDes ||
              story.heading ||
              story.aboutBlog ||
              story.stories ||
              "Featured Story";

            const storyDescription =
              story.description ||
              "Arkam Ventures leads the conversation on how digitization is transforming agricultural supply chains across Middle India.";

            const readMoreUrl =
              story.readMore || (story.slug ? `/stories/${story.slug}` : "/stories");

            return (
              <SwiperSlide key={story.id || idx}>
                {/* Featured Story Card:
                    1920px: width 1522px, height 578px, radius 18px, bg #FFF5E4, left 199px, top 1389px, padding 56px
                    1440px: width 1141.5px, height 433.5px, radius 13.5px, bg #FFF5E4, left 149.25px, top 1041.75px, padding 42px
                */}
                <div className="featured-story-card flex items-center overflow-hidden transition-all">
                  <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0">
                    {/* Left Column: Matter / Data section (Image 0: 570 Hug x 381 Hug) */}
                    <div className="featured-story-matter">
                      {/* Publisher Brand Logo (Image 1: 81 x 40 at 1920, 60.75 x 30 at 1440) */}
                      <div className="featured-story-logo">
                        {brandLogoUrl && (
                          <Image
                            src={brandLogoUrl}
                            alt={story.brandLogo?.alternativeText || ""}
                            fill
                            className="object-contain object-left"
                            unoptimized
                          />
                        )}
                      </div>

                      {/* Main Heading (Image 2: 570 x 96 Hug at 1920, 427.5 x 72 at 1440) */}
                      <h3 className="featured-story-heading">
                        {storyHeading}
                      </h3>

                      {/* Description (Image 3: 570 x 165 Hug at 1920, 427.5 x 123.75 at 1440) */}
                      <p className="featured-story-desc">
                        {storyDescription}
                      </p>

                      {/* Read More Link (Figma: 125 Hug x 32) */}
                      <div>
                        <Link
                          href={readMoreUrl}
                          className="featured-story-readmore group"
                          aria-label="Read more"
                        >
                          <ReadMoreSvg className="read-more-svg" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Image (Specs: 580x466 radius 16px at 1920; 435x349.5 radius 12px at 1440; 56px from top/right/bottom) */}
                    <div className="featured-story-image-wrap bg-[#3F7C77]/10">
                      <Image
                        src={blogImgUrl}
                        alt={storyHeading}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Pagination Indicator Dots (Orange pill active, grey dots inactive) */}
        {isMultiSlide && (
          <div className="featured-story-pagination relative z-10 mt-6 sm:mt-8 flex items-center justify-center gap-2" />
        )}
      </div>
    </section>
  );
}
