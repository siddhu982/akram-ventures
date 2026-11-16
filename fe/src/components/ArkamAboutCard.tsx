import React from "react";
import Image from "next/image";
import { AboutSectionData, getStrapiMediaUrl } from "@/lib/strapi";

interface ArkamAboutCardProps {
  data?: AboutSectionData | null;
}

const DEFAULT_LOGO_SVG = (
  <svg viewBox="0 0 162 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M47.9381 7.24792e-05H53.4439C54.7145 7.24792e-05 55.7508 1.02876 55.7508 2.28676V11.2488C55.7508 15.0483 54.2942 18.4847 51.9712 21.1599C49.1477 24.4116 45.0216 26.5168 40.3725 26.5168H31.6005C28.7064 26.5168 26.3578 28.8512 26.3578 31.7207V40.4312C26.3578 48.8422 19.4563 55.6927 10.9731 55.6927H2.30691C1.03634 55.6927 0 54.6641 0 53.4061V47.9409C0 46.6734 1.03634 45.6447 2.30691 45.6447H10.9731C13.8703 45.6447 16.2254 43.3039 16.2254 40.4312V31.7207C16.2254 23.3097 23.1268 16.4687 31.6005 16.4687H37.9918H40.3725C43.2698 16.4687 45.6248 14.1279 45.6248 11.2488V2.28676C45.6248 1.02876 46.6644 7.24792e-05 47.9381 7.24792e-05ZM153.404 45.6447H158.855C160.129 45.6447 161.169 46.6734 161.169 47.9409V48.2499V53.4061C161.169 54.6641 160.129 55.6927 158.855 55.6927H150.186C141.712 55.6927 134.811 48.8422 134.811 40.4312V39.4057V31.7207C134.811 28.8512 132.453 26.5168 129.559 26.5168H120.787C112.313 26.5168 105.412 19.6662 105.412 11.2552V2.28675C105.412 1.02876 106.448 7.24792e-05 107.722 7.24792e-05H113.227C114.498 7.24792e-05 115.534 1.02876 115.534 2.28675V11.2488C115.534 14.1279 117.889 16.4687 120.787 16.4687H129.559C138.032 16.4687 144.934 23.3192 144.934 31.7303V40.4312C144.934 41.4216 145.287 42.2943 145.774 43.0841C146.695 44.5841 148.287 45.6447 150.186 45.6447H153.404ZM158.832 104.306H150.163C141.689 104.306 134.787 111.154 134.787 119.568V128.269C134.787 131.148 132.429 133.489 129.538 133.489H120.763C113.111 133.489 105.388 139.441 105.388 152.734V157.712C105.388 158.97 106.428 159.999 107.701 159.999H113.207C114.481 159.999 115.517 158.97 115.517 157.712V152.734C115.517 146.893 117.43 143.537 120.763 143.537H129.538C138.012 143.537 144.913 136.686 144.913 128.269V119.568C144.913 116.695 147.269 114.354 150.163 114.354H158.832C160.109 114.354 161.145 113.326 161.145 112.068V106.593C161.145 105.335 160.109 104.306 158.832 104.306ZM47.9392 159.999H53.0728L53.445 160C54.7124 160 55.7487 158.968 55.7487 157.71V152.735C55.7487 139.442 48.0291 133.49 40.3736 133.49H31.608C28.714 133.49 26.3557 131.149 26.3557 128.27V119.569C26.3557 111.155 19.4542 104.307 10.9742 104.307H2.30484C1.03748 104.307 0.00113888 105.336 0.00113888 106.594V112.065C0.00113888 113.327 1.03748 114.355 2.30484 114.355H10.9742C13.8683 114.355 16.2265 116.696 16.2265 119.569V128.276C16.2265 136.687 23.128 143.538 31.6016 143.538H40.3736C43.7105 143.538 45.6259 146.891 45.6259 152.735L45.6259 157.502V157.712C45.6259 158.97 46.6654 159.999 47.9392 159.999Z" fillRule="evenodd" clipRule="evenodd" fill="#615454" />
    <path d="M32.4673 79.9978C32.4673 106.374 54.0091 127.757 80.5851 127.757C107.158 127.757 128.7 106.374 128.7 79.9978C128.7 53.6212 107.158 32.2384 80.5851 32.2384C54.0091 32.2384 32.4673 53.6212 32.4673 79.9978" fill="url(#arkam_about_sun_gradient)" />
    <defs>
      <linearGradient id="arkam_about_sun_gradient" x1="80.2157" y1="32.9128" x2="80.9342" y2="126.292" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAA819" />
        <stop offset="0.981094" stopColor="#EE6723" />
        <stop offset="1" stopColor="#EE6723" />
      </linearGradient>
    </defs>
  </svg>
);

export default function ArkamAboutCard({ data }: ArkamAboutCardProps) {
  if (!data) {
    return null;
  }

  const heading = data.heading ?? "";
  const desc1 = data.description1 || "";
  const desc2 = data.description2 || "";
  const logoUrl = data.logo?.url ? getStrapiMediaUrl(data.logo.url) : null;
  const bgUrl = data.backgroundImage?.url ? getStrapiMediaUrl(data.backgroundImage.url) : null;

  return (
    <section className="arkam-about-section" aria-label="About Arkam">
      <div className="arkam-about-card">
        <div className="arkam-about-glow-wrap" aria-hidden="true">
          <Image
            src={bgUrl || "/images/arkam-card-glow.png"}
            alt=""
            fill
            className="object-cover pointer-events-none select-none"
            priority={false}
            unoptimized
          />
        </div>

        <div className="arkam-about-inner">
          <div className="arkam-about-logo" aria-hidden="true">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={heading}
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              DEFAULT_LOGO_SVG
            )}
          </div>

          <div className="arkam-about-text-wrap">
            <h3 className="arkam-about-heading">
              <span className="arkam-title-word">{heading}</span>
              <span className="arkam-title-colon">:</span>
            </h3>

            <div className="arkam-about-description">
              <p>{desc1}</p>
              <p>{desc2}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
