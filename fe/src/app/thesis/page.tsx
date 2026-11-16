import React from "react";
import Image from "next/image";
import { getThesisPage, getFooter, getStrapiMediaUrl, StrapiMedia } from "@/lib/strapi";
import { splitEmphasis } from "@/lib/emphasis";
import ThesisSectorsGrid from "@/components/ThesisSectorsGrid";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Thesis | Arkam Ventures",
  description: "Arkam Ventures is a thesis centric early-stage venture capital firm",
};

const LOGO_DIMENSIONS: Record<string, { w1920: number; h1920: number; w1440: number; h1440: number }> = {
  jumbotail: { w1920: 144, h1920: 47, w1440: 108, h1440: 35.25 },
  jar: { w1920: 94, h1920: 46, w1440: 70.5, h1440: 34.5 },
  kreditbee: { w1920: 99, h1920: 60, w1440: 74.25, h1440: 45 },
  smartstaff: { w1920: 109.11, h1920: 60.62, w1440: 81.83, h1440: 45.47 },
  smallcase: { w1920: 188, h1920: 48, w1440: 141, h1440: 36 },
  spotdraft: { w1920: 183, h1920: 48, w1440: 137.25, h1440: 36 },
  signzy: { w1920: 151.2, h1920: 48, w1440: 113.4, h1440: 36 },
  cusmat: { w1920: 94, h1920: 70, w1440: 70.5, h1440: 52.5 },
  customerglu: { w1920: 180, h1920: 48, w1440: 135, h1440: 36 },
};

// Image URL from Strapi, or null when the field is empty
function mediaUrl(media: StrapiMedia | null | undefined): string | null {
  return (media?.url && getStrapiMediaUrl(media.url)) || null;
}

export default async function ThesisPage() {
  const [thesisData, footerData] = await Promise.all([getThesisPage(), getFooter()]);

  if (!thesisData) {
    return null;
  }

  const bottomSliderComponent = thesisData.bottomSlider?.find(
    (c) => c.__component === "thesis.bottom-slider-heading"
  );

  const heroHeading = thesisData.heroHeading || "";
  const heroParts = splitEmphasis(heroHeading, "thesis centric");
  const heroSubheading = thesisData.heroSubheading || "";
  const indiaQuote = thesisData.indiaQuote || "";
  const themesIntroText = thesisData.themesIntroText || "";
  const themesParts = splitEmphasis(themesIntroText, "two major themes");
  const themeCards = thesisData.themeCards || [];
  const showcases = thesisData.showcases || [];
  const statsSrc = mediaUrl(thesisData.statsImage);
  const portraitsSrc = mediaUrl(thesisData.portraitsImage);

  return (
    <div className="thesis-page-container">
      {/* 1. Hero Background Layers
          - Rectangle 6733: Width 1920px, Height 760px, Color #FCEEE8
          - Group 270: Width 2547px, Height 1317.7px, Top -138px, Left -313px, Opacity 10%, Layer Blur 394 */}
      <div className="thesis-hero-bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/thesis/thesis-glow.png" alt="" className="thesis-hero-glow" aria-hidden="true" />
      </div>

      {/* 2. Hero Content Section */}
      <section className="thesis-hero-section" aria-label="Thesis Hero">
        <h1 className="thesis-hero-heading">
          {heroParts ? (
            <>
              <span>{heroParts.before}</span>
              <span className="thesis-hero-highlight">
                {heroParts.match}
                <span className="thesis-hero-underline" aria-hidden="true" />
              </span>
              <span>{heroParts.after}</span>
            </>
          ) : (
            heroHeading
          )}
        </h1>
        <p className="thesis-hero-subheading">{heroSubheading}</p>
      </section>

      {/* 3. India Adoption Intro Section (Stats Card + Vision Quote) */}
      <section className="thesis-intro-section" aria-label="India digital adoption thesis">
        <div className="thesis-stats-wrap">
          {statsSrc && (
            <Image
              src={statsSrc}
              alt={thesisData?.statsImage?.alternativeText || ""}
              width={591}
              height={542}
              className="w-full h-auto object-contain"
              priority
              unoptimized
            />
          )}
        </div>
        <div className="w-full lg:w-[517.5px] 2xl:w-[690px] lg:flex-none">
          <h2 className="thesis-intro-quote">{indiaQuote}</h2>
        </div>
      </section>

      {/* 4. Portraits / Mosaic Banner (1410px x 531px, Radius 16px) */}
      <section className="thesis-portraits-section" aria-label="People and founders mosaic">
        <div className="thesis-portraits-wrap">
          {portraitsSrc && (
            <Image
              src={portraitsSrc}
              alt={thesisData?.portraitsImage?.alternativeText || ""}
              width={1410}
              height={531}
              className="w-full h-auto object-cover"
              unoptimized
            />
          )}
        </div>
      </section>

      {/* 5. Two Major Themes Overview Section */}
      <section className="thesis-themes-section" aria-label="Two major investment themes">
        <p className="thesis-themes-intro-text">
          {themesParts ? (
            <>
              {themesParts.before}
              <span className="text-[#EE6723] font-medium">{themesParts.match}</span>
              {themesParts.after}
            </>
          ) : (
            themesIntroText
          )}
        </p>

        <div className="thesis-themes-grid">
          {themeCards.map((card, idx) => {
            const iconSrc = mediaUrl("icon" in card ? card.icon : null);
            return (
            <div key={card.id ?? idx} className="thesis-theme-card group">
              {iconSrc && (
                <Image
                  src={iconSrc}
                  alt=""
                  width={72}
                  height={72}
                  className="thesis-theme-icon"
                  unoptimized
                />
              )}
              <h3 className="thesis-theme-title">{card.title}</h3>
              <p className="thesis-theme-desc">{card.description}</p>
            </div>
            );
          })}
        </div>
      </section>

      {/* 6 & 7. Middle India / SaaS detailed showcases */}
      {showcases.map((showcase, idx) => {
        const cms = showcase;
        const cmsLogos = (showcase.logos ?? []).filter((l) => l.img1?.url);
        const isImageLeft = showcase.layoutDirection === "image-left";
        const featureSrc = mediaUrl(cms.featureImage);
        const featureAlt = cms.featureImage?.alternativeText || "";
        const tagIconSrc = mediaUrl(cms.tagIcon);

        return (
          <section
            key={showcase.id ?? idx}
            className={`thesis-showcase-section showcase-${idx + 1}`}
            aria-label={`${showcase.tag} feature`}
          >
            <div className={`thesis-showcase-stage ${isImageLeft ? "is-left" : ""}`}>
              <div className="thesis-showcase-card">
                <div className="thesis-showcase-text-frame">
                  <div className="thesis-showcase-tag">
                    {tagIconSrc && (
                      <Image
                        src={tagIconSrc}
                        alt=""
                        width={56}
                        height={56}
                        className="thesis-showcase-tag-icon"
                        unoptimized
                      />
                    )}
                    <span className="thesis-showcase-tag-label">{showcase.tag}</span>
                  </div>
                  <h2 className="thesis-showcase-title">{showcase.heading}</h2>
                  <p className="thesis-showcase-desc">{showcase.description}</p>
                </div>
              </div>

              <div className="thesis-showcase-media">
                {featureSrc && (
                  <Image
                    src={featureSrc}
                    alt={featureAlt}
                    width={480}
                    height={488}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                )}
              </div>
            </div>

            <div className={`thesis-showcase-logos logo-row-${idx + 1}`}>
              {cmsLogos.length > 0 ? (
                <ul className={`thesis-logo-list list-row-${idx + 1} list-none m-0 p-0`}>
                  {cmsLogos.map((logo, i) => {
                    const rawName = logo.imgTxt || logo.img1?.alternativeText || "";
                    const nameKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
                    const isKnown = Boolean(LOGO_DIMENSIONS[nameKey]);
                    return (
                      <li key={logo.id ?? i} className="flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getStrapiMediaUrl(logo.img1!.url) || ""}
                          alt={rawName || "Portfolio company logo"}
                          className={`object-contain block ${isKnown ? `logo-item-${nameKey}` : "h-[36px] 2xl:h-[48px] w-auto"}`}
                        />
                      </li>
                    );
                  })}
                </ul>
                            ) : null}
            </div>
          </section>
        );
      })}

      {/* 8. Sectors grid */}
      {bottomSliderComponent?.sliderImg1 && bottomSliderComponent.sliderImg1.length > 0 && (
        <ThesisSectorsGrid
          title={bottomSliderComponent.title ?? ""}
          items={bottomSliderComponent.sliderImg1}
        />
      )}

      <Footer data={footerData} />
    </div>
  );
}
