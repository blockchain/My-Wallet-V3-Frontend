angular
  .module('walletApp')
  .config(feedbackRoutes);

function feedbackRoutes($stateProvider, $urlRouterProvider) {
  $stateProvider.state('wallet.common.feedback', {
    url: '/feedback',
    views: {
      top : {
        templateUrl: "partials/top.jade",
        controller: "TopCtrl"
      },
      left: {
        templateUrl: 'partials/wallet-navigation.jade',
        controller: 'WalletNavigationCtrl'
      },
      right: {
        templateUrl: 'partials/feedback.jade',
        controller: 'FeedbackCtrl'
      }
    }
  });
}
