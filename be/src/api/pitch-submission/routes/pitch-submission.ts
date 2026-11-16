export default {
  routes: [
    {
      method: 'POST',
      path: '/pitch-submissions',
      handler: 'pitch-submission.create',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/pitch-submissions',
      handler: 'pitch-submission.find',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/pitch-submissions/:id',
      handler: 'pitch-submission.findOne',
      config: { policies: [], middlewares: [] },
    },
  ],
};
