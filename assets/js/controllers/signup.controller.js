angular
  .module('walletApp')
  .controller("SignupCtrl", SignupCtrl);

function SignupCtrl($scope, $rootScope, $log, Wallet, Alerts, currency, $uibModal, $translate, $cookieStore, $filter, $state, $http, languages) {
  $scope.working = false;
  $scope.alerts = Alerts.alerts;
  $scope.status = Wallet.status;

  $scope.$watch("status.isLoggedIn", newValue => {
    if (newValue) {
      $scope.busy = false;
      $state.go("signup.finish.show");
    }
  });

  $scope.isValid = true;
  let language_guess = $filter("getByProperty")("code", $translate.use(), languages);
  if (language_guess == null) {
    $scope.language_guess = $filter("getByProperty")("code", "en", languages);
  }
  $scope.currency_guess = $filter("getByProperty")("code", "USD", currency.currencies);

  $scope.fields = {
    email: "",
    password: "",
    confirmation: "",
    acceptedAgreement: false
  };

  $scope.showAgreement = () => {
    const modalInstance = $uibModal.open({
      templateUrl: "partials/alpha-agreement.jade",
      controller: 'SignupCtrl',
      windowClass: "bc-modal terms-modal"
    });
  };

  $scope.close = () => {
    Alerts.clear();
    $state.go("wallet.common.home");
  };

  $scope.trySignup = () => {
    if ($scope.isValid) $scope.signup();
  };

  $scope.signup = () => {
    $scope.validate();
    if ($scope.isValid) {
      $scope.working = true;
      $scope.createWallet( uid => {
        $scope.working = false;
        if (uid != null) {
          $cookieStore.put("uid", uid);
        }
        if ($scope.savePassword) {
          $cookieStore.put("password", $scope.fields.password);
        }
        $scope.close("");
      });
    }
  };

  $scope.createWallet = successCallback => {
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.fields.language, $scope.fields.currency, uid => {
      successCallback(uid);
    });
  };

  $scope.$watch("fields.confirmation", newVal => {
    if ((newVal != null) && $scope.fields.password !== "") {
      $scope.validate(false);
    }
  });

  $scope.validate = visual => {
    if (visual == null) {
      visual = true;
    }
    $scope.isValid = true;
    $scope.errors = {
      email: null,
      password: null,
      confirmation: null
    };
    $scope.success = {
      email: false,
      password: false,
      confirmation: false
    };
    if ($scope.fields.email === "") {
      $scope.isValid = false;
      $translate("EMAIL_ADDRESS_REQUIRED").then( translation => {
        $scope.errors.email = translation;
      });
    } else if ($scope.form && $scope.form.$error.email) {
      $scope.isValid = false;
      $translate("EMAIL_ADDRESS_INVALID").then( translation => {
        $scope.errors.email = translation;
      });
    } else {
      $scope.success.email = true;
    }
    if ($scope.form && $scope.form.$error) {
      if ($scope.form.$error.minEntropy) {
        $scope.isValid = false;
        $translate("TOO_WEAK").then( translation => {
          $scope.errors.password = translation;
        });
      }
      if ($scope.form.$error.maxlength) {
        $scope.isValid = false;
        $translate("TOO_LONG").then( translation => {
          $scope.errors.password = translation;
        });
      }
    }
    if ($scope.fields.confirmation === "") {
      $scope.isValid = false;
    } else {
      if ($scope.fields.confirmation === $scope.fields.password) {
        $scope.success.confirmation = true;
      } else {
        $scope.isValid = false;
        if (visual) {
          $translate("NO_MATCH").then( translation => {
            $scope.errors.confirmation = translation;
          });
        }
      }
    }
    if (!$scope.fields.acceptedAgreement) {
      $scope.isValid = false;
    }
  };
  $scope.validate();

  $scope.$watch("language_guess", (newVal, oldVal) => {
    if (newVal != null) {
      $translate.use(newVal.code);
      Wallet.changeLanguage(newVal);
    }
  });

  $scope.$watch("currency_guess", (newVal, oldVal) => {
    if (newVal != null) {
      Wallet.changeCurrency(newVal);
    }
  });

  $scope.$on('signed_agreement', () => {
    $scope.fields.acceptedAgreement = true;
  });
}
