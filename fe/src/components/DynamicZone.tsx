"use client";

import React from "react";
import {
  DynamicZoneComponent,
  HomepageSliderComponent,
  PartnersComponent,
  FeaturedStoriesComponent,
  BlogSectionComponent,
  ThesisBottomSliderHeadingComponent,
  BottomPortfolioSliderComponent,
} from "@/lib/strapi";
import FounderCarousel from "./FounderCarousel";
import PartnerLogoStrip from "./PartnerLogoStrip";
import FeaturedStorySlider from "./FeaturedStorySlider";
import BlogSlider from "./BlogSlider";
import ThesisSectorsGrid from "./ThesisSectorsGrid";
import PortfolioCardsCarousel from "./PortfolioCardsCarousel";

interface DynamicZoneProps {
  layout?: DynamicZoneComponent[];
  viewAllStoriesLabel?: string;
  viewMoreLabel?: string;
}

export default function DynamicZone({ layout = [], viewAllStoriesLabel, viewMoreLabel }: DynamicZoneProps) {
  if (!layout || layout.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {layout.map((component, index) => {
        switch (component.__component) {
          case "shared.homepage-slider": {
            const slider = component as HomepageSliderComponent;
            return (
              <FounderCarousel
                key={`slider-${slider.id || index}`}
                slides={slider.imgSlider1}
                banner={slider.homepageBanner}
                appearance={slider.sectionAppearance}
              />
            );
          }
          case "shared.partners": {
            const partners = component as PartnersComponent;
            return (
              <PartnerLogoStrip
                key={`partners-${partners.id || index}`}
                partners={partners.partnerLogo}
              />
            );
          }
          case "homepage.featured-stories": {
            const fs = component as FeaturedStoriesComponent;
            // ONLY display the stories selected in Strapi homepage relation
            const selectedStories = fs.stories ?? (fs.story ? [fs.story] : []);
            if (selectedStories.length === 0) {
              return null;
            }
            return (
              <FeaturedStorySlider
                key={`featured-stories-${fs.id || index}`}
                heading={fs.heading}
                stories={selectedStories}
              />
            );
          }
          case "homepage.blog-section": {
            const bs = component as BlogSectionComponent;
            if (!bs.blog || bs.blog.length === 0) {
              return null;
            }
            return (
              <BlogSlider
                key={`blog-section-${bs.id || index}`}
                title={bs.blogSlider ?? ""}
                viewAllLabel={viewAllStoriesLabel}
                cards={bs.blog}
              />
            );
          }
          case "thesis.bottom-slider-heading": {
            const th = component as ThesisBottomSliderHeadingComponent;
            return (
              <ThesisSectorsGrid
                key={`thesis-${th.id || index}`}
                title={th.title}
                items={th.sliderImg1 || []}
                layout="mosaic"
                viewMoreLabel={viewMoreLabel}
              />
            );
          }
          case "homepage.bottom-portfolio-slider": {
            const ps = component as BottomPortfolioSliderComponent;
            return (
              <PortfolioCardsCarousel
                key={`portfolio-carousel-${ps.id || index}`}
                title={ps.title}
                whatWeAre={ps.whatWeAre}
                cards={ps.sliderCard || []}
              />
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
