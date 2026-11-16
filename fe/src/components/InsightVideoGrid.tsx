"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InsightVideoCard, getStrapiMediaUrl } from "@/lib/strapi";
import ReadMoreSvg from "./ReadMoreSvg";

const PAGE_SIZE = 9;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso?: string | null) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

export default function InsightVideoGrid({
  videos,
  loadMoreLabel = "",
  bylineSuffix = "",
}: {
  videos: InsightVideoCard[];
  loadMoreLabel?: string;
  bylineSuffix?: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = videos.slice(0, visible);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22.5px] 2xl:gap-[30px]">
        {shown.map((v, idx) => {
          const thumb = v.thumbnail?.url ? getStrapiMediaUrl(v.thumbnail.url) : null;
          const href = v.readMoreUrl || v.videoUrl || "#";
          const external = href.startsWith("http");
          return (
            <article
              key={v.id ?? idx}
              className="w-full bg-white rounded-[9px] 2xl:rounded-[12px] overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-[199.5px] 2xl:h-[266px] bg-[#EFE9E4] overflow-hidden">
                {thumb && (
                  <Image
                    src={thumb}
                    alt={v.thumbnail?.alternativeText || v.title || "Video thumbnail"}
                    fill
                    sizes="450px"
                    className="object-cover"
                    unoptimized
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-[42px] h-[42px] 2xl:w-[56px] 2xl:h-[56px] rounded-full bg-white/70 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] 2xl:w-[24px] 2xl:h-[24px] ml-[2px]" fill="#1E1A1A" aria-hidden>
                      <path d="M7 4.5v15l12-7.5-12-7.5Z" />
                    </svg>
                  </span>
                </span>
              </div>

              <div className="flex flex-col flex-1 px-[18px] 2xl:px-[24px] pt-[18px] 2xl:pt-[24px] pb-[18px] 2xl:pb-[24px]">
                <h3 className="text-[21px] 2xl:text-[28px] leading-[24.75px] 2xl:leading-[33px] font-medium text-[#1E1A1A] m-0">
                  {v.title}
                </h3>
                <p className="mt-[12px] 2xl:mt-[16px] text-[15px] 2xl:text-[20px] leading-[22px] 2xl:leading-[28px] text-[#6B6561] m-0">
                  <span className="font-medium">{v.seriesName}</span>
                  <span className="font-normal"> {bylineSuffix}</span>
                </p>

                <div className="mt-auto pt-[30px] 2xl:pt-[40px]">
                  {v.publishedOn && (
                    <p className="text-[12px] 2xl:text-[16px] leading-[18px] 2xl:leading-[24px] text-[#1E1A1A] m-0">
                      {formatDate(v.publishedOn)}
                    </p>
                  )}
                  <p className="mt-[12px] 2xl:mt-[16px] h-[72px] 2xl:h-[96px] overflow-hidden text-[13.5px] 2xl:text-[18px] leading-[24px] 2xl:leading-[32px] text-[#6B6561] m-0 line-clamp-3">
                    {v.description}
                  </p>
                  <Link
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group/link inline-flex items-center mt-[12px] 2xl:mt-[16px] no-underline text-[#1E1A1A] hover:text-[#EE6723] transition-colors duration-200"
                    aria-label="Read more"
                  >
                    <ReadMoreSvg className="w-[93.75px] h-[24px] 2xl:w-[125px] 2xl:h-[32px] block flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visible < videos.length && (
        <div className="flex justify-center mt-[60px] 2xl:mt-[90px]">
          <button
            type="button"
            onClick={() => setVisible((n) => n + PAGE_SIZE)}
            className="w-[141px] h-[42px] 2xl:w-[188px] 2xl:h-[56px] rounded-[6px] 2xl:rounded-[8px] p-[1.5px] 2xl:p-[2px] cursor-pointer"
            style={{ background: "linear-gradient(118.5deg, #EEAB41 0%, #DF6E38 100%)" }}
          >
            <span className="w-full h-full rounded-[5px] 2xl:rounded-[6px] bg-white flex items-center justify-center text-[13.5px] 2xl:text-[18px] font-medium text-[#EE7A30]">
              {loadMoreLabel}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
