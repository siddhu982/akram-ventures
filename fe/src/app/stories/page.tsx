import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getStories, getStoriesPage, getFooter, getStrapiMediaUrl, StoryData } from "@/lib/strapi";
import Footer from "@/components/Footer";
import ReadMoreSvg from "@/components/ReadMoreSvg";

export const revalidate = 30;

function renderByline(byText?: string) {
  if (!byText) return null;
  const match = byText.match(/^([bB]y\s+)(.*)$/);
  if (match) {
    return (
      <>
        <span className="font-normal">{match[1]}</span>
        <span className="font-medium">{match[2]}</span>
      </>
    );
  }
  return <span className="font-medium">{byText}</span>;
}

export default async function StoriesPage() {
  const [stories, storiesPageData, footerData] = await Promise.all([
    getStories(),
    getStoriesPage(),
    getFooter(),
  ]);

  const heading = storiesPageData?.heading ?? "";
  const featured: StoryData | undefined = stories[0];
  const cards: StoryData[] = stories.slice(1);

  const brandLogoUrl = (featured?.brandLogo?.url && getStrapiMediaUrl(featured.brandLogo.url)) || null;

  const blogImgUrl =
    (featured?.blogImg?.url && getStrapiMediaUrl(featured.blogImg.url)) ||
    "/images/stories/Rectangle 4045.jpg";

  return (
    <div
      className="relative min-h-screen bg-white flex flex-col w-full pt-[150px] 2xl:pt-[200px]"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
    >
      {/* Top section: Heading + Featured card (white background) */}
      <div className="relative z-10 w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0">
        <h1 className="text-[48px] 2xl:text-[64px] leading-none font-medium text-[#1E1A1A] text-center mb-[60px] 2xl:mb-[80px]">
          {heading}
        </h1>

        {featured && (
          <section
            className="w-full rounded-[13.5px] 2xl:rounded-[18px] p-[42px] 2xl:p-[56px] mb-[60px] 2xl:mb-[80px] flex items-center"
            style={{ backgroundColor: "#FFF5E4", minHeight: "369.75px" }}
          >
            <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-0">
              <div className="shrink-0 flex flex-col justify-between w-full lg:w-[427.5px] 2xl:w-[570px] min-h-[285.75px] 2xl:min-h-[381px]">
                <div className="relative h-[30px] 2xl:h-[40px] w-[60.75px] 2xl:w-[81px]">
                  {brandLogoUrl && (
                    <Image
                      src={brandLogoUrl}
                      alt={featured.brandLogo?.alternativeText || ""}
                      fill
                      className="object-contain object-left"
                      unoptimized
                    />
                  )}
                </div>

                <h2 className="font-semibold text-[27px] 2xl:text-[36px] leading-[36px] 2xl:leading-[48px] text-[#232323] m-0 p-0">
                  {featured.shortDes}
                </h2>

                <p className="font-normal text-[13.5px] 2xl:text-[18px] leading-[24.75px] 2xl:leading-[33px] text-[#1E1A1A] m-0 p-0 opacity-100 line-clamp-3">
                  {featured.description}
                </p>

                <Link
                  href={featured.readMore || `/stories/${featured.slug || ""}`}
                  target={featured.readMore ? "_blank" : undefined}
                  rel={featured.readMore ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center no-underline text-[#1E1A1A] hover:text-[#EE6723] transition-colors duration-200 mt-1"
                  aria-label="Read more"
                >
                  <ReadMoreSvg className="w-[93.75px] h-[24px] 2xl:w-[125px] 2xl:h-[32px] block flex-shrink-0 transition-colors duration-200" />
                </Link>
              </div>

              <div className="relative w-full lg:w-[355.5px] 2xl:w-[474px] h-[214.5px] lg:h-[285.75px] 2xl:h-[381px] shrink-0 rounded-[12px] 2xl:rounded-[16px] overflow-hidden bg-[#3F7C77]/10">
                <Image
                  src={blogImgUrl}
                  alt={featured.shortDes || "Featured story image"}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Cards + Footer section with full-width background glow */}
      <div className="relative w-full flex-1 [&_.footer-section]:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none select-none z-0"
        >
          <Image
            src="/images/stories/stories-bg-glow.png"
            alt=""
            fill
            className="object-cover object-top"
            unoptimized
          />
        </div>

        {cards.length > 0 && (
          <div className="relative z-10 w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0 pb-[90px] 2xl:pb-[120px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[22.5px] 2xl:gap-x-[30px] gap-y-[30px] 2xl:gap-y-[40px]">
              {cards.map((card, idx) => {
                const cardImgUrl =
                  (card.blogImg?.url && getStrapiMediaUrl(card.blogImg.url)) ||
                  "/images/stories/Rectangle 6719.jpg";

                return (
                  <article
                    key={card.id ?? idx}
                    className="w-full max-w-[337.5px] 2xl:max-w-[450px] mx-auto lg:mx-0 h-[464.25px] 2xl:h-[619px] bg-white rounded-[6px] 2xl:rounded-[8px] overflow-hidden flex flex-col group shadow-none"
                  >
                    {cardImgUrl && (
                      <div className="relative w-full h-[210px] 2xl:h-[280px] shrink-0 overflow-hidden bg-gray-100">
                        <Image
                          src={cardImgUrl}
                          alt={card.shortDes || "Story image"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 px-[18px] 2xl:px-[24px] pt-[18px] 2xl:pt-[24px] pb-[24px] 2xl:pb-[32px]">
                      <h3 className="font-medium text-[21px] 2xl:text-[28px] leading-[24.75px] 2xl:leading-[33px] text-[#1E1A1A] line-clamp-2 min-h-[49.5px] 2xl:min-h-[66px] max-h-[49.5px] 2xl:max-h-[66px] group-hover:text-[#EE6723] transition-colors duration-200 m-0 p-0">
                        {card.shortDes}
                      </h3>

                      {card.by ? (
                        <p className="font-rubik text-[15px] 2xl:text-[20px] leading-[18px] 2xl:leading-[24px] text-[#1E1A1A] opacity-100 h-[18px] 2xl:h-[24px] overflow-hidden whitespace-nowrap text-ellipsis mt-[12px] 2xl:mt-[16px] m-0 p-0">
                          {renderByline(card.by)}
                        </p>
                      ) : (
                        <div className="h-[18px] 2xl:h-[24px] mt-[12px] 2xl:mt-[16px]" />
                      )}

                      {card.description ? (
                        <p className="font-normal text-[12px] 2xl:text-[16px] leading-[21px] 2xl:leading-[28px] text-[#1E1A1A] opacity-100 h-[42px] 2xl:h-[56px] line-clamp-2 overflow-hidden mt-[12px] 2xl:mt-[16px] m-0 p-0">
                          {card.description}
                        </p>
                      ) : (
                        <div className="h-[42px] 2xl:h-[56px] mt-[12px] 2xl:mt-[16px]" />
                      )}

                      <div className="mt-auto pt-2">
                        <Link
                          href={card.readMore || "#"}
                          target={card.readMore ? "_blank" : undefined}
                          rel={card.readMore ? "noopener noreferrer" : undefined}
                          className="group/link inline-flex items-center no-underline text-[#1E1A1A] hover:text-[#EE6723] transition-colors duration-200"
                          aria-label="Read more"
                        >
                          <ReadMoreSvg className="w-[93.75px] h-[24px] 2xl:w-[125px] 2xl:h-[32px] block flex-shrink-0 transition-colors duration-200" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <Footer data={footerData} />
      </div>
    </div>
  );
}
