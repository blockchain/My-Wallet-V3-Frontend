  angular
    .module('shared')
    .directive('gaPageView', gaPageView);

  function gaPageView () {
    const directive = {
      restrict: 'E',
      link: link
    };
    return directive;

    function link (scope, elem, attrs) {
      let page = document.location.pathname;
      ga('send', 'pageview', page, { anonymizeIp: true });
    }
  }
