/**
 * navigation controller
 */

import { factories } from '@strapi/strapi';

const defaultPopulate = {
  logo: true,
  menuItems: {
    sort: ['displayOrder:asc'],
  },
};

export default factories.createCoreController('api::navigation.navigation', () => ({
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

