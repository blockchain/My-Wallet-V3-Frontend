angular
  .module('sharedDirectives')
  .directive('scrollInView', scrollInView);

scrollInView.$inject = ['$window', '$timeout'];

function scrollInView ($window, $timeout) {
  const directive = {
    restrict: 'E',
    template: `
      <div ng-class="{active: isActive}" class="scroll-in-view flex-justify flex-align-start">
        <div ng-class="{shadow: shadow}" class="image-container"><img ng-src="{{::img}}"/>
          <div ng-if="transactions.length" class="txs"><img ng-src="img/transaction-1.png" class="tx"/><img ng-src="img/transaction-2.png" class="tx"/><img ng-src="img/transaction-3.png" class="tx"/><img ng-src="img/transaction-4.png" class="tx"/><img ng-src="img/transaction-5.png" class="tx"/><img ng-src="img/transaction-6.png" class="tx"/></div>
        </div>
      </div>
    `,
    replace: true,
    scope: {},
    img: '@',
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.img = attrs['img'];
    scope.shadow = attrs['shadow'];
    scope.transactions = attrs['transactions'];

    scope.initScroll = () => {
      $timeout(() => {
        let windowBottom = $window.pageYOffset + $window.innerHeight;
        let itemTop = elem[0].getBoundingClientRect().top;
        scope.onScroll(windowBottom, itemTop);
      }, 10);
    };

    scope.onScroll = (bottom, top) => {
      if (bottom > top) scope.isActive = true;
      else scope.isActive = false;
      scope.$apply();
    };

    angular.element(document).ready(scope.initScroll);
    angular.element($window).bind('scroll', scope.initScroll);
  }
}
