import nav from './home.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/',
      resolve: {
        title: () => 'Home',
        links: () => nav.headerLinks
      },
      views: {
        'header': {
          component: 'header'
        },
        'body': {
          component: 'home'
        }
      }
    });
}

export default routes;
