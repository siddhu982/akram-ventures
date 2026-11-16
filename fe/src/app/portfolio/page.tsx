import { getPortfolioPage, getFooter, getSiteLabels } from "@/lib/strapi";
import PortfolioHero from "@/components/PortfolioHero";
import PortfolioGrid from "@/components/PortfolioGrid";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Portfolio | Arkam Ventures",
  description: "Arkam Ventures portfolio companies",
};

export default async function PortfolioPage() {
  const [portfolioPage, footerData, labels] = await Promise.all([
    getPortfolioPage(),
    getFooter(),
    getSiteLabels(),
  ]);

  const cards =
    portfolioPage?.containerForRemainingComponents?.find(
      (c) => c.__component === "portfolio.partner-cards"
    )?.actualCard ?? [];

  return (
    <div className="relative flex flex-col w-full bg-white overflow-hidden min-h-screen">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/portfolio-hero-glow.png" alt="" className="portfolio-page-bg" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/portfolio-grid-bg.png" alt="" className="portfolio-grid-bg" aria-hidden="true" />
      <PortfolioHero
        heading={portfolioPage?.heroHeading}
        heroLogos={portfolioPage?.heroLogos}
      />
      <PortfolioGrid cards={cards} foundersLabel={labels?.foundersLabel} />

      <Footer data={footerData} />
    </div>
  );
}
