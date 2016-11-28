
angular
  .module('walletApp')
  .directive('activityFeed', activityFeed);

activityFeed.$inject = ['$http', 'Wallet', 'MyWallet', 'Activity', 'Options', 'buyStatus'];

function activityFeed ($http, Wallet, MyWallet, Activity, Options, buyStatus) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/activity-feed.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.loading = true;
    scope.status = Wallet.status;
    scope.activities = Activity.activities;

    scope.canBuy = buyStatus.canBuy();

    scope.$watch(() => Activity.activities, (activities) => {
      scope.activities = activities;
    });

    scope.$watch('status.didLoadTransactions', (didLoad) => {
      if (didLoad) scope.loading = false;
    });

    scope.$watch('status.didLoadSettings', (didLoad) => {
      if (didLoad) Activity.updateLogActivities();
    });
  }
}
