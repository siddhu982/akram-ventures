"use client";

import React from "react";
import Image from "next/image";
import { PartnerLogoItem, getStrapiMediaUrl } from "@/lib/strapi";

interface PartnerLogoStripProps {
  partners?: PartnerLogoItem[];
}

interface LogoDimension {
  w1920: number;
  h1920: number;
  w1440: number;
  h1440: number;
}

// User specified logo sizes for 1920px, reduced by 0.75 for 1440px
const LOGO_DIMENSIONS: Record<string, LogoDimension> = {
  jaikisan: { w1920: 200, h1920: 60, w1440: 150, h1440: 45 },
  jar: { w1920: 123, h1920: 60, w1440: 92.25, h1440: 45 },
  smallcase: { w1920: 208, h1920: 60, w1440: 156, h1440: 45 },
  smartstaff: { w1920: 110, h1920: 60, w1440: 82.5, h1440: 45 },
  krazybee: { w1920: 176, h1920: 60, w1440: 132, h1440: 45 },
  spotdraft: { w1920: 211, h1920: 60, w1440: 158.25, h1440: 45 },
  wint: { w1920: 189, h1920: 60, w1440: 141.75, h1440: 45 },
};

function getLogoDimension(name?: string, imgName?: string): LogoDimension {
  const clean = (str?: string) =>
    (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const n1 = clean(name);
  const n2 = clean(imgName);

  for (const [key, dim] of Object.entries(LOGO_DIMENSIONS)) {
    if (n1.includes(key) || n2.includes(key)) {
      return dim;
    }
  }

  // Fallback default
  return { w1920: 180, h1920: 60, w1440: 135, h1440: 45 };
}

export default function PartnerLogoStrip({ partners = [] }: PartnerLogoStripProps) {
  if (!partners || partners.length === 0) {
    return null;
  }

  const effectivePartners = partners;

  // Duplicate the list within each sub-track to ensure generous coverage on all viewports
  const logoList = [...effectivePartners, ...effectivePartners];

  const renderLogoGroup = (isAriaHidden = false) => (
    <div
      aria-hidden={isAriaHidden ? "true" : undefined}
      className="flex shrink-0 items-center gap-8 sm:gap-12 lg:gap-16 2xl:gap-20 pr-8 sm:pr-12 lg:pr-16 2xl:pr-20"
    >
      {logoList.map((partner, index) => {
        const logoUrl = partner.partnerLogoImage?.url
          ? partner.partnerLogoImage.url.startsWith("/images")
            ? partner.partnerLogoImage.url
            : getStrapiMediaUrl(partner.partnerLogoImage.url)
          : null;
        const dim = getLogoDimension(
          partner.partnerLogoName,
          partner.partnerLogoImage?.name
        );

        if (!logoUrl) {
          return (
            <span
              key={`${partner.id}-${index}`}
              className="text-xs sm:text-[13px] font-semibold text-neutral-700 shrink-0 select-none whitespace-nowrap"
            >
              {partner.partnerLogoName}
            </span>
          );
        }

        return (
          <div
            key={`${partner.id}-${index}`}
            style={{
              width: `clamp(${dim.w1440}px, ${(dim.w1920 / 1920 * 100).toFixed(4)}vw, ${dim.w1920}px)`,
              height: `clamp(${dim.h1440}px, ${(dim.h1920 / 1920 * 100).toFixed(4)}vw, ${dim.h1920}px)`,
            }}
            className="shrink-0 relative flex items-center justify-center transition-opacity duration-200 opacity-85 hover:opacity-100"
          >
            <Image
              src={logoUrl}
              alt={partner.partnerLogoName || "Partner company logo"}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="relative z-10 w-full bg-transparent pt-4 pb-4 lg:pt-6 lg:pb-0">
      {/* Smooth Marquee Container: edge faded, zero separation line */}
      <div className="marquee-container w-full">
        <div className="marquee-track flex items-center">
          {renderLogoGroup(false)}
          {renderLogoGroup(true)}
        </div>
      </div>
    </section>
  );
}
