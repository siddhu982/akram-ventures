/**
 * story controller
 */

import { factories } from '@strapi/strapi';

const defaultPopulate = {
  brandLogo: true,
  blogImg: true,
};

export default factories.createCoreController('api::story.story', () => ({
  async find(ctx) {
    if (!ctx.query?.populate || ctx.query.populate === '*') {
      ctx.query = {
        ...ctx.query,
        populate: defaultPopulate,
      };
    }
    return await super.find(ctx);
  },
  async findOne(ctx) {
    if (!ctx.query?.populate || ctx.query.populate === '*') {
      ctx.query = {
        ...ctx.query,
        populate: defaultPopulate,
      };
    }
    return await super.findOne(ctx);
  },
}));
