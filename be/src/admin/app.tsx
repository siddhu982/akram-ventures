import type { StrapiApp } from '@strapi/strapi/admin';

const CM_ENTRY = /\/content-manager\/collection-types\/api::pitch-submission\.pitch-submission\/([A-Za-z0-9]+)\/?$/;

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    // Sidebar entry: submissions as a table, opened as label/value tables
    app.addMenuLink({
      to: '/pitch-submissions',
      icon: () => <span style={{ fontSize: 16 }}>📨</span>,
      intlLabel: { id: 'pitch-submissions.menu', defaultMessage: 'Pitch Submissions' },
      Component: () => import('./pages/PitchSubmissions'),
      permissions: [],
    });
  },
  bootstrap() {
    // Strapi's own entry page is made of editable inputs. For pitch submissions, send admins
    // to the read-only table view instead whenever they open an entry from the Content Manager.
    window.setInterval(() => {
      const m = window.location.pathname.match(CM_ENTRY);
      if (m && m[1] !== 'create') {
        window.location.replace(`/admin/pitch-submissions?id=${m[1]}`);
      }
    }, 250);
  },
};
