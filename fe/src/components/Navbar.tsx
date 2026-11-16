"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavigationData, getStrapiMediaUrl } from "@/lib/strapi";

export interface NavItem {
  id?: number;
  label: string;
  url: string;
}

export interface NavbarProps {
  data?: NavigationData | null;
}

export default function Navbar({ data }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [floating, setFloating] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuOpenRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    menuOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  // Close mobile dropdown when the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Scrolls away with the page going down; slides back in as soon as the user scrolls up at all.
  useEffect(() => {
    let lastY = window.scrollY;
    let offset = 0;
    let ticking = false;

    const apply = (animate: boolean) => {
      const el = headerRef.current;
      if (!el) return;
      el.style.transition = animate ? "transform 250ms ease, background-color 250ms ease" : "none";
      el.style.transform = `translateY(${-offset}px)`;
    };

    const update = () => {
      ticking = false;
      const el = headerRef.current;
      if (!el) return;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      const height = el.offsetHeight;

      if (dy > 0 && !menuOpenRef.current) {
        offset = Math.min(height, offset + dy);
        apply(false);
      } else if (dy < 0 && offset > 0) {
        offset = 0;
        apply(true);
      }
      setFloating(y > height && offset === 0);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu, CTA and logo all come from Strapi (Navigation single type)
  const menuItems = data?.menuItems ?? [];

  const ctaText = data?.ctaText ?? "";
  const ctaUrl = data?.ctaUrl ?? "#";

  const logoUrl = data?.logo?.url ? getStrapiMediaUrl(data.logo.url) : null;
  const logoAlt = data?.logo?.alternativeText || data?.logo?.name || "";

  return (
    // Fixed (out of flow) so page backgrounds start at the very top
    <header
      ref={headerRef}
      className={`w-full fixed top-0 inset-x-0 z-50 will-change-transform ${
        floating || mobileMenuOpen
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(30,26,26,0.06)]"
          : "bg-transparent"
      }`}
      style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}
    >
      <div className="navbar-container w-full max-w-[1057.5px] 2xl:max-w-[1410px] mx-auto px-6 sm:px-10 lg:px-0 flex items-center justify-between">
        {/* Arkam Logo: Aligned with the left edge of the 1410px grid (starts where cards start) */}
        <Link
          href="/"
          className="navbar-logo flex items-center shrink-0 w-[139.5px] 2xl:w-[186px]"
          onClick={() => setMobileMenuOpen(false)}
        >
          {logoUrl ? (
            // Figma logo: 186x56 at 1920, 139.5x42 at 1440
            <div className="relative h-[32px] lg:h-[42px] 2xl:h-[56px] w-auto flex items-center">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={data?.logo?.width || 186}
                height={data?.logo?.height || 56}
                className="h-[32px] lg:h-[42px] 2xl:h-[56px] w-auto object-contain object-left"
                unoptimized
                priority
              />
            </div>
          ) : (
            <span className="font-semibold text-base 2xl:text-lg text-[#171717]">
              Arkam Ventures
            </span>
          )}
        </Link>

        {/* Middle Navigation Links: Centered between Logo and CTA; 32px gap at 1920px, 24px at 1440px */}
        {menuItems.length > 0 && (
          <nav className="navbar-menu hidden lg:flex flex-1 items-center justify-center shrink-0">
            {menuItems.map((item) => {
              const isActive =
                mounted &&
                (pathname === item.url ||
                  (item.url !== "/" && pathname?.startsWith(item.url)));

              return (
                <Link
                  key={item.id || item.label}
                  href={item.url}
                  className={`h-[33px] 2xl:h-[44px] pt-[7px] 2xl:pt-[10px] px-[6px] 2xl:px-[8px] flex flex-col items-center justify-start transition-all duration-200 whitespace-nowrap group ${
                    isActive
                      ? "text-[#171717] font-semibold"
                      : "text-[#4a453f] hover:text-[#EE6723] font-medium"
                  }`}
                >
                  <span className="text-[13.5px] 2xl:text-[16px] leading-[19px] 2xl:leading-[24px]">
                    {item.label}
                  </span>
                  <span
                    className={`w-full h-[1.5px] 2xl:h-[2px] rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-[#171717]"
                        : "bg-transparent group-hover:bg-[#EE6723]/40"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right CTA Button (Pitch to us): Aligned with the right edge of the 1410px grid (ends where cards end) */}
        {ctaText && (
          <div className="navbar-cta hidden lg:flex items-center justify-end shrink-0">
            {/* Same Figma button as the footer CTA: 190x56, radius 8, #EEAB41 -> #DF6E38, Rubik 500 18px */}
            <Link href={ctaUrl} className="footer-pitch-btn whitespace-nowrap">
              <span className="footer-pitch-btn-text">{ctaText}</span>
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        {(menuItems.length > 0 || ctaText) && (
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#3e3935] hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (menuItems.length > 0 || ctaText) && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-6 pt-3 pb-6 space-y-3 shadow-lg">
          {menuItems.length > 0 && (
            <nav className="flex flex-col space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  mounted &&
                  (pathname === item.url ||
                    (item.url !== "/" && pathname?.startsWith(item.url)));

                return (
                  <Link
                    key={item.id || item.label}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#EE6723]/10 text-[#EE6723] font-semibold"
                        : "text-[#4a453f] hover:text-[#EE6723] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaUrl}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: "linear-gradient(135deg, #EEAB41 0%, #DF6E38 100%)",
                }}
                className="w-full flex items-center justify-center px-5 py-3 rounded-[8px] font-medium text-white shadow-sm hover:opacity-95"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
