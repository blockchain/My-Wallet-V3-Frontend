import nav from './directives.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('directives', {
      url: '/directives',
      resolve: {
        title: () => 'Directives',
        links: () => nav.headerLinks,
        menuLinks: () => nav.menuLinks
      },
      views: {
        'header': {
          component: 'header'
        },
        'menu': {
          component: 'leftNavbar'
        },
        'body': {
          component: 'directives'
        }
      }
    });
}

export default routes;
