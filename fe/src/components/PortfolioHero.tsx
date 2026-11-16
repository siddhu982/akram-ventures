"use client";

import React from "react";
import Image from "next/image";
import { PortfolioHeroLogo, getStrapiMediaUrl } from "@/lib/strapi";
import { splitEmphasis } from "@/lib/emphasis";

interface PortfolioHeroProps {
  heading?: string;
  heroLogos?: PortfolioHeroLogo[];
}

const DEFAULT_HEADING = "Investing in ideas that are transforming the world";

// Component 56 quadrants with Figma logo sizes (1920px):
// Jumbotail 127.97x37.04, Krazy Bee 138.07x49.39, smartstaff 118x48, SpotDraft 142.56x38.17
const HERO_FRAMES = [
  { type: "square-top-left", widthClass: "logo-jumbotail-size", name: "Jumbotail", src: "/images/logo-jumbotail.svg", width: 128, height: 37 },
  { type: "circle-top-right", widthClass: "logo-krazybee-size", name: "Krazy Bee", src: "/images/logo-krazybee.svg", width: 138, height: 49 },
  { type: "circle-bottom-left", widthClass: "logo-smartstaff-size", name: "smartstaff", src: "/images/logo-smartstaff.svg", width: 118, height: 48 },
  { type: "square-bottom-right", widthClass: "logo-spotdraft-size", name: "SpotDraft", src: "/images/logo-spotdraft.svg", width: 143, height: 38 },
];

// Figma breaks the heading into 3 lines: "Investing in ideas" / "that are transforming" / "the world".
// Editors can also control breaks with new lines in the CMS field.
function headingLines(heading: string): string[] {
  if (heading.includes("\n")) return heading.split("\n").map((l) => l.trim()).filter(Boolean);
  const m = heading.match(/^(.*?)\s+(that are\s+\S+)\s+(.*)$/i);
  return m ? [m[1], m[2], m[3]] : [heading];
}

function renderLine(line: string) {
  const parts = splitEmphasis(line, "transforming");
  if (!parts) return line;
  return (
    <>
      {parts.before}
      <span className="portfolio-hero-highlight">
        {parts.match}
        <span className="portfolio-hero-underline" aria-hidden="true" />
      </span>
      {parts.after}
    </>
  );
}

export default function PortfolioHero({ heading, heroLogos = [] }: PortfolioHeroProps) {
  const lines = headingLines(heading?.trim() || DEFAULT_HEADING);

  const frames = HERO_FRAMES.map((frame, idx) => {
    const cms = heroLogos[idx];
    const cmsUrl = cms?.logo?.url ? getStrapiMediaUrl(cms.logo.url) : null;
    return {
      ...frame,
      id: cms?.id ?? idx + 1,
      name: cms?.name || frame.name,
      src: cmsUrl || frame.src,
    };
  });

  return (
    <section className="portfolio-hero-section" aria-label="Portfolio hero">
      <div className="portfolio-hero-container">
        {/* Frame 1171277879: Width 683px, Height 228px, Top 373px, Left 255px, Gap 25px */}
        <div className="portfolio-hero-left">
          <h1 className="portfolio-hero-heading">
            {lines.map((line, i) => (
              <span key={i} className="portfolio-hero-line">
                {renderLine(line)}
              </span>
            ))}
          </h1>
        </div>

        {/* Component 56: 458px x 458px, Top: 220px, Left: 1145px */}
        <div
          className="portfolio-hero-component56"
          role="region"
          aria-label="Interactive portfolio showcase"
        >
          <div className="portfolio-component56-rotator">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className={`portfolio-component56-frame frame-${frame.type}`}
                title={frame.name}
                role="img"
                aria-label={frame.name}
              >
                <div
                  className={`portfolio-hero-logo-container portfolio-hero-logo-ideal ${frame.widthClass}`}
                >
                  <Image
                    src={frame.src}
                    alt={frame.name}
                    width={frame.width}
                    height={frame.height}
                    className="w-full h-full object-contain select-none pointer-events-none"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
