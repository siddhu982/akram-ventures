const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export interface StrapiMenuItem {
  id: number;
  label: string;
  url: string;
  displayOrder?: number;
}

export interface StrapiLogo {
  id: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  url: string;
}

export interface NavigationData {
  ctaText?: string;
  ctaUrl?: string;
  logo?: StrapiLogo | null;
  menuItems?: StrapiMenuItem[];
}

export interface StrapiMedia {
  id: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  url: string;
  formats?: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    thumbnail?: { url: string; width: number; height: number };
  };
}

export interface SectionAppearance {
  id?: number;
  headingArtwork?: StrapiMedia | null;
  backgroundImage?: StrapiMedia | null;
  gradientImage?: StrapiMedia | null;
  backgroundMode?: "plain" | "gradient" | "plain-with-gradient";
}

export interface FounderSlideItem {
  id: number;
  innerBannerHeadind?: string;
  backgroundImage?: StrapiMedia | null;
  partnerLogo?: StrapiMedia | null;
}

export interface HomepageSliderComponent {
  __component: "shared.homepage-slider";
  id: number;
  homepageBanner?: string;
  sectionAppearance?: SectionAppearance | null;
  imgSlider1?: FounderSlideItem[];
}

export interface PartnerLogoItem {
  id: number;
  partnerLogoName?: string;
  partnerLogoImage?: StrapiMedia | null;
}

export interface PartnersComponent {
  __component: "shared.partners";
  id: number;
  partnerLogo?: PartnerLogoItem[];
}

export interface FeaturedStoriesComponent {
  __component: "homepage.featured-stories";
  id: number;
  heading?: string;
  stories?: StoryData[];
  story?: StoryData | null;
}

export interface BlogSectionComponent {
  __component: "homepage.blog-section";
  id: number;
  blogSlider?: string;
  blog?: BlogCardItem[];
}

export interface ThesisSliderImgItem {
  id: number;
  imgTxt?: string;
  img1?: StrapiMedia | null;
}

export interface ThesisBottomSliderHeadingComponent {
  __component: "thesis.bottom-slider-heading";
  id: number;
  title?: string;
  sliderImg1?: ThesisSliderImgItem[];
}

export interface PortfolioCardItem {
  id: number;
  description?: string;
  partnerLogo?: StrapiMedia | null;
}

export interface BottomPortfolioSliderComponent {
  __component: "homepage.bottom-portfolio-slider";
  id: number;
  title?: string;
  whatWeAre?: string;
  sliderCard?: PortfolioCardItem[];
}

export type DynamicZoneComponent =
  | HomepageSliderComponent
  | PartnersComponent
  | FeaturedStoriesComponent
  | BlogSectionComponent
  | ThesisBottomSliderHeadingComponent
  | BottomPortfolioSliderComponent
  | { __component: string; id: number; [key: string]: unknown };

export interface HomepageData {
  id: number;
  documentId?: string;
  Heading?: string;
  slug?: string;
  stories?: StoryData[];
  addYourLayout?: DynamicZoneComponent[];
}

export function getStrapiMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${STRAPI_BASE_URL}${path}`;
}

export async function getNavigation(): Promise<NavigationData | null> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/navigation`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch navigation: HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("[Strapi] Error connecting to navigation API:", error);
    return null;
  }
}

export async function getHomepage(): Promise<HomepageData | null> {
  try {
    const params = [
      "populate[backgroundGrading]=true",
      // shared.homepage-slider → imgSlider1 → backgroundImage, partnerLogo
      "populate[addYourLayout][on][shared.homepage-slider][populate][imgSlider1][populate]=*",
      // shared.partners → partnerLogo → partnerLogoImage
      "populate[addYourLayout][on][shared.partners][populate][partnerLogo][populate]=*",
      // homepage.blog-section → blog → blogImg
      "populate[addYourLayout][on][homepage.blog-section][populate][blog][populate]=*",
      // homepage.featured-stories → stories → brandLogo, blogImg
      "populate[addYourLayout][on][homepage.featured-stories][populate][stories][populate][brandLogo]=true",
      "populate[addYourLayout][on][homepage.featured-stories][populate][stories][populate][blogImg]=true",
      // thesis.bottom-slider-heading → sliderImg1 → img1
      "populate[addYourLayout][on][thesis.bottom-slider-heading][populate][sliderImg1][populate]=*",
      // homepage.bottom-portfolio-slider → sliderCard → partnerLogo
      "populate[addYourLayout][on][homepage.bottom-portfolio-slider][populate][sliderCard][populate]=*",
    ].join("&");
    const res = await fetch(`${STRAPI_BASE_URL}/api/homepage?${params}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch homepage: HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("[Strapi] Error connecting to homepage API:", error);
    return null;
  }
}

export interface BlogCardItem {
  id: number;
  cardImg?: StrapiMedia | null;
  aboutCard?: string;
  by?: string;
  description?: string;
  readMore?: string | null;
}

export interface BlogCardsComponent {
  __component: "story.blog-cards";
  id: number;
  card?: BlogCardItem[];
}

export type StoryDynamicZoneComponent =
  | BlogCardsComponent
  | { __component: string; id: number; [key: string]: unknown };

export interface StoryData {
  id: number;
  documentId?: string;
  heading?: string;
  stories?: string;
  aboutBlog?: string;
  shortDes?: string;
  slug?: string;
  brandLogo?: StrapiMedia | null;
  description?: string;
  blogImg?: StrapiMedia | null;
  by?: string | null;
  readMore?: string | null;
  blogs?: StoryDynamicZoneComponent[];
}

export interface PortfolioCard {
  id: number;
  partnerImg?: StrapiMedia | null;
  logo?: StrapiMedia | null;
  aboutPartner?: string;
  founder?: string;
  url?: string;
}

export interface PortfolioHeroLogo {
  id: number;
  name?: string;
  logo?: StrapiMedia | null;
}

export interface PortfolioPageData {
  id: number;
  documentId?: string;
  Heading?: string;
  heroHeading?: string;
  slug?: string;
  heroLogos?: PortfolioHeroLogo[];
  containerForRemainingComponents?: Array<{
    __component: string;
    id: number;
    actualCard?: PortfolioCard[];
  }>;
}

export async function getPortfolioPage(): Promise<PortfolioPageData | null> {
  try {
    const params = [
      "populate[containerForRemainingComponents][on][portfolio.partner-cards][populate][actualCard][populate]=*",
      "populate[heroLogos][populate]=*",
    ].join("&");
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/portfolios?${params}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch portfolios: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.[0] ?? null;
  } catch (error) {
    console.error("[Strapi] Error fetching portfolios:", error);
    return null;
  }
}

export interface ThesisThemeCard {
  id: number;
  icon?: StrapiMedia | null;
  title?: string;
  description?: string;
}

export interface ThesisShowcaseSection {
  id: number;
  tag?: string;
  tagIcon?: StrapiMedia | null;
  heading?: string;
  description?: string;
  featureImage?: StrapiMedia | null;
  logos?: ThesisSliderImgItem[];
  layoutDirection?: "image-right" | "image-left";
}

export interface ThesisPageData {
  id: number;
  documentId?: string;
  heading?: string;
  slug?: string;
  heroHeading?: string;
  heroSubheading?: string;
  statsImage?: StrapiMedia | null;
  indiaQuote?: string;
  portraitsImage?: StrapiMedia | null;
  themesIntroText?: string;
  themeCards?: ThesisThemeCard[];
  showcases?: ThesisShowcaseSection[];
  bottomSlider?: Array<{
    __component: string;
    id: number;
    title?: string;
    sliderImg1?: ThesisSliderImgItem[];
  }>;
}

export async function getThesisPage(): Promise<ThesisPageData | null> {
  try {
    const params = [
      "populate[bottomSlider][on][thesis.bottom-slider-heading][populate][sliderImg1][populate]=*",
      "populate[statsImage]=true",
      "populate[portraitsImage]=true",
      "populate[themeCards][populate]=*",
      "populate[showcases][populate][tagIcon]=true",
      "populate[showcases][populate][featureImage]=true",
      "populate[showcases][populate][logos][populate]=*",
    ].join("&");
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/theses?${params}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch theses: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.[0] ?? null;
  } catch (error) {
    console.error("[Strapi] Error fetching theses:", error);
    return null;
  }
}

export async function getStories(): Promise<StoryData[]> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/stories?populate[brandLogo]=true&populate[blogImg]=true&sort=createdAt:asc`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch stories: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    return json?.data ?? [];
  } catch (error) {
    console.error("[Strapi] Error connecting to stories API:", error);
    return [];
  }
}

export interface TeamSocialMedia {
  id: number;
  Text?: string;
  ProfileUri?: string;
  SocialMediaImages?: StrapiMedia | null;
}

export interface TeamMember {
  id: number;
  documentId?: string;
  Name: string;
  slug?: string;
  designation?: string;
  memberType?: "Board" | "Advisor";
  profilePicture?: StrapiMedia | null;
  SocialMediaRepeater?: TeamSocialMedia[];
}

export async function getTeamMembers(
  memberType?: "Board" | "Advisor"
): Promise<TeamMember[]> {
  try {
    const filter = memberType
      ? `&filters[memberType][$eq]=${memberType}`
      : "";
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/teams?populate[profilePicture]=true&populate[SocialMediaRepeater][populate]=*${filter}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch teams: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return json?.data ?? [];
  } catch (error) {
    console.error("[Strapi] Error fetching teams:", error);
    return [];
  }
}

// ── Footer ──────────────────────────────────────────────────────────

export interface FooterSocialLink {
  id: number;
  platform?: "facebook" | "linkedin" | "twitter" | "instagram" | "youtube";
  url?: string;
}

export interface FooterData {
  id: number;
  ctaHeading?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  socialLinks?: FooterSocialLink[];
}

export async function getFooter(): Promise<FooterData | null> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/footer?populate=*`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── About Section ───────────────────────────────────────────────────

export interface AboutSectionData {
  id: number;
  heading?: string;
  description1?: string;
  description2?: string;
  logo?: StrapiMedia | null;
  backgroundImage?: StrapiMedia | null;
}

export async function getAboutSection(): Promise<AboutSectionData | null> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/about-section?populate=*`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Pitch Page ──────────────────────────────────────────────────────

export interface PitchPageData {
  id: number;
  subtitle?: string;
  title?: string;
  section1Eyebrow?: string;
  section1Title?: string;
  section2Eyebrow?: string;
  section2Title?: string;
  nameLabel?: string;
  emailLabel?: string;
  problemLabel?: string;
  teamLabel?: string;
  roundSizeLabel?: string;
  additionalInfoLabel?: string;
  pitchDeckLabel?: string;
  uploadPrompt?: string;
  uploadHint?: string;
  browseText?: string;
  changeFileText?: string;
  websiteLabel?: string;
  linkedinLabel?: string;
  linkedinHint?: string;
  addMoreText?: string;
  sectorLabel?: string;
  sectorPlaceholder?: string;
  sectorNoneLabel?: string;
  marketLabel?: string;
  customerLabel?: string;
  solutionLabel?: string;
  submitText?: string;
  submittingText?: string;
  successTitle?: string;
  successMessage?: string;
  backToFormText?: string;
  sectorOptions?: { id: number; label: string }[];
}

export async function getPitchPage(): Promise<PitchPageData | null> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/pitch-page?populate[sectorOptions]=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Team Page ───────────────────────────────────────────────────────

export interface TeamPageData {
  id: number;
  heading?: string;
}

export async function getTeamPage(): Promise<TeamPageData | null> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/team-page`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Stories Page ────────────────────────────────────────────────────

export interface StoriesPageData {
  id: number;
  heading?: string;
}

export async function getStoriesPage(): Promise<StoriesPageData | null> {
  try {
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/stories-page`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ---------- Insights ----------
export interface InsightBookReview {
  id?: number;
  reviewerName?: string;
  reviewerDesignation?: string;
  reviewText?: string;
}

export interface InsightBookCard {
  __component: "insights.book-card";
  id?: number;
  bookCover?: StrapiMedia | null;
  bookTitle?: string;
  bookSubtitle?: string;
  author?: string;
  amazonUrl?: string | null;
  reviews?: InsightBookReview[];
}

export interface InsightSeriesCard {
  __component: "insights.series-card";
  id?: number;
  seriesTitle?: string;
  description?: string;
  readMoreUrl?: string | null;
}

export interface InsightVideoCard {
  __component: "insights.video-card";
  id?: number;
  thumbnail?: StrapiMedia | null;
  videoUrl?: string | null;
  title?: string;
  seriesName?: string;
  publishedOn?: string | null;
  description?: string;
  readMoreUrl?: string | null;
}

export type InsightComponent = InsightBookCard | InsightSeriesCard | InsightVideoCard;

export interface InsightEntry {
  id: number;
  documentId?: string;
  title?: string;
  layout?: InsightComponent[];
}

/** Every published Insight entry, oldest first. Each entry's layout holds one card component. */
export async function getInsights(): Promise<InsightEntry[]> {
  try {
    const comps = ["book-card", "series-card", "video-card"]
      .map((c) => `populate[layout][on][insights.${c}][populate]=*`)
      .join("&");
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/insights?${comps}&sort=createdAt:asc&pagination[pageSize]=100`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[Strapi] Failed to fetch insights: HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return json?.data ?? [];
  } catch (error) {
    console.error("[Strapi] Error fetching insights:", error);
    return [];
  }
}


// ── Site labels (small UI texts shared across pages) ─────────────────
export interface SiteLabels {
  viewAllStoriesLabel?: string;
  loadMoreLabel?: string;
  foundersLabel?: string;
  videoBylineSuffix?: string;
  viewMoreLabel?: string;
}

export async function getSiteLabels(): Promise<SiteLabels | null> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/site-label`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
