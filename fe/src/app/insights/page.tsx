import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getInsights,
  getFooter,
  getSiteLabels,
  InsightBookCard as BookData,
  InsightSeriesCard,
  InsightVideoCard,
} from "@/lib/strapi";
import Footer from "@/components/Footer";
import ReadMoreSvg from "@/components/ReadMoreSvg";
import InsightBookCard from "@/components/InsightBookCard";
import InsightVideoGrid from "@/components/InsightVideoGrid";

export const revalidate = 30;

export const metadata = {
  title: "Insights | Arkam Ventures",
  description: "Perspectives, research, and reflections on Middle India digitization and global SaaS from India.",
};

export default async function InsightsPage() {
  const [entries, footerData, labels] = await Promise.all([getInsights(), getFooter(), getSiteLabels()]);

  // Each entry holds one card component picked in the layout dynamic zone; group them by type.
  const components = entries.flatMap((e) => e.layout ?? []);
  const books = components.filter((c): c is BookData => c.__component === "insights.book-card");
  const series = components.filter((c): c is InsightSeriesCard => c.__component === "insights.series-card");
  const videos = components.filter((c): c is InsightVideoCard => c.__component === "insights.video-card");

  return (
    <div
      className="relative min-h-screen bg-white flex flex-col w-full pt-[150px] 2xl:pt-[200px]"
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
    >
      <div className="relative w-full flex-1 [&_.footer-section]:bg-transparent">
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src="/images/stories/stories-bg-glow.png"
            alt=""
            fill
            className="object-cover object-top"
            unoptimized
          />
        </div>

        <div className="relative z-10 w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0 pb-[90px] 2xl:pb-[120px]">
          <h1 className="text-[48px] 2xl:text-[64px] leading-none font-medium text-[#1E1A1A] text-center mb-[64px] 2xl:mb-[86px]">
            Insights
          </h1>

          {books.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-[22.5px] 2xl:gap-[30px] items-start">
              {books.map((book, i) => (
                <InsightBookCard key={book.id ?? i} book={book} tone={i % 2 === 0 ? "left" : "right"} />
              ))}
            </section>
          )}

          {series.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-[22.5px] 2xl:gap-[30px] mt-[90px] 2xl:mt-[120px]">
              {series.map((s, i) => {
                const href = s.readMoreUrl || "#";
                const external = href.startsWith("http");
                return (
                  <article
                    key={s.id ?? i}
                    className="bg-white rounded-[15px] 2xl:rounded-[20px] px-[42px] 2xl:px-[56px] pt-[42px] 2xl:pt-[56px] pb-[36px] 2xl:pb-[48px] flex flex-col min-h-[245px] 2xl:min-h-[327px]"
                    style={{ boxShadow: "0 4px 24px rgba(30,26,26,0.06)" }}
                  >
                    <h2 className="text-[30px] 2xl:text-[40px] leading-[1.2] font-medium text-[#EE6723] m-0">
                      {s.seriesTitle}
                    </h2>
                    <p className="mt-[18px] 2xl:mt-[24px] text-[15px] 2xl:text-[20px] leading-[24px] 2xl:leading-[32px] text-[#8F8A86] m-0">
                      {s.description}
                    </p>
                    <Link
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="group/link inline-flex items-center mt-auto pt-[24px] no-underline text-[#1E1A1A] hover:text-[#EE6723] transition-colors duration-200"
                      aria-label="Read more"
                    >
                      <ReadMoreSvg className="w-[93.75px] h-[24px] 2xl:w-[125px] 2xl:h-[32px] block flex-shrink-0" />
                    </Link>
                  </article>
                );
              })}
            </section>
          )}

          {videos.length > 0 && (
            <section className="mt-[80px] 2xl:mt-[111px]">
              <InsightVideoGrid videos={videos} loadMoreLabel={labels?.loadMoreLabel} bylineSuffix={labels?.videoBylineSuffix} />
            </section>
          )}
        </div>

        <Footer data={footerData} />
      </div>
    </div>
  );
}
