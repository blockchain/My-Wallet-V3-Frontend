
function routing ($urlRouterProvider, $locationProvider) {
  'ngInject';
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('');
  $urlRouterProvider.otherwise('/');
}

export default routing;
