import DirectivesTemplate from './directives.pug';
import nav from './directives.nav.js';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('directives', {
      url: '/directives',
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
          template: DirectivesTemplate,
          controller: 'DirectivesController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
