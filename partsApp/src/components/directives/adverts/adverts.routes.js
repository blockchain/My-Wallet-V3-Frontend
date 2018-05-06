function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('adverts',
    {
      url: '/adverts/:scenarioId',
      parent: 'directives',
      views: {
        'content': {
          component: 'advertsPage'
        }
      }
    });
}

export default routes;
