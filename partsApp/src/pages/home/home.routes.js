import HomeTemplate from './home.pug';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('home',
    {
      url: '/',
      views: {
        'main': {
          template: HomeTemplate,
          controller: 'HomeController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
