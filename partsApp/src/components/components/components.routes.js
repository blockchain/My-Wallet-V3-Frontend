import nav from './components.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('components', {
      url: '/components',
      resolve: {
        title: () => 'Components',
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
          component: 'components'
        }
      }
    });
}

export default routes;
