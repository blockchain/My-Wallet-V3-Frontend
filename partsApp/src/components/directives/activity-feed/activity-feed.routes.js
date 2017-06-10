function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('activity-feed',
    {
      url: '/activity-feed/:scenarioId',
      parent: 'directives',
      views: {
        'content': {
          component: 'activityFeedPage'
        }
      }
    });
}

export default routes;
