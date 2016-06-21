angular
  .module('walletApp')
  .directive('downloader', downloader);

function downloader ($timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: '<a href="{{dataRef}}" download="{{fileName}}" target="_self"></a>',
    link: link
  };
  return directive;

  function link (scope, attr, elem) {
    scope.$on('download', (event, data) => {
      if (!data.url || !data.name) return;
      scope.dataRef = data.url;
      scope.fileName = data.name;
      $timeout(() => elem.$$element[0].click());
    });
  }
}
