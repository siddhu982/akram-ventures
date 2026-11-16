import React from 'react';
import Footer from '@/components/Footer';
import PitchForm from '@/components/PitchForm';
import { getPitchPage, getFooter } from '@/lib/strapi';
import { splitEmphasis } from '@/lib/emphasis';

export const metadata = {
  title: 'Pitch to Us — Arkam Ventures',
  description:
    'We are looking for limitless founders of tomorrow. Submit your pitch to Arkam Ventures.',
};

export default async function PitchToUsPage() {
  const [pitchPageData, footerData] = await Promise.all([
    getPitchPage(),
    getFooter(),
  ]);

  const subtitle = pitchPageData?.subtitle ?? '';
  const title = pitchPageData?.title ?? '';
  const titleParts = splitEmphasis(title, 'founders of tomorrow');

  return (
    <div
      className="relative min-h-screen bg-white flex flex-col w-full overflow-x-hidden pt-[180px] 2xl:pt-[240px]"
      style={{ fontFamily: 'var(--font-rubik), Rubik, sans-serif' }}
    >
      <main className="relative z-10 flex-1 w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0">

        {/* Figma: subtitle top 240, title top 323 (930w, Rubik 300/500 64px, lh 100%), banner top 571.
            Passed to the form so it can hide the heading once the pitch is submitted. */}
        <PitchForm
          content={pitchPageData}
          header={
            <div className="flex flex-col items-center text-center mb-[90px] 2xl:mb-[120px]">
              <span
                className="text-[21px] 2xl:text-[28px] font-[500] leading-none mb-[37.5px] 2xl:mb-[50px] text-[#1E1A1A] opacity-70"
              >
                {subtitle}
              </span>
              <h1 className="text-[48px] 2xl:text-[64px] font-[300] leading-none text-[#1E1A1A] max-w-[697.5px] 2xl:max-w-[930px]">
                {titleParts ? (
                  <>
                    {titleParts.before}
                    <span className="font-[500]">{titleParts.match}</span>
                    {titleParts.after}
                  </>
                ) : (
                  title
                )}
              </h1>
            </div>
          }
        />

      </main>
      <Footer data={footerData} />
    </div>
  );
}
