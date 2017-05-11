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
          component: 'adverts'
        }
      }
    });
}

export default routes;
