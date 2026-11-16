import { getTeamMembers, getTeamPage, getFooter } from "@/lib/strapi";
import { splitEmphasis } from "@/lib/emphasis";
import Footer from "@/components/Footer";
import TeamTabs from "./TeamTabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Team | Arkam Ventures",
  description: "Meet the Arkam Ventures team",
};

export default async function TeamPage() {
  const [boardMembers, advisors, teamPageData, footerData] = await Promise.all([
    getTeamMembers("Board"),
    getTeamMembers("Advisor"),
    getTeamPage(),
    getFooter(),
  ]);

  const heading = teamPageData?.heading ?? "";
  const headingParts = splitEmphasis(heading, "Team");

  return (
    <div className="relative min-h-screen bg-white flex flex-col w-full overflow-clip pt-[180px] 2xl:pt-[240px] [&_.footer-section]:bg-transparent">

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/team-page-bg.png"
        alt=""
        aria-hidden="true"
        className="team-page-bg"
      />

      <main className="relative z-10 flex-1 w-full max-w-[877.5px] 2xl:max-w-[1170px] mx-auto px-6 sm:px-10 lg:px-0 pb-[90px] 2xl:pb-[120px]">

        {/* "Meet the Team": Rubik 300 + Rubik 500, 64px / 48px, centered */}
        <h1
          className="text-[48px] 2xl:text-[64px] leading-none text-[#1E1A1A] text-center mb-[60px] 2xl:mb-[80px]"
          style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
        >
          {headingParts ? (
            <>
              <span className="font-light">{headingParts.before}</span>
              <span className="font-medium">{headingParts.match}</span>
              <span className="font-light">{headingParts.after}</span>
            </>
          ) : (
            <span className="font-light">{heading}</span>
          )}
        </h1>

        <TeamTabs boardMembers={boardMembers} advisors={advisors} />
      </main>

      <div className="relative z-10">
        <Footer data={footerData} />
      </div>
    </div>
  );
}
