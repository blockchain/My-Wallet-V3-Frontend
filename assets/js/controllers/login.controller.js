angular
  .module('walletApp')
  .controller("LoginCtrl", LoginCtrl);

function LoginCtrl($scope, $rootScope, $log, $http, Wallet, Alerts, $cookies, $uibModal, $state, $stateParams, $timeout, $translate, filterFilter) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.disableLogin = null;
  $scope.status.enterkey = false;
  $scope.key = $cookies.get("key");
  $scope.errors = {
    uid: null,
    password: null,
    twoFactor: null
  };
  $scope.uidAvailable = $cookies.get('uid') != null || $stateParams.uid;
  $scope.user = Wallet.user;

  //   Browser compatibility warnings:
  // * Secure random number generator: https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues
  // * AngularJS support (?)

  if (browserDetection().browser === "ie") {
    if (browserDetection().version < 11) {
      $translate("MINIMUM_BROWSER", {
        browser: "Internet Explorer",
        requiredVersion: 11,
        userVersion: browserDetection().version
      }).then(translation => {
        Alerts.displayError(translation, true);
      });
      $scope.disableLogin = true;
    } else {
      $translate("WARN_AGAINST_IE").then(translation => {
        Alerts.displayWarning(translation, true);
      });
    }
  } else if (browserDetection().browser === "chrome") {
    if (browserDetection().version < 11) {
      $translate("MINIMUM_BROWSER", {
        browser: "Chrome",
        requiredVersion: 11,
        userVersion: browserDetection().version
      }).then(translation => {
        Alerts.displayError(translation, true);
      });
      $scope.disableLogin = true;
    }
  } else if (browserDetection().browser === "firefox") {
    if (browserDetection().version < 21) {
      $translate("MINIMUM_BROWSER", {
        browser: "Firefox",
        requiredVersion: 21,
        userVersion: browserDetection().version
      }).then(translation => {
        Alerts.displayError(translation, true);
      });
      $scope.disableLogin = true;
    }
  } else if (browserDetection().browser === "safari") {
    if (browserDetection().version < 6) {
      $translate("MINIMUM_BROWSER", {
        browser: "Safari",
        requiredVersion: 6,
        userVersion: browserDetection().version
      }).then(translation => {
        Alerts.displayError(translation, true);
      });
      $scope.disableLogin = true;
    }
  } else if (browserDetection().browser === "opera") {
    if (browserDetection().version < 15) {
      $translate("MINIMUM_BROWSER", {
        browser: "Opera",
        requiredVersion: 15,
        userVersion: browserDetection().version
      }).then(translation => {
        Alerts.displayError(translation, true);
      });
      $scope.disableLogin = true;
    }
  } else {
  // Warn against unknown browser. Tell user to pay attention to random number generator and CORS protection.
    $translate("UNKNOWN_BROWSER").then(translation => {
      Alerts.displayWarning(translation, true);
    });
  }
  if (Wallet.guid != null) {
    $scope.uid = Wallet.guid;
  } else {
    $scope.uid = $stateParams.uid || $cookies.get("uid");
  }
  if ($scope.key != null) {
    $scope.status.enterkey = true;
  }
  $scope.twoFactorCode = "";
  $scope.busy = false;
  $scope.isValid = false;
  if (!!$cookies.get("password")) {
    $scope.password = $cookies.get("password");
  }
  $scope.login = () => {
    if ($scope.busy) return;
    $scope.busy = true;
    Alerts.clear();
    const error = (field, message) => {
      $scope.busy = false;
      if (field === "uid") {
        $scope.errors.uid = message;
      } else if (field === "password") {
        $scope.errors.password = message;
      } else if (field === "twoFactor") {
        $scope.errors.twoFactor = message;
      }
    };
    const needs2FA = () => {
      $scope.busy = false;
      $scope.didAsk2FA = true;
    };
    const success = () => {
      $scope.busy = false;
    };
    if ($scope.settings.needs2FA) {
      Wallet.login($scope.uid, $scope.password, $scope.twoFactorCode, (() => {}), success, error);
    } else {
      Wallet.login($scope.uid, $scope.password, null, needs2FA, success, error);
    }
    if ($scope.uid != null && $scope.uid !== "") {
      $cookies.put("uid", $scope.uid);
    }
    if ($scope.savePassword && $scope.password != null && $scope.password !== "") {
      $cookies.put("password", $scope.password);
    }
  };

  $scope.resend = () => {
    if (Wallet.settings.twoFactorMethod === 5) {
      $scope.resending = true;
      const success = () => {
        $scope.resending = false;
      };
      const error = () => {
        $scope.resending = false;
      };
      Wallet.resendTwoFactorSms($scope.uid, success, error);
    }
  };

  $scope.register = () => {
    $state.go("public.signup");
  };

  $scope.numberOfActiveAccounts = () => {
    filterFilter(Wallet.accounts(), {
      archived: false
    }).length;
  };
  $scope.$watch("status.isLoggedIn", (newValue) => {
    if (newValue) {
      $scope.busy = false;
      $state.go("wallet.common.home");
    }
  });

  $scope.$watch("uid + password + twoFactor", () => {
    let isValid = null;
    $scope.errors.uid = null;
    $scope.errors.password = null;
    $scope.errors.twoFactor = null;
    if ($scope.uid == null || $scope.uid === "") {
      isValid = false;
    }
    if ($scope.password == null || $scope.password === "") {
      isValid = false;
    }
    if ($scope.settings.needs2FA && $scope.twoFactorCode === "") {
      isValid = false;
    }
    if (isValid == null) {
      isValid = true;
    }
    $scope.isValid = isValid;
  });
}
