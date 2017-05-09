import ComponentsTemplate from './components.pug';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('components',
    {
      url: '/components',
      views: {
        'main': {
          template: ComponentsTemplate,
          controller: 'ComponentsController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
