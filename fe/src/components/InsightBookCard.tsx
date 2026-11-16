"use client";

import React, { useState } from "react";
import Image from "next/image";
import { InsightBookCard as BookData, getStrapiMediaUrl } from "@/lib/strapi";

// "left" = cream card, "right" = pink card (Figma)
export default function InsightBookCard({ book, tone }: { book: BookData; tone: "left" | "right" }) {
  const reviews = book.reviews ?? [];
  const [active, setActive] = useState(0);
  const review = reviews[active];
  const cover = book.bookCover?.url ? getStrapiMediaUrl(book.bookCover.url) : null;

  return (
    <article
      className="w-full rounded-[15px] 2xl:rounded-[20px] p-[48px] 2xl:p-[64px] flex flex-col"
      style={{
        background:
          tone === "left"
            ? "linear-gradient(135deg, #FDF4E5 0%, #FCEFE3 100%)"
            : "linear-gradient(135deg, #FCEEEA 0%, #FBEBE7 100%)",
      }}
    >
      <div className="flex items-start gap-[30px] 2xl:gap-[40px]">
        {cover && (
          <div className="relative shrink-0 w-[117.75px] h-[189.75px] 2xl:w-[157px] 2xl:h-[253px]">
            <Image
              src={cover}
              alt={book.bookCover?.alternativeText || book.bookTitle || "Book cover"}
              fill
              sizes="157px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h2 className="text-[24px] 2xl:text-[32px] leading-[30px] 2xl:leading-[40px] font-medium text-[#1E1A1A] m-0">
            {book.bookTitle}
          </h2>
          {book.bookSubtitle && (
            <p className="mt-[18px] 2xl:mt-[24px] text-[18px] 2xl:text-[24px] leading-[27px] 2xl:leading-[36px] font-medium text-[#6B6561] m-0">
              {book.bookSubtitle}
            </p>
          )}
          {book.author && (
            <p className="mt-[15px] 2xl:mt-[20px] text-[15px] 2xl:text-[20px] leading-[24px] 2xl:leading-[32px] text-[#1E1A1A] m-0">
              <span className="font-normal">by </span>
              <span className="font-medium">{book.author}</span>
            </p>
          )}
          <a
            href={book.amazonUrl || "#"}
            target={book.amazonUrl ? "_blank" : undefined}
            rel={book.amazonUrl ? "noopener noreferrer" : undefined}
            className="mt-[18px] 2xl:mt-[24px] block w-[112.5px] h-[36px] 2xl:w-[150px] 2xl:h-[48px]"
            aria-label="Available on Amazon"
          >
            <Image
              src="/images/insights/amazon-badge.svg"
              alt="Available on Amazon"
              width={150}
              height={48}
              className="w-full h-full"
              unoptimized
            />
          </a>
        </div>
      </div>

      {review && (
        <div className="relative mt-[48px] 2xl:mt-[64px]">
          <svg
            className="absolute left-[18px] 2xl:left-[24px] -top-[12px] 2xl:-top-[16px] w-[36px] h-[27px] 2xl:w-[48px] 2xl:h-[36px] z-10"
            viewBox="0 0 48 36"
            fill="#F5A97A"
            aria-hidden
          >
            <path d="M0 22.5C0 10.9 6.7 3 18 0l2 4.7C14 6.7 11.2 10 10.8 14.2 15 14.5 19 17.6 19 23.5 19 29.7 14.6 34 9.2 34 3.6 34 0 29.6 0 22.5Zm27.5 0C27.5 10.9 34.2 3 45.5 0l2 4.7c-6 2-8.8 5.3-9.2 9.5 4.2.3 8.2 3.4 8.2 9.3 0 6.2-4.4 10.5-9.8 10.5-5.6 0-9.2-4.4-9.2-11.5Z" />
          </svg>
          <div
            className="rounded-[9px] 2xl:rounded-[12px] px-[18px] 2xl:px-[24px] pt-[39px] 2xl:pt-[52px] pb-[18px] 2xl:pb-[24px] flex flex-col min-h-[223.5px]"
            style={{ background: "rgba(255,255,255,0.62)" }}
          >
            <p className="text-[18px] 2xl:text-[24px] leading-[27px] 2xl:leading-[36px] font-medium text-[#5E5955] m-0">
              {review.reviewerName}
            </p>
            <p className="mt-[6px] 2xl:mt-[8px] text-[12px] 2xl:text-[16px] leading-[18px] 2xl:leading-[24px] font-medium text-[#6B6561] m-0">
              {review.reviewerDesignation}
            </p>
            <p className="mt-[18px] 2xl:mt-[24px] text-[12px] 2xl:text-[16px] leading-[21px] 2xl:leading-[28px] font-normal text-[#5E5955] m-0 flex-1">
              {review.reviewText}
            </p>
            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-[6px] mt-[12px]">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`h-[6px] 2xl:h-[8px] rounded-full transition-all ${
                      i === active ? "w-[18px] 2xl:w-[24px] bg-[#EE6723]" : "w-[6px] 2xl:w-[8px] bg-[#B5B1AE]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
