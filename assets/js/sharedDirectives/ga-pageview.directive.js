  angular
    .module('shared')
    .directive('gaPageview', gaPageview);

  function gaPageview () {
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
