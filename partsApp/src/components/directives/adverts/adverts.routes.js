function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('adverts',
    {
      url: '/adverts',
      parent: 'directives',
      resolve: {
        title: () => 'Adverts'
      },
      views: {
        'content': {
          component: 'advertsPage'
        }
      }
    })
    .state('adverts-scenario1',
    {
      url: '/1',
      parent: 'adverts',
      views: {
        'content': {
          component: 'advertsScenario1'
        }
      }
    })
    .state('adverts-scenario2',
    {
      url: '/2',
      parent: 'adverts',
      views: {
        'content': {
          component: 'advertsScenario2'
        }
      }
    });
}

export default routes;
