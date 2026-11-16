import type { Schema, Struct } from '@strapi/strapi';

export interface FooterSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_footer_social_links';
  info: {
    description: 'A social media link with platform and URL';
    displayName: 'Social Link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      ['facebook', 'linkedin', 'twitter', 'instagram', 'youtube']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomepageBlogCard extends Struct.ComponentSchema {
  collectionName: 'components_homepage_blog_cards';
  info: {
    displayName: 'blogCard';
    icon: 'folder';
  };
  attributes: {
    blogImg: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    description: Schema.Attribute.Text;
    mainHeading: Schema.Attribute.String;
    readMore: Schema.Attribute.String;
    subHeading: Schema.Attribute.String;
  };
}

export interface HomepageBlogSection extends Struct.ComponentSchema {
  collectionName: 'components_homepage_blog_sections';
  info: {
    displayName: 'blogSection';
    icon: 'server';
  };
  attributes: {
    blog: Schema.Attribute.Component<'homepage.blog-card', true>;
    blogSlider: Schema.Attribute.String;
  };
}

export interface HomepageBottomPortfolioSlider extends Struct.ComponentSchema {
  collectionName: 'components_homepage_bottom_portfolio_sliders';
  info: {
    displayName: 'bottomPortfolioSlider';
    icon: 'house';
  };
  attributes: {
    sliderCard: Schema.Attribute.Component<'homepage.cards-slider', true>;
    title: Schema.Attribute.String;
    whatWeAre: Schema.Attribute.String;
  };
}

export interface HomepageCardsSlider extends Struct.ComponentSchema {
  collectionName: 'components_homepage_cards_sliders';
  info: {
    displayName: 'cardsSlider';
    icon: 'cup';
  };
  attributes: {
    description: Schema.Attribute.Text;
    partnerLogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface HomepageFeaturedStories extends Struct.ComponentSchema {
  collectionName: 'components_homepage_featured_stories';
  info: {
    displayName: 'featuredStories';
    icon: 'manyToOne';
  };
  attributes: {
    stories: Schema.Attribute.Relation<'oneToMany', 'api::story.story'>;
  };
}

export interface InsightsBookCard extends Struct.ComponentSchema {
  collectionName: 'components_insights_book_cards';
  info: {
    description: 'A book card for the Insights books section \u2014 cover, title, author, Amazon link, reviewer quote';
    displayName: 'Book Card';
    icon: 'book';
  };
  attributes: {
    amazonUrl: Schema.Attribute.String;
    author: Schema.Attribute.String;
    bookCover: Schema.Attribute.Media<'images'>;
    bookSubtitle: Schema.Attribute.String;
    bookTitle: Schema.Attribute.String;
    reviews: Schema.Attribute.Component<'insights.book-review', true>;
  };
}

export interface InsightsBookReview extends Struct.ComponentSchema {
  collectionName: 'components_insights_book_reviews';
  info: {
    description: 'A single reviewer quote \u2014 name, designation, and review text';
    displayName: 'Book Review';
    icon: 'quote';
  };
  attributes: {
    reviewerDesignation: Schema.Attribute.String;
    reviewerName: Schema.Attribute.String;
    reviewText: Schema.Attribute.Text;
  };
}

export interface InsightsSeriesCard extends Struct.ComponentSchema {
  collectionName: 'components_insights_series_cards';
  info: {
    description: 'A series card \u2014 orange title, description, read more link (e.g. Slingshot, Future View)';
    displayName: 'Series Card';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    readMoreUrl: Schema.Attribute.String;
    seriesTitle: Schema.Attribute.String;
  };
}

export interface InsightsVideoCard extends Struct.ComponentSchema {
  collectionName: 'components_insights_video_cards';
  info: {
    description: 'A video card for the Insights grid \u2014 thumbnail, title, series name, date, description, read more link';
    displayName: 'Video Card';
    icon: 'play';
  };
  attributes: {
    description: Schema.Attribute.Text;
    publishedOn: Schema.Attribute.Date;
    readMoreUrl: Schema.Attribute.String;
    seriesName: Schema.Attribute.String;
    thumbnail: Schema.Attribute.Media<'images' | 'videos'>;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface NavigationMenuItems extends Struct.ComponentSchema {
  collectionName: 'components_navigation_menu_items';
  info: {
    displayName: 'menuItems';
    icon: 'layer';
  };
  attributes: {
    displayOrder: Schema.Attribute.Integer;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface PitchSectorOption extends Struct.ComponentSchema {
  collectionName: 'components_pitch_sector_options';
  info: {
    description: 'One choice in the pitch form sector dropdown';
    displayName: 'Sector Option';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PortfolioCard extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_cards';
  info: {
    displayName: 'card';
    icon: 'chartBubble';
  };
  attributes: {
    aboutPartner: Schema.Attribute.Text;
    founder: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    partnerImg: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    url: Schema.Attribute.String;
  };
}

export interface PortfolioHeroLogo extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_hero_logos';
  info: {
    description: 'Company logo displayed in the portfolio hero rotating constellation';
    displayName: 'Hero Logo';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PortfolioPartnerCards extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_partner_cards';
  info: {
    displayName: 'partnerCards';
    icon: 'grid';
  };
  attributes: {
    actualCard: Schema.Attribute.Component<'portfolio.card', true>;
  };
}

export interface SharedHomepageSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_homepage_sliders';
  info: {
    displayName: 'homepageSlider';
    icon: 'slideshow';
  };
  attributes: {
    homepageBanner: Schema.Attribute.String;
    imgSlider1: Schema.Attribute.Component<'shared.img-slider', true>;
  };
}

export interface SharedImageSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_image_sliders';
  info: {
    displayName: 'ImageSlider';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Heading: Schema.Attribute.String;
    partnerLogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface SharedImgSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_img_sliders';
  info: {
    displayName: 'imgSlider';
    icon: 'chartBubble';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    innerBannerHeadind: Schema.Attribute.Text;
    partnerLogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface SharedLogo extends Struct.ComponentSchema {
  collectionName: 'components_shared_logos';
  info: {
    displayName: 'logo';
    icon: 'eye';
  };
  attributes: {
    partnerLogoImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    partnerLogoName: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedPartnerImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_partner_images';
  info: {
    displayName: 'partnerImage';
  };
  attributes: {
    LogoImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SharedPartners extends Struct.ComponentSchema {
  collectionName: 'components_shared_partners';
  info: {
    displayName: 'partners';
    icon: 'briefcase';
  };
  attributes: {
    partnerLogo: Schema.Attribute.Component<'shared.logo', true>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSectionAppearance extends Struct.ComponentSchema {
  collectionName: 'components_shared_section_appearances';
  info: {
    description: '';
    displayName: 'SectionAppearance';
    icon: 'paint-brush';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    backgroundMode: Schema.Attribute.Enumeration<
      ['plain', 'gradient', 'plain-with-gradient']
    >;
    gradientImage: Schema.Attribute.Media<'images'>;
    headingArtwork: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface StoryBlogCard extends Struct.ComponentSchema {
  collectionName: 'components_story_blog_cards';
  info: {
    displayName: 'BlogCard';
    icon: 'file';
  };
  attributes: {
    aboutCard: Schema.Attribute.Text;
    by: Schema.Attribute.String;
    cardImg: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    description: Schema.Attribute.Text;
    readMore: Schema.Attribute.String;
  };
}

export interface StoryBlogCards extends Struct.ComponentSchema {
  collectionName: 'components_story_blog_card_groups';
  info: {
    displayName: 'blogCards';
    icon: 'grid';
  };
  attributes: {
    card: Schema.Attribute.Component<'story.blog-card', true>;
  };
}

export interface TeamsDesignation extends Struct.ComponentSchema {
  collectionName: 'components_teams_designations';
  info: {
    displayName: 'Designation';
    icon: 'archive';
  };
  attributes: {
    designation: Schema.Attribute.String;
  };
}

export interface TeamsSocialMedia extends Struct.ComponentSchema {
  collectionName: 'components_teams_social_medias';
  info: {
    displayName: 'SocialMedia';
  };
  attributes: {
    ProfileUri: Schema.Attribute.String;
    SocialMediaImages: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Text: Schema.Attribute.String;
  };
}

export interface TeamsTeam extends Struct.ComponentSchema {
  collectionName: 'components_teams_teams';
  info: {
    displayName: 'team';
    icon: 'dashboard';
  };
  attributes: {};
}

export interface TeamsTeamMembers extends Struct.ComponentSchema {
  collectionName: 'components_teams_team_members';
  info: {
    displayName: 'teamMembers';
    icon: 'alien';
  };
  attributes: {
    designation: Schema.Attribute.String;
    name: Schema.Attribute.String;
    personImg: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface ThesisBottomSliderHeading extends Struct.ComponentSchema {
  collectionName: 'components_thesis_bottom_slider_headings';
  info: {
    displayName: 'bottomSliderHeading';
    icon: 'book';
  };
  attributes: {
    sliderImg1: Schema.Attribute.Component<'thesis.slider-img', true>;
    title: Schema.Attribute.String;
  };
}

export interface ThesisShowcaseSection extends Struct.ComponentSchema {
  collectionName: 'components_thesis_showcase_sections';
  info: {
    description: 'Theme showcase with tag, heading, description, feature image, and partner logos';
    displayName: 'Showcase Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    featureImage: Schema.Attribute.Media<'images'>;
    heading: Schema.Attribute.Text & Schema.Attribute.Required;
    layoutDirection: Schema.Attribute.Enumeration<
      ['image-right', 'image-left']
    > &
      Schema.Attribute.DefaultTo<'image-right'>;
    logos: Schema.Attribute.Component<'thesis.slider-img', true>;
    tag: Schema.Attribute.String & Schema.Attribute.Required;
    tagIcon: Schema.Attribute.Media<'images'>;
  };
}

export interface ThesisSliderImg extends Struct.ComponentSchema {
  collectionName: 'components_thesis_slider_imgs';
  info: {
    displayName: 'sliderImg';
  };
  attributes: {
    img1: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imgTxt: Schema.Attribute.String;
  };
}

export interface ThesisThemeCard extends Struct.ComponentSchema {
  collectionName: 'components_thesis_theme_cards';
  info: {
    description: 'Investment theme card with icon, title, and description';
    displayName: 'Theme Card';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'footer.social-link': FooterSocialLink;
      'homepage.blog-card': HomepageBlogCard;
      'homepage.blog-section': HomepageBlogSection;
      'homepage.bottom-portfolio-slider': HomepageBottomPortfolioSlider;
      'homepage.cards-slider': HomepageCardsSlider;
      'homepage.featured-stories': HomepageFeaturedStories;
      'insights.book-card': InsightsBookCard;
      'insights.book-review': InsightsBookReview;
      'insights.series-card': InsightsSeriesCard;
      'insights.video-card': InsightsVideoCard;
      'navigation.menu-items': NavigationMenuItems;
      'pitch.sector-option': PitchSectorOption;
      'portfolio.card': PortfolioCard;
      'portfolio.hero-logo': PortfolioHeroLogo;
      'portfolio.partner-cards': PortfolioPartnerCards;
      'shared.homepage-slider': SharedHomepageSlider;
      'shared.image-slider': SharedImageSlider;
      'shared.img-slider': SharedImgSlider;
      'shared.logo': SharedLogo;
      'shared.media': SharedMedia;
      'shared.partner-image': SharedPartnerImage;
      'shared.partners': SharedPartners;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.section-appearance': SharedSectionAppearance;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'story.blog-card': StoryBlogCard;
      'story.blog-cards': StoryBlogCards;
      'teams.designation': TeamsDesignation;
      'teams.social-media': TeamsSocialMedia;
      'teams.team': TeamsTeam;
      'teams.team-members': TeamsTeamMembers;
      'thesis.bottom-slider-heading': ThesisBottomSliderHeading;
      'thesis.showcase-section': ThesisShowcaseSection;
      'thesis.slider-img': ThesisSliderImg;
      'thesis.theme-card': ThesisThemeCard;
    }
  }
}
