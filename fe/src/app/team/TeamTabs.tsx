"use client";

import { useState } from "react";
import Image from "next/image";
import { TeamMember, getStrapiMediaUrl } from "@/lib/strapi";

function TeamCard({ member }: { member: TeamMember }) {
  const photoUrl = member.profilePicture?.url
    ? getStrapiMediaUrl(member.profilePicture.url)
    : null;

  const linkedin = member.SocialMediaRepeater?.find(
    (s) => s.Text?.toLowerCase() === "linkedin"
  );
  const twitter = member.SocialMediaRepeater?.find(
    (s) => s.Text?.toLowerCase() === "twitter"
  );

  return (
    <div className="flex flex-col gap-[12px] 2xl:gap-[16px]">
      {/* Profile photo: 330×322 at 1920px, 247.5×241.5 at 1440px, no border radius */}
      <div className="relative w-full h-[241.5px] 2xl:h-[322px] overflow-hidden bg-neutral-100">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={member.Name || "Team member"}
            fill
            className="object-cover object-top grayscale"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
            Photo
          </div>
        )}
      </div>

      {/* Name: Rubik 500, 24px / 18px */}
      <p
        className="text-[18px] 2xl:text-[24px] font-medium leading-none text-[#1E1A1A]"
        style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
      >
        {member.Name}
      </p>

      {/* Designation: Rubik 400, 18px / 13.5px, 70% opacity */}
      {member.designation ? (
        <p
          className="text-[13.5px] 2xl:text-[18px] leading-[18px] 2xl:leading-[24px] text-[#1E1A1A] opacity-70"
          style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
        >
          {member.designation}
        </p>
      ) : (
        <div className="h-[13.5px] 2xl:h-[18px]" />
      )}

      {/* Social icons: 44×44 at 1920px, 33×33 at 1440px */}
      <div className="flex items-center gap-[9px] 2xl:gap-[12px]">
        {linkedin && (
          <a
            href={linkedin.ProfileUri || "https://www.linkedin.com"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.Name} LinkedIn`}
            className="shrink-0 hover:opacity-70 transition-opacity"
          >
            <Image
              src="/images/linkedin-icon.svg"
              alt="LinkedIn"
              width={44}
              height={44}
              className="w-[33px] h-[33px] 2xl:w-[44px] 2xl:h-[44px]"
            />
          </a>
        )}
        {twitter && (
          <a
            href={twitter.ProfileUri || "https://twitter.com"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.Name} Twitter`}
            className="shrink-0 hover:opacity-70 transition-opacity"
          >
            <Image
              src="/images/twitter-icon.svg"
              alt="Twitter"
              width={44}
              height={44}
              className="w-[33px] h-[33px] 2xl:w-[44px] 2xl:h-[44px]"
            />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TeamTabs({
  boardMembers,
  advisors,
}: {
  boardMembers: TeamMember[];
  advisors: TeamMember[];
}) {
  const [activeTab, setActiveTab] = useState<"Team" | "Advisors">("Team");
  const members = activeTab === "Team" ? boardMembers : advisors;

  return (
    <>
      {/* Tab switcher — sliding pill
          1440px: container 253.5×45, pill 122.25×36, padding 4.5px
          1920px: container 338×60,   pill 163×48,    padding 6px   */}
      <div className="flex justify-center mb-[60px] 2xl:mb-[80px]">
        <div className="relative flex items-center bg-white border border-[rgba(30,26,26,0.1)] rounded-[22.5px] 2xl:rounded-[30px] p-[4.5px] 2xl:p-[6px] w-[253.5px] h-[45px] 2xl:w-[338px] 2xl:h-[60px]">

          {/* Sliding dark pill — translateX(100%) = shift by own width to reach 2nd button */}
          <div
            className="absolute top-[4.5px] 2xl:top-[6px] left-[4.5px] 2xl:left-[6px] w-[122.25px] h-[36px] 2xl:w-[163px] 2xl:h-[48px] rounded-[18px] 2xl:rounded-[24px] bg-[#1E1A1A] transition-transform duration-300 ease-in-out"
            style={{ transform: activeTab === "Advisors" ? "translateX(100%)" : "translateX(0)" }}
          />

          <button
            onClick={() => setActiveTab("Team")}
            className={`relative z-10 flex items-center justify-center gap-[6px] 2xl:gap-[8px] flex-1 h-full text-[13.5px] 2xl:text-[18px] font-medium transition-colors duration-300 ${
              activeTab === "Team" ? "text-white" : "text-[#1E1A1A]"
            }`}
            style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
          >
            {activeTab === "Team" && (
              <span className="w-[7.5px] h-[7.5px] 2xl:w-[10px] 2xl:h-[10px] rounded-full bg-[#EE6723] shrink-0" />
            )}
            Team
          </button>

          <button
            onClick={() => setActiveTab("Advisors")}
            className={`relative z-10 flex items-center justify-center gap-[6px] 2xl:gap-[8px] flex-1 h-full text-[13.5px] 2xl:text-[18px] font-medium transition-colors duration-300 ${
              activeTab === "Advisors" ? "text-white" : "text-[#1E1A1A]"
            }`}
            style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
          >
            {activeTab === "Advisors" && (
              <span className="w-[7.5px] h-[7.5px] 2xl:w-[10px] 2xl:h-[10px] rounded-full bg-[#EE6723] shrink-0" />
            )}
            Advisors
          </button>
        </div>
      </div>

      {/* key={activeTab} remounts the div on each switch → triggers teamFadeIn animation */}
      <div
        key={activeTab}
        className="team-content-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[20px] sm:gap-x-[30px] lg:gap-x-[67.5px] 2xl:gap-x-[90px] gap-y-[40px] lg:gap-y-[60px] 2xl:gap-y-[80px]"
      >
        {members.map((member) => (
          <TeamCard key={member.documentId || member.id} member={member} />
        ))}
      </div>
    </>
  );
}
