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
      onFocus: '=',
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
    scope.button = attrs.button || 'SAVE';

    scope.type = scope._type || 'text';
    scope.buttonClass = scope._buttonClass || 'button-primary button-sm';

    scope.user = Wallet.user;
    scope.status = {
      edit: false,
      saving: false
    };

    scope.edit = () => {
      // finds and focuses on the text input field
      // a brief timeout is necessary before trying to focus
      $timeout(() => { elem.find('input')[0].focus(); }, 50);
      scope.status.edit = 1;
    };

    if (attrs.editing != null) scope.status.edit = true;
    if (scope.status.edit) { scope.edit(); }

    scope.form = {
      newValue: scope.ngModel
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

        $timeout(() => {
          scope.status.saving = false;
          if (!attrs.editing) scope.status.edit = false;
        });
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
