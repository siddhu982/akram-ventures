import { factories } from '@strapi/strapi';
import { sendEmail } from '../../../email/service';

export default factories.createCoreController(
  'api::contact-submission.contact-submission',
  ({ strapi }) => ({
    async create(ctx) {
      // Save to DB via default Strapi behaviour
      const response = await super.create(ctx);

      const { name, email, company, phone, message } = response.data;
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_DEFAULT_FROM;

      // Fire-and-forget — don't block the HTTP response if email fails
      sendEmail(strapi, 'contact-confirmation', email, { username: name }).catch(
        (err) => strapi.log.error('[contact] confirmation email failed:', err)
      );

      if (adminEmail) {
        sendEmail(strapi, 'contact-admin', adminEmail, {
          username: name,
          email,
          company: company || 'N/A',
          phone: phone || 'N/A',
          message,
        }).catch((err) => strapi.log.error('[contact] admin email failed:', err));
      }

      return response;
    },
  })
);
