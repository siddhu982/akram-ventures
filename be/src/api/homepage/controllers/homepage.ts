/**
 * homepage controller
 */

import { factories } from '@strapi/strapi';

const defaultPopulate = {
  backgroundGrading: true,
  addYourLayout: {
    on: {
      'shared.homepage-slider': {
        populate: {
          imgSlider1: {
            populate: '*',
          },
        },
      },
      'shared.partners': {
        populate: {
          partnerLogo: {
            populate: '*',
          },
        },
      },
      'homepage.blog-section': {
        populate: {
          blog: {
            populate: '*',
          },
        },
      },
      'homepage.featured-stories': {
        populate: {
          stories: {
            populate: {
              brandLogo: true,
              blogImg: true,
              blogs: {
                on: {
                  'story.blog-cards': {
                    populate: {
                      card: {
                        populate: {
                          cardImg: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      'thesis.bottom-slider-heading': {
        populate: {
          sliderImg1: {
            populate: {
              img1: true,
            },
          },
        },
      },
      'homepage.bottom-portfolio-slider': {
        populate: {
          sliderCard: {
            populate: {
              partnerLogo: true,
            },
          },
        },
      },
    },
  },
};

export default factories.createCoreController('api::homepage.homepage', () => ({
  async find(ctx) {
    if (!ctx.query?.populate || ctx.query.populate === '*') {
      ctx.query = {
        ...ctx.query,
        populate: defaultPopulate,
      };
    }

    return await super.find(ctx);
  },
}));
