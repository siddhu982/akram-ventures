"use client";

import React from "react";
import Image from "next/image";
import { splitEmphasis } from "@/lib/emphasis";

interface HeroSectionProps {
  heading?: string;
}

export default function HeroSection({ heading }: HeroSectionProps) {
  const displayHeading = heading?.trim() ?? "";

  // Heading comes from Strapi, e.g. "Investing in Limitless Founders": the design styles the word
  // "Limitless" (decoration + underline), so split the text around it and keep every word editable.
  const parts = splitEmphasis(displayHeading, "Limitless");
  const isLimitless = parts !== null;

  return (
    <section className="hero-section relative w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10">

      {/* Frame / Group 48099377: Width 886px at 1920 desktop, 665px at 1440 laptop */}
      <div className="relative z-10 w-full max-w-[665px] 2xl:max-w-[886px] mx-auto flex flex-col items-center justify-center text-center">
        {isLimitless ? (
          <h1
            className="flex flex-col items-center justify-center text-center tracking-normal text-[#4D3939]"
            style={{
              fontFamily: "var(--font-rubik), Rubik, sans-serif",
            }}
          >
            {/* Line 1: Investing in (88px at 1920, 66px at 1440, line-height 86px at 1920, 65px at 1440) */}
            <span
              className="block text-3xl sm:text-4xl md:text-5xl lg:text-[66px] 2xl:text-[88px] text-[#4D3939] leading-[1.08] lg:leading-[65px] 2xl:leading-[86px]"
              style={{
                fontWeight: 300,
              }}
            >
              {parts?.before.trim()}
            </span>

            {/* Line 2: Limitless Founders */}
            <div className="relative inline-flex items-center justify-center flex-wrap gap-x-2.5 sm:gap-x-[15px] 2xl:gap-x-[20px] mt-1 sm:mt-1.5 2xl:mt-2">
              {/* Limitless with decoration and underline */}
              <span className="relative inline-block">
                {/* Decoration SVG directly from Figma: 42x44 at 1920, 32x33 at 1440 */}
                <svg
                  width="42"
                  height="44"
                  viewBox="0 0 42 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -top-[10px] sm:-top-[12px] lg:-top-[15px] 2xl:-top-[20px] -left-[14px] sm:-left-[18px] lg:-left-[22px] 2xl:-left-[30px] w-[24px] h-[25px] sm:w-[28px] sm:h-[29px] lg:w-[32px] lg:h-[33px] 2xl:w-[42px] 2xl:h-[44px] pointer-events-none select-none"
                >
                  <path
                    d="M1.50419 31.1628C1.6937 30.9445 1.82746 30.6933 1.89874 30.4217C1.95236 30.1654 2.19052 30.0525 2.52068 30.0431C4.73643 29.9805 6.93442 30.3298 9.1574 30.8485C11.866 31.4805 14.5334 32.2458 17.1944 33.0574C19.6308 33.804 22.0738 34.527 24.5231 35.2265C25.1396 35.4037 25.7739 35.5046 26.3487 35.8107C26.631 35.9603 26.7993 36.0826 26.5351 36.3498C26.1765 36.6907 25.8645 37.0647 25.6034 37.4664C25.4682 37.6909 25.205 37.7743 24.8834 37.7489C24.6912 37.7346 24.4963 37.68 24.3118 37.7334L23.2599 37.546C21.8335 37.108 20.4019 36.6914 18.9687 36.2798C16.7463 35.6396 14.5614 34.8713 12.3216 34.2797C10.6173 33.8293 8.90665 33.4123 7.20395 32.9673C5.91399 32.6261 4.58223 32.4018 3.36613 31.8398C2.75071 31.5575 2.0787 31.5638 1.49634 31.2477L1.50419 31.1628Z"
                    fill="#EE6723"
                  />
                  <path
                    d="M38.8754 21.9814C38.8263 22.0939 38.7853 22.2119 38.725 22.3183C38.6141 22.5156 38.4965 22.5942 38.195 22.4289C37.626 22.1302 37.0443 21.8582 36.4526 21.6142C36.1607 21.4886 35.9604 21.3181 35.8795 21.0324C35.1438 18.4389 33.9163 15.9684 32.6975 13.4957C32.3844 12.8616 32.1179 12.2173 31.8108 11.5746C31.3275 10.5751 31.5631 9.65952 31.7262 8.7325L31.8308 8.75317C32.1398 8.94613 32.4549 9.10151 32.8199 9.1329C33.07 9.15419 33.3147 9.23068 33.395 9.52385C33.439 9.68297 33.5881 9.77259 33.7096 9.877C34.2344 10.3234 34.661 10.8604 34.9579 11.4487C35.3482 12.2368 35.7603 13.0176 36.1267 13.8135C37.2856 16.3326 38.6968 18.8035 38.9124 21.5037L38.8754 21.9814Z"
                    fill="#EE6723"
                  />
                  <path
                    d="M12.0327 7.89259C12.307 7.91662 12.4551 8.06785 12.6044 8.23101C13.6508 9.37127 14.7774 10.4452 15.8144 11.5993C16.5382 12.4073 17.4548 13.0742 18.2846 13.8017C20.2314 15.511 22.0546 17.3308 23.8578 19.1648C25.5643 20.9037 27.2187 22.6786 28.7844 24.5224C29.5587 25.4352 30.1757 26.4264 30.8331 27.3983C31.2844 28.0648 31.0244 28.393 30.1361 28.3904C29.5437 28.3907 28.9397 28.3197 28.3588 28.4191C27.8795 28.5019 27.5634 28.1752 27.2826 27.8324C25.6314 25.7884 23.827 23.8587 22.0204 21.9274C20.1624 19.9421 18.2206 18.0237 16.4469 15.9674C15.4284 14.7872 14.6545 13.504 13.7642 12.2701C12.9456 11.1642 12.0604 10.0972 11.1141 9.07532C11.0353 8.98811 10.9427 8.91096 10.8651 8.82388C10.3045 8.19356 10.3371 8.09827 11.1514 8.02629C11.4602 8.00107 11.7189 7.79902 12.0327 7.89259Z"
                    fill="#EE6723"
                  />
                </svg>

                {/* Limitless text (88px at 1920, 66px at 1440, line-height 86px at 1920, 65px at 1440) */}
                <span
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[66px] 2xl:text-[88px] text-[#4D3939] leading-[1.08] lg:leading-[65px] 2xl:leading-[86px]"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {parts?.match}
                </span>

                {/* Solid underline: 7px at 1920, 5.25px at 1440 */}
                <div
                  className="absolute -bottom-1 sm:-bottom-1.5 lg:-bottom-[6px] 2xl:-bottom-[8px] left-0 w-full h-[4.5px] lg:h-[5.25px] 2xl:h-[7px] rounded-full"
                  style={{ backgroundColor: "rgba(238, 103, 35, 1)" }}
                />
              </span>

              {/* Founders text (88px at 1920, 66px at 1440) */}
              <span
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[66px] 2xl:text-[88px] text-[#4D3939] leading-[1.08] lg:leading-[65px] 2xl:leading-[86px]"
                style={{
                  fontWeight: 300,
                }}
              >
                {parts?.after.trim()}
              </span>
            </div>
          </h1>
        ) : (
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[66px] 2xl:text-[88px] text-[#4D3939] leading-[1.08] lg:leading-[65px] 2xl:leading-[86px]"
            style={{
              fontFamily: "var(--font-rubik), Rubik, sans-serif",
              fontWeight: 500,
            }}
          >
            {displayHeading}
          </h1>
        )}
      </div>
    </section>
  );
}
