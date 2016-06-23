angular
  .module('walletApp')
  .directive('bcAsyncInput', bcAsyncInput);

bcAsyncInput.$inject = ['$timeout', 'Wallet'];

function bcAsyncInput ($timeout, Wallet) {
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
      unit: '@',
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

  function link (scope, elem, attrs, ctrl, transclude) {
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

    scope.edit = () => {
      // finds and focuses on the text input field
      // a brief timeout is necessary before trying to focus
      $timeout(() => { elem.find('input')[0].focus(); }, 50);
      scope.status.edit = 1;
    };

    scope.focus = () => {
      scope.status.edit = 1;
    };

    scope.validate = () =>
      scope.validator ? scope.validator(scope.form.newValue) : true;

    scope.save = () => {
      if (!scope.validate()) return;
      scope.status.saving = true;

      let success = () => {
        scope.ngModel = scope.form.newValue;
        if (!attrs.custom) scope.bcAsyncForm.$setPristine();

        scope.$root.$safeApply(scope);

        // Fixes issue: hit enter after changing PBKDF2 iterations
        // when 2nd password is enabled
        scope.$evalAsync(() => {
          scope.status.saving = false;
          if (!attrs.editing) scope.status.edit = false;
        });
        scope.$root.$safeApply(scope);
      };

      let error = () => {
        scope.status.saving = false;
        scope.$root.$safeApply(scope);
      };

      scope.onSave(scope.form.newValue, success, error);
    };

    scope.cancel = () => {
      if (!attrs.editing) scope.status.edit = false;
      scope.bcAsyncForm.input.$rollbackViewValue();
      scope.form.newValue = scope.ngModel;
      scope.bcAsyncForm.$setPristine();
      scope.onCancel && scope.onCancel();
    };

    transclude(scope, (clone, scope) => {
      if (attrs.custom) elem.empty().append(clone);
    });
  }
}
