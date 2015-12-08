angular
  .module('walletApp')
  .controller("SignupCtrl", SignupCtrl);

function SignupCtrl($scope, $rootScope, $log, Wallet, Alerts, currency, $uibModal, $translate, $cookieStore, $filter, $state, $http, languages) {
  $scope.currentStep = 1;
  $scope.working = false;
  $scope.languages = languages;
  $scope.currencies = currency.currencies;
  $scope.alerts = Alerts.alerts;
  $scope.status = Wallet.status;

  $scope.$watch("status.isLoggedIn", newValue => {
    if (newValue) {
      $scope.busy = false;
      $state.go("signup.finish.show");
    }
  });

  $scope.isValid = [true, true];
  let language_guess = $filter("getByProperty")("code", $translate.use(), languages);
  if (language_guess == null) {
    language_guess = $filter("getByProperty")("code", "en", languages);
  }
  const currency_guess = $filter("getByProperty")("code", "USD", currency.currencies);
  $scope.fields = {
    email: "",
    password: "",
    confirmation: "",
    language: language_guess,
    currency: currency_guess,
    acceptedAgreement: false
  };

  $scope.betaCheckSuccess = false;


  // If BETA=1 is set in .env then in index.html/jade $rootScope.beta is set.
  // The following checks are not ideal as they can be bypassed with some creative Javascript commands.
  if ($rootScope.beta) {
    // Check if we allow signups at the moment:
    $http.post("/check_beta", {}).success((data) => {
      if (data.open) {
        $scope.betaCheckSuccess = true;
      } else {
        if (data.error && data.error.message) {
          $scope.betaCheckError = data.error.message;
        }
      }
    }).error(() => {
      $scope.betaCheckError = "There is a problem with our alpha wallet access control system, please try again later.";
    });
  } else {
    $scope.betaCheckSuccess = true;
  }

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

  $scope.tryNextStep = () => {
    if ($scope.isValid[0]) $scope.nextStep();
  };

  $scope.nextStep = () => {
    $scope.validate();
    if ($scope.isValid[$scope.currentStep - 1]) {
      if ($scope.currentStep === 1) {
        $scope.working = true;
        $scope.createWallet( uid => {
          $scope.working = false;
          if (uid != null) {
            $cookieStore.put("uid", uid);
          }
          if ($scope.savePassword) {
            $cookieStore.put("password", $scope.fields.password);
          }
          $scope.currentStep++;
          $scope.close("");
        });
      }
    }
  };

  $scope.createWallet = successCallback => {
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.fields.language, $scope.fields.currency, uid => {
      $cookieStore.put("uid", uid);
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
    $scope.isValid[0] = true;
    $scope.isValid[1] = true;
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
      $scope.isValid[0] = false;
      $translate("EMAIL_ADDRESS_REQUIRED").then( translation => {
        $scope.errors.email = translation;
      });
    } else if ($scope.form && $scope.form.$error.email) {
      $scope.isValid[0] = false;
      $translate("EMAIL_ADDRESS_INVALID").then( translation => {
        $scope.errors.email = translation;
      });
    } else {
      $scope.success.email = true;
    }
    if ($scope.form && $scope.form.$error) {
      if ($scope.form.$error.minEntropy) {
        $scope.isValid[0] = false;
        $translate("TOO_WEAK").then( translation => {
          $scope.errors.password = translation;
        });
      }
      if ($scope.form.$error.maxlength) {
        $scope.isValid[0] = false;
        $translate("TOO_LONG").then( translation => {
          $scope.errors.password = translation;
        });
      }
    }
    if ($scope.fields.confirmation === "") {
      $scope.isValid[0] = false;
    } else {
      if ($scope.fields.confirmation === $scope.fields.password) {
        $scope.success.confirmation = true;
      } else {
        $scope.isValid[0] = false;
        if (visual) {
          $translate("NO_MATCH").then( translation => {
            $scope.errors.confirmation = translation;
          });
        }
      }
    }
    if (!$scope.fields.acceptedAgreement) {
      $scope.isValid[0] = false;
    }
  };
  $scope.validate();

  $scope.$watch("fields.language", (newVal, oldVal) => {
    if (newVal != null) {
      $translate.use(newVal.code);
      Wallet.changeLanguage(newVal);
    }
  });

  $scope.$watch("fields.currency", (newVal, oldVal) => {
    if (newVal != null) {
      Wallet.changeCurrency(newVal);
    }
  });

  $scope.$on('signed_agreement', () => {
    $scope.fields.acceptedAgreement = true;
  });
}
