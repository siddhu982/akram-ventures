import { getHomepage, getFooter, getAboutSection, getSiteLabels } from "@/lib/strapi";
import HeroSection from "@/components/HeroSection";
import DynamicZone from "@/components/DynamicZone";
import FeaturedStorySlider from "@/components/FeaturedStorySlider";
import ArkamAboutCard from "@/components/ArkamAboutCard";
import BackgroundGlow from "@/components/BackgroundGlow";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [homepage, footerData, aboutData, labels] = await Promise.all([
    getHomepage(),
    getFooter(),
    getAboutSection(),
    getSiteLabels(),
  ]);

  return (
    <div className="relative flex flex-col w-full bg-white overflow-hidden min-h-screen">
      <div
        className="bg-tint-layer"
        aria-hidden="true"
        style={{
          background: "rgba(238, 103, 35, 1)",
        }}
      />

      <div className="bg-glow-container" aria-hidden="true">
        <BackgroundGlow />
      </div>

      <HeroSection heading={homepage?.Heading} />

      <DynamicZone layout={homepage?.addYourLayout} viewAllStoriesLabel={labels?.viewAllStoriesLabel} viewMoreLabel={labels?.viewMoreLabel} />

      {!homepage?.addYourLayout?.some(
        (c) => c.__component === "homepage.featured-stories"
      ) &&
        homepage?.stories &&
        homepage.stories.length > 0 && (
          <FeaturedStorySlider stories={homepage.stories} />
        )}

      <ArkamAboutCard data={aboutData} />

      <Footer data={footerData} />
    </div>
  );
}
