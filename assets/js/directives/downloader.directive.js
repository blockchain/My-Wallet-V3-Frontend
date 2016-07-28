angular
  .module('walletApp')
  .directive('downloader', downloader);

function downloader ($window, $timeout) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: '<a href="{{dataRef}}" download="{{filename}}" target="_self"></a>',
    link: link
  };
  return directive;

  function link (scope, attr, elem) {
    scope.$on('download', (event, data) => {
      if (!data.contents || !data.filename) return;
      scope.blob = new $window.Blob([data.contents]);
      scope.dataRef = $window.URL.createObjectURL(scope.blob);
      scope.filename = data.filename;
      $timeout(() => elem.$$element[0].click());
    });
  }
}
