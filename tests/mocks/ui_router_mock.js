angular.module("ui.router", ["ng"]).run([
  "$state",
  function($state) {
  }
]);

angular.module("ui.router").provider("$state", () =>

  ({
    $get() {
      let $state = {current: "somewhere"};

      $state.go = destination =>
        ({
          then(callback) {
            callback();
            return {
            };
          }
        })
      ;

      return $state;
    }
  })
);

angular.module("ui.router").provider("$stateParams", () =>

  ({
    $get() {
      let $stateParams = {};

      return $stateParams;
    }
  })
);
