import HomeTemplate from './home.pug';
import nav from './home.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/',
      resolve: {
        links: () => nav.headerLinks
      },
      views: {
        'top': {
          component: 'header'
        },
        'content': {
          template: HomeTemplate,
          controller: 'HomeController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
