"use client";

import React from "react";
import Link from "next/link";
import { FooterData, FooterSocialLink } from "@/lib/strapi";

interface FooterProps {
  data?: FooterData | null;
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#1E1A1A" strokeOpacity="0.1" className="group-hover/social:stroke-[#EE6723] transition-colors" />
      <path d="M20.0422 32V22.6154H18V19.2365H20.0422V16.3505C20.0422 14.0826 21.2486 12 24.0282 12C25.1537 12 25.9859 12.1311 25.9859 12.1311L25.9203 15.2864C25.9203 15.2864 25.0716 15.2764 24.1454 15.2764C23.143 15.2764 22.9824 15.8377 22.9824 16.7693V19.2365H26L25.8687 22.6154H22.9824V32H20.0422Z" fill="currentColor" className="opacity-50 group-hover/social:opacity-100 transition-opacity" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#1E1A1A" strokeOpacity="0.1" className="group-hover/social:stroke-[#EE6723] transition-colors" />
      <path d="M19.6468 19.2252H23.0513V20.921C23.5417 19.9457 24.7994 19.0693 26.6887 19.0693C30.3104 19.0693 31.1702 21.0108 31.1702 24.573V31.1702H27.5036V25.3842C27.5036 23.3557 27.0132 22.2117 25.7647 22.2117C24.0331 22.2117 23.3135 23.4446 23.3135 25.3833V31.1702H19.6468V19.2252V19.2252ZM13.3594 31.0144H17.0261V19.0693H13.3594V31.0144V31.0144ZM17.5513 15.1744C17.5515 15.4817 17.4905 15.786 17.372 16.0696C17.2535 16.3532 17.0798 16.6104 16.8611 16.8262C16.4178 17.2668 15.8177 17.5134 15.1927 17.5119C14.5689 17.5115 13.9702 17.2655 13.5262 16.8272C13.3083 16.6106 13.1352 16.3531 13.0169 16.0695C12.8986 15.7859 12.8374 15.4817 12.8369 15.1744C12.8369 14.5538 13.0844 13.9598 13.5272 13.5217C13.9707 13.0827 14.5696 12.8366 15.1937 12.8369C15.8188 12.8369 16.4183 13.0835 16.8611 13.5217C17.3029 13.9598 17.5513 14.5538 17.5513 15.1744Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor" className="opacity-50 group-hover/social:opacity-100 transition-opacity" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#1E1A1A" strokeOpacity="0.1" className="group-hover/social:stroke-[#EE6723] transition-colors" />
      <path d="M32.886 16.3871C32.9 16.6179 32.9 16.8585 32.9 17.0942C32.9 24.3031 27.41 32.6071 17.378 32.6071C14.284 32.6071 11.416 31.7085 9 30.1616C9.442 30.2107 9.864 30.2304 10.316 30.2304C12.87 30.2304 15.217 29.3661 17.088 27.9027C14.692 27.8536 12.678 26.2821 11.991 24.1214C12.83 24.2442 13.587 24.2442 14.451 24.0232C13.217 23.7725 12.108 23.1024 11.312 22.1266C10.516 21.1509 10.083 19.9297 10.085 18.6705V18.6018C10.807 19.0094 11.657 19.2598 12.546 19.2942C11.798 18.7962 11.186 18.1216 10.762 17.3301C10.338 16.5385 10.115 15.6546 10.115 14.7567C10.115 13.7402 10.38 12.8121 10.856 12.0067C12.226 13.6927 13.935 15.0717 15.872 16.0539C17.81 17.0362 19.932 17.5998 22.102 17.708C21.331 14.0004 24.1 11 27.43 11C29.001 11 30.416 11.658 31.412 12.7188C32.645 12.4879 33.824 12.0263 34.875 11.4076C34.467 12.6696 33.612 13.7353 32.478 14.408C33.578 14.2902 34.639 13.9857 35.621 13.5585C34.879 14.6487 33.951 15.6161 32.886 16.3871Z" fill="currentColor" className="opacity-50 group-hover/social:opacity-100 transition-opacity" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#1E1A1A" strokeOpacity="0.1" className="group-hover/social:stroke-[#EE6723] transition-colors" />
      <path d="M22 14.622C24.403 14.622 24.688 14.631 25.637 14.675C26.514 14.716 26.991 14.862 27.308 14.984C27.728 15.146 28.028 15.342 28.343 15.657C28.658 15.972 28.854 16.272 29.016 16.692C29.138 17.009 29.284 17.486 29.325 18.363C29.369 19.312 29.378 19.597 29.378 22C29.378 24.403 29.369 24.688 29.325 25.637C29.284 26.514 29.138 26.991 29.016 27.308C28.854 27.728 28.658 28.028 28.343 28.343C28.028 28.658 27.728 28.854 27.308 29.016C26.991 29.138 26.514 29.284 25.637 29.325C24.688 29.369 24.403 29.378 22 29.378C19.597 29.378 19.312 29.369 18.363 29.325C17.486 29.284 17.009 29.138 16.692 29.016C16.272 28.854 15.972 28.658 15.657 28.343C15.342 28.028 15.146 27.728 14.984 27.308C14.862 26.991 14.716 26.514 14.675 25.637C14.631 24.688 14.622 24.403 14.622 22C14.622 19.597 14.631 19.312 14.675 18.363C14.716 17.486 14.862 17.009 14.984 16.692C15.146 16.272 15.342 15.972 15.657 15.657C15.972 15.342 16.272 15.146 16.692 14.984C17.009 14.862 17.486 14.716 18.363 14.675C19.312 14.631 19.597 14.622 22 14.622ZM22 13C19.556 13 19.249 13.01 18.289 13.055C17.331 13.099 16.677 13.25 16.105 13.472C15.513 13.702 15.011 14.01 14.511 14.511C14.01 15.011 13.702 15.513 13.472 16.105C13.25 16.677 13.099 17.331 13.055 18.289C13.01 19.249 13 19.556 13 22C13 24.444 13.01 24.751 13.055 25.711C13.099 26.669 13.25 27.323 13.472 27.895C13.702 28.487 14.01 28.989 14.511 29.489C15.011 29.99 15.513 30.298 16.105 30.528C16.677 30.75 17.331 30.901 18.289 30.945C19.249 30.99 19.556 31 22 31C24.444 31 24.751 30.99 25.711 30.945C26.669 30.901 27.323 30.75 27.895 30.528C28.487 30.298 28.989 29.99 29.489 29.489C29.99 28.989 30.298 28.487 30.528 27.895C30.75 27.323 30.901 26.669 30.945 25.711C30.99 24.751 31 24.444 31 22C31 19.556 30.99 19.249 30.945 18.289C30.901 17.331 30.75 16.677 30.528 16.105C30.298 15.513 29.99 15.011 29.489 14.511C28.989 14.01 28.487 13.702 27.895 13.472C27.323 13.25 26.669 13.099 25.711 13.055C24.751 13.01 24.444 13 22 13ZM22 17.378C19.447 17.378 17.378 19.447 17.378 22C17.378 24.553 19.447 26.622 22 26.622C24.553 26.622 26.622 24.553 26.622 22C26.622 19.447 24.553 17.378 22 17.378ZM22 25C20.343 25 19 23.657 19 22C19 20.343 20.343 19 22 19C23.657 19 25 20.343 25 22C25 23.657 23.657 25 22 25ZM27.846 17.195C27.846 17.791 27.363 18.274 26.767 18.274C26.171 18.274 25.688 17.791 25.688 17.195C25.688 16.599 26.171 16.116 26.767 16.116C27.363 16.116 27.846 16.599 27.846 17.195Z" fill="currentColor" className="opacity-50 group-hover/social:opacity-100 transition-opacity" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#1E1A1A" strokeOpacity="0.1" className="group-hover/social:stroke-[#EE6723] transition-colors" />
      <path d="M33.582 16.186C33.352 15.326 32.682 14.647 31.834 14.414C30.296 14 22 14 22 14C22 14 13.704 14 12.166 14.414C11.318 14.647 10.648 15.326 10.418 16.186C10.01 17.746 10.01 22 10.01 22C10.01 22 10.01 26.254 10.418 27.814C10.648 28.674 11.318 29.324 12.166 29.557C13.704 29.971 22 29.971 22 29.971C22 29.971 30.296 29.971 31.834 29.557C32.682 29.324 33.352 28.674 33.582 27.814C33.99 26.254 33.99 22 33.99 22C33.99 22 33.99 17.746 33.582 16.186ZM19.608 25.697V18.303L26.185 22L19.608 25.697Z" fill="currentColor" className="opacity-50 group-hover/social:opacity-100 transition-opacity" />
    </svg>
  ),
};

function renderCtaHeading(heading: string) {
  const limitlessMatch = heading.match(/^(.+?)(Limitless)(.+)$/i);
  if (!limitlessMatch) {
    return <span className="font-light">{heading}</span>;
  }

  const [, prefix, limitless, suffix] = limitlessMatch;
  return (
    <>
      <span className="font-light">{prefix}</span>
      <span className="footer-limitless-wrap">
        <span className="font-medium">{limitless}</span>
        <span className="footer-limitless-underline" aria-hidden="true" />
      </span>{" "}
      <span className="font-light relative inline-flex items-baseline">
        {suffix.trim()}
        <span className="footer-burst-wrap" aria-hidden="true">
          <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M37.0051 26.526C36.8076 26.2296 36.6647 25.8939 36.5837 25.5355C36.5208 25.1981 36.2785 25.036 35.9478 25.0029C33.7288 24.7814 31.5424 25.0978 29.3371 25.6332C26.6501 26.2856 24.009 27.1143 21.3761 28.0038C18.9655 28.8227 16.5475 29.6105 14.1223 30.3672C13.5118 30.5591 12.8808 30.6506 12.3169 31.0131C12.0398 31.1902 11.8758 31.339 12.1497 31.7037C12.5208 32.1706 12.8464 32.6776 13.1221 33.2175C13.2654 33.5185 13.5317 33.6439 13.8526 33.6311C14.0443 33.6245 14.2373 33.5657 14.4239 33.647L15.4695 33.4692C16.8808 32.9885 18.298 32.5362 19.717 32.0904C21.9173 31.3965 24.0756 30.5335 26.2951 29.9041C27.9839 29.4249 29.6803 28.9895 31.3677 28.5173C32.646 28.1542 33.9703 27.9459 35.1667 27.2905C35.7722 26.9616 36.4447 27.0122 37.016 26.6371L37.0051 26.526Z" fill="#EE6723" />
            <path d="M0.050479 15.8819C0.101261 16.0149 0.144434 16.1537 0.20583 16.2803C0.318791 16.515 0.434561 16.6131 0.720034 16.4412C1.25905 16.1319 1.81122 15.8543 2.37381 15.6096C2.6512 15.4828 2.8389 15.2985 2.90799 14.9738C3.53659 12.0255 4.64285 9.25006 5.74068 6.47154C6.02267 5.75901 6.25956 5.03178 6.53553 4.30905C6.97029 3.18535 6.71489 2.11348 6.5289 1.03299L6.42874 1.05031C6.13698 1.25376 5.83818 1.41343 5.48738 1.42683C5.24707 1.43576 5.01362 1.50875 4.94532 1.84221C4.9079 2.02317 4.76692 2.1173 4.65309 2.23025C4.16121 2.71277 3.76683 3.30613 3.49893 3.96672C3.14725 4.85217 2.77432 5.7278 2.44598 6.62385C1.40729 9.45964 0.12402 12.2241 0 15.3281L0.050479 15.8819Z" fill="#EE6723" />
            <path d="M26.0869 0.0192808C25.818 0.0301719 25.6773 0.199618 25.5357 0.383095C24.5433 1.66516 23.4699 2.86357 22.4872 4.1627C21.8013 5.0723 20.9216 5.80259 20.129 6.61024C18.2695 8.50794 16.5351 10.5443 14.8208 12.5986C13.1985 14.5467 11.6286 16.5407 10.1481 18.6219C9.41591 19.6523 8.84081 20.7854 8.22541 21.8931C7.80297 22.6528 8.06897 23.0576 8.94211 23.1114C9.52444 23.1497 10.1158 23.1043 10.69 23.2589C11.1638 23.3876 11.4641 23.0213 11.7293 22.6336C13.2875 20.3211 15 18.1536 16.7146 15.9843C18.4779 13.7545 20.3258 11.609 22.0041 9.28984C22.9678 7.9587 23.6878 6.49008 24.5238 5.0873C25.2934 3.83137 26.1297 2.6256 27.0274 1.47721C27.1022 1.37908 27.1907 1.29372 27.2642 1.19567C27.7953 0.485827 27.7602 0.371004 26.9575 0.2338C26.6531 0.184223 26.3924 -0.0713506 26.0869 0.0192808Z" fill="#EE6723" />
          </svg>
        </span>
      </span>
    </>
  );
}

export default function Footer({ data }: FooterProps) {
  // Everything comes from Strapi (Footer single type); nothing is hardcoded here
  const ctaHeading = data?.ctaHeading ?? "";
  const ctaButtonText = data?.ctaButtonText ?? "";
  const ctaButtonUrl = data?.ctaButtonUrl ?? "#";
  const email = data?.email ?? "";
  const addressLine1 = data?.addressLine1 ?? "";
  const addressLine2 = data?.addressLine2 ?? "";
  const socialLinks = data?.socialLinks ?? [];

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-heading-wrap">
            <h2 className="footer-heading">
              {renderCtaHeading(ctaHeading)}
            </h2>
          </div>

          <Link
            href={ctaButtonUrl}
            className="footer-pitch-btn group"
            aria-label={ctaButtonText}
          >
            <span className="footer-pitch-btn-text">{ctaButtonText}</span>
          </Link>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom-row">
          <div className="footer-contact-info">
            <a href={`mailto:${email}`} className="footer-email-link">
              <div className="footer-mail-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M4 5C3.45228 5 3 5.45228 3 6V18C3 18.5477 3.45228 19 4 19H20C20.5477 19 21 18.5477 21 18V6C21 5.45228 20.5477 5 20 5H4ZM1 6C1 4.34772 2.34772 3 4 3H20C21.6523 3 23 4.34772 23 6V18C23 19.6523 21.6523 21 20 21H4C2.34772 21 1 19.6523 1 18V6Z" fillRule="evenodd" clipRule="evenodd" fill="#1E1A1A" />
                  <path d="M1.18085 5.42662C1.49757 4.97417 2.1211 4.86414 2.57355 5.18085L12.0001 11.7794L21.4266 5.18085C21.8791 4.86414 22.5026 4.97417 22.8193 5.42662C23.136 5.87907 23.026 6.5026 22.5735 6.81932L12.5735 13.8193C12.2292 14.0603 11.7709 14.0603 11.4266 13.8193L1.42662 6.81932C0.974174 6.5026 0.864139 5.87907 1.18085 5.42662Z" fillRule="evenodd" clipRule="evenodd" fill="#1E1A1A" />
                </svg>
              </div>
              <span>{email}</span>
            </a>

            <p className="footer-address">
              {addressLine1}<br />
              {addressLine2}
            </p>
          </div>

          <div className="footer-social-wrap" aria-label="Social media links">
            {socialLinks.map((link) => {
              const icon = SOCIAL_ICONS[link.platform || ""];
              if (!icon || !link.url) return null;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon group/social"
                  aria-label={link.platform}
                >
                  {icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
