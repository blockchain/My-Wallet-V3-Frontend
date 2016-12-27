angular
  .module('walletApp')
  .directive('settingsForm', settingsForm);

function settingsForm () {
  const directive = {
    restrict: 'A',
    scope: {},
    link: function (scope, elem, attr) {
      scope.$parent.errors = {};
      scope.$parent.status = {};
      scope.$parent.active = false;
      scope.$parent.reset();

      scope.$parent.promptRecovery = () => {
        scope.$parent.promptForRecovery = true;
        scope.$parent.recoveryModal();
      };

      scope.$parent.activate = () => {
        scope.$parent.active = true;
      };

      scope.$parent.deactivate = () => {
        scope.$parent.active = false;
        scope.$parent.reset();
      };

      scope.$parent.$watch('active', () => {
        if (scope.$parent.active) return;

        scope.$parent.reset();
        scope.$parent.errors = {};
        scope.$parent.status = {};

        scope.$parent.form.$setPristine();
        scope.$parent.form.$setUntouched();
        scope.$parent.$root.$safeApply(scope.$parent);
      });
    }
  };
  return directive;
}
