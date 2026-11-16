"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PortfolioCard, getStrapiMediaUrl } from "@/lib/strapi";

interface PortfolioGridProps {
  cards?: PortfolioCard[];
  foundersLabel?: string;
}

function getCardLogoSizeClass(card: PortfolioCard): string {
  const text = `${card.url || ""} ${card.logo?.url || ""} ${card.logo?.name || ""} ${card.aboutPartner || ""} ${card.founder || ""}`.toLowerCase();
  if (text.includes("jai") || text.includes("kisan")) {
    return "logo-brand-jaikisan";
  }
  if (text.includes("jar")) {
    return "logo-brand-jar";
  }
  if (text.includes("smallcase")) {
    return "logo-brand-smallcase";
  }
  return "logo-brand-default";
}

export default function PortfolioGrid({ cards = [], foundersLabel = "" }: PortfolioGridProps) {
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  if (!cards || cards.length === 0) {
    return null;
  }

  const displayCards = cards;

  return (
    <section className="portfolio-grid-section" aria-label="Portfolio companies grid">
      <div className="portfolio-grid-container">
        <div className="portfolio-grid">
          {displayCards.map((card) => {
            const logoUrl = card.logo?.url
              ? getStrapiMediaUrl(card.logo.url)
              : null;
            const photoUrl = card.partnerImg?.url
              ? getStrapiMediaUrl(card.partnerImg.url)
              : null;

            const cleanUrl = card.url ? card.url.trim() : "";
            const displayUrl = cleanUrl
              .replace(/^https?:\/\//, "")
              .replace(/\/$/, "");

            const logoSizeClass = getCardLogoSizeClass(card);

            return (
              <div
                key={card.id}
                className={`portfolio-card-wrapper ${
                  hoveredCardId === card.id ? "has-hovered" : ""
                }`}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <div
                  className={`portfolio-card-item group ${
                    hoveredCardId === card.id ? "is-hovered" : ""
                  }`}
                >
                {/* 1. Default State: Front Face (Team photo on top, company logo below) */}
                <div className="portfolio-card-default portfolio-card-front">
                  <div className="portfolio-card-sheen" aria-hidden="true" />
                  <div className="portfolio-card-photo-wrap">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={card.aboutPartner || "Founder team photo"}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="portfolio-card-photo-placeholder" />
                    )}
                  </div>

                  <div className="portfolio-card-logo-bar">
                    {logoUrl && (
                      <Image
                        src={logoUrl}
                        alt=""
                        width={191}
                        height={56}
                        className={`portfolio-card-logo-img ${logoSizeClass}`}
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {/* 2. Hover State: Back Face (White Details Card) */}
                <div className="portfolio-card-hover-overlay portfolio-card-back">
                  <div className="portfolio-card-sheen" aria-hidden="true" />
                  {/* Company Logo: Width 185px, Height 56px, Top: 48px, Left: 40px */}
                  <div className="portfolio-hover-logo-wrap">
                    {logoUrl && (
                      <Image
                        src={logoUrl}
                        alt=""
                        width={191}
                        height={56}
                        className={`portfolio-card-logo-img ${logoSizeClass}`}
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Description: 370px x 64px, Rubik 400 18px / 32px, #1E1A1A 70% */}
                  {card.aboutPartner && (
                    <p className="portfolio-hover-description">
                      {card.aboutPartner}
                    </p>
                  )}

                  {/* Founders Group: 370px x 59px, Top: 240px */}
                  {card.founder && (
                    <div className="portfolio-hover-founders">
                      <span className="portfolio-founders-label">{foundersLabel}</span>
                      <span className="portfolio-founders-names">
                        {card.founder}
                      </span>
                    </div>
                  )}

                  {/* Bottom Action Row: LinkedIn, Facebook, Website URL button (Gap: 12px, Height: 44px) */}
                  <div className="portfolio-hover-actions">
                    {/* LinkedIn */}
                    <a
                      href={
                        cleanUrl.startsWith("http")
                          ? cleanUrl
                          : `https://${cleanUrl || "linkedin.com"}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portfolio-hover-icon-btn group/btn"
                      aria-label="LinkedIn"
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="43"
                          height="43"
                          rx="21.5"
                          stroke="#1E1A1A"
                          strokeOpacity="0.1"
                          className="group-hover/btn:stroke-[#EE6723] transition-colors"
                        />
                        <path
                          d="M19.6468 19.2252H23.0513V20.921C23.5417 19.9457 24.7994 19.0693 26.6887 19.0693C30.3104 19.0693 31.1702 21.0108 31.1702 24.573V31.1702H27.5036V25.3842C27.5036 23.3557 27.0132 22.2117 25.7647 22.2117C24.0331 22.2117 23.3135 23.4446 23.3135 25.3833V31.1702H19.6468V19.2252V19.2252ZM13.3594 31.0144H17.0261V19.0693H13.3594V31.0144V31.0144ZM17.5513 15.1744C17.5515 15.4817 17.4905 15.786 17.372 16.0696C17.2535 16.3532 17.0798 16.6104 16.8611 16.8262C16.4178 17.2668 15.8177 17.5134 15.1927 17.5119C14.5689 17.5115 13.9702 17.2655 13.5262 16.8272C13.3083 16.6106 13.1352 16.3531 13.0169 16.0695C12.8986 15.7859 12.8374 15.4817 12.8369 15.1744C12.8369 14.5538 13.0844 13.9598 13.5272 13.5217C13.9707 13.0827 14.5696 12.8366 15.1937 12.8369C15.8188 12.8369 16.4183 13.0835 16.8611 13.5217C17.3029 13.9598 17.5513 14.5538 17.5513 15.1744Z"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          fill="currentColor"
                          className="opacity-50 group-hover/btn:opacity-100 transition-opacity"
                        />
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href={
                        cleanUrl.startsWith("http")
                          ? cleanUrl
                          : `https://${cleanUrl || "facebook.com"}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portfolio-hover-icon-btn group/btn"
                      aria-label="Facebook"
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="43"
                          height="43"
                          rx="21.5"
                          stroke="#1E1A1A"
                          strokeOpacity="0.1"
                          className="group-hover/btn:stroke-[#EE6723] transition-colors"
                        />
                        <path
                          d="M20.0422 32V22.6154H18V19.2365H20.0422V16.3505C20.0422 14.0826 21.2486 12 24.0282 12C25.1537 12 25.9859 12.1311 25.9859 12.1311L25.9203 15.2864C25.9203 15.2864 25.0716 15.2764 24.1454 15.2764C23.143 15.2764 22.9824 15.8377 22.9824 16.7693V19.2365H26L25.8687 22.6154H22.9824V32H20.0422Z"
                          fill="currentColor"
                          className="opacity-50 group-hover/btn:opacity-100 transition-opacity"
                        />
                      </svg>
                    </a>

                    {/* Website Link Pill */}
                    {displayUrl && (
                      <a
                        href={
                          cleanUrl.startsWith("http")
                            ? cleanUrl
                            : `https://${cleanUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portfolio-hover-url-btn group/url"
                      >
                        <span className="portfolio-hover-url-text">
                          {displayUrl}
                        </span>
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="portfolio-hover-url-arrow"
                          aria-hidden="true"
                        >
                          <path
                            d="M13.012 4.04321L3.42565 4.04321L3.42565 2L16.5 2L16.5 15.0745H14.4568L14.4568 5.48796L3.94475 16L2.5 14.5552L13.012 4.04321Z"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            fill="currentColor"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
