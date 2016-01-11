angular
  .module('walletApp')
  .controller("AuthorizeApproveCtrl", AuthorizeApproveCtrl);

function AuthorizeApproveCtrl($window, $scope, Wallet, $stateParams, $state, Alerts, $translate) {
  const success = (uid) => {
    $scope.checkingToken = false;
    $scope.busyApproving = false;
    $scope.busyRejecting = false;


    $window.close(); // This is sometimes ignored, hence the code below:

    if(uid) {
      $translate('AUTHORIZE_APPROVE_SUCCESS').then(translation => {
        $state.go("public.login-uid", {uid: uid}).then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    } else {
      $translate('AUTHORIZE_APPROVE_SUCCESS').then(translation => {
        $state.go("public.login-no-uid").then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    }
  }

  const error = (message) => {
    $scope.checkingToken = false;
    $scope.busyApproving = false;
    $scope.busyRejecting = false;

    $state.go("public.login-no-uid");
    Alerts.displayError(message, true);
  }

  const differentBrowser = (details) => {
    $scope.checkingToken = false;

    $scope.differentBrowser = true;
    $scope.details = details;
  }

  $scope.checkingToken = true;

  Wallet.authorizeApprove($stateParams.token, differentBrowser, null)
    .then(success)
    .catch(error);

  $scope.approve = () => {
    $scope.busyApproving = true;
    Wallet.authorizeApprove($stateParams.token, () => {}, true)
      .then(success)
      .catch(error);
  }

  $scope.reject = () => {
    $scope.busyRejecting = true;

    const rejected = () => {
      $scope.busyRejecting = false;

      $translate('AUTHORIZE_REJECT_SUCCESS').then(translation => {
        $state.go("public.login-no-uid").then(() => {
          Alerts.displaySuccess(translation)
        });
      });
    };

    Wallet.authorizeApprove($stateParams.token, () => {}, false)
      .then(rejected)
      .catch(error);
  }
}
