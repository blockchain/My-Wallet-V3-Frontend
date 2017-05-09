import DirectivesTemplate from './directives.pug';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('directives',
    {
      url: '/directives',
      views: {
        'main': {
          template: DirectivesTemplate,
          controller: 'DirectivesController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
