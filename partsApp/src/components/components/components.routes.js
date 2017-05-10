import ComponentsTemplate from './components.pug';
import nav from './components.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('components', {
      url: '/components',
      resolve: {
        links: () => nav.headerLinks,
        menuLinks: () => nav.menuLinks
      },
      views: {
        'top': {
          component: 'header'
        },
        'left': {
          component: 'leftNavbar'
        },
        'content': {
          template: ComponentsTemplate,
          controller: 'ComponentsController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
