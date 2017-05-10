import AdvertsTemplate from './adverts.pug';

function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('adverts',
    {
      url: '/adverts',
      views: {
        'main': {
          template: AdvertsTemplate,
          controller: 'AdvertsController',
          controllerAs: '$ctrl'
        }
      }
    });
}

export default routes;
