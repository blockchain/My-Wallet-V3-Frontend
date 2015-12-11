
angular
  .module('walletApp')
  .directive('bcAsyncInput', bcAsyncInput);

bcAsyncInput.$inject = ['$timeout', 'Wallet'];

function bcAsyncInput($timeout, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      ngModel: '=',
      validator: '=',
      onSave: '=',
      onCancel: '=',
      onChange: '=',
      actionTitle: '=',
      placeholder: '=',
      _type: '@type',
      errorMessage: '=',
      _buttonClass: '@buttonClass',
      maxLength: '@',
      transform: '='
    },
    transclude: true,
    templateUrl: (elem, attrs) => {
      let templ = attrs.custom ? 'transclude.jade' : 'bc-async-input.jade';
      return `templates/${templ}`;
    },
    link: link
  };
  return directive;

  function link(scope, elem, attrs, ctrl, transclude) {
    scope.isRequired = attrs.isRequired != null;
    scope.inline = attrs.inline != null;

    scope.type = scope._type || 'text';
    scope.buttonClass = scope._buttonClass || 'button-primary btn-small';

    scope.user = Wallet.user;
    scope.status = {
      edit: false,
      saving: false
    };

    if (attrs.editing != null) scope.status.edit = true;

    scope.form = {
      newValue: scope.ngModel
    };

    scope.edit = function () {
      // finds and focuses on the text input field
      // a brief timeout is necessary before trying to focus
      $timeout((function () {
        elem.find('input')[0].focus();
      }), 50);
      return scope.status.edit = 1;
    };

    scope.focus = function () {
      scope.status.edit = 1;
    };

    scope.validate = function () {
      return scope.validator ? scope.validator(scope.form.newValue) : true;
    };

    scope.save = function () {
      scope.status.saving = true;

      let success = function () {
        scope.ngModel = scope.form.newValue;
        if (!attrs.custom) scope.bcAsyncForm.$setPristine();

        // Fixes issue: hit enter after changing PBKDF2 iterations
        // when 2nd password is enabled
        scope.$evalAsync(function () {
          scope.status.saving = false;
          if (!attrs.editing) scope.status.edit = false;
        });
        scope.$root.$safeApply(scope);
      };

      let error = function () {
        scope.status.saving = false;
        scope.$root.$safeApply(scope);
      };

      scope.onSave(scope.form.newValue, success, error);
    };

    scope.cancel = function () {
      if (!attrs.editing) scope.status.edit = false;
      scope.bcAsyncForm.input.$rollbackViewValue();
      scope.form.newValue = scope.ngModel;
      scope.bcAsyncForm.$setPristine();
      scope.onCancel && scope.onCancel();
    };

    transclude(scope, function (clone, scope) {
      if (attrs.custom) elem.empty().append(clone);
    });
  }
}
