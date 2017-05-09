
function routing ($urlRouterProvider, $locationProvider) {
  'ngInject';
  $locationProvider.html5Mode(false);
  $urlRouterProvider.otherwise('/');
}

export default routing;
