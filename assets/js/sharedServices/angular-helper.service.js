angular
  .module('shared')
  .factory('AngularHelper', AngularHelper);

AngularHelper.$inject = ['$rootScope'];

function AngularHelper ($rootScope) {
  const angularHelper = {
  };

  return angularHelper;
}
