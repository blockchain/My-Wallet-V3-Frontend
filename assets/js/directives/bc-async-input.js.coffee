walletApp.directive('bcAsyncInput', ($timeout, Wallet) ->
  {
    restrict: "E"
    replace: true
    require: 'ngModel'
    scope: {
      ngModel: '='
      validator: '='
      onSave: '='
      onChange: '='
      actionTitle: '='
      placeholder: '='
      _type: '@type'
      errorMessage: '='
      _buttonClass: '@buttonClass'
      maxLength: '@'
      transform: '='
    }
    transclude: true
    templateUrl: (elem, attrs) ->
      if !attrs.custom?
        return 'templates/bc-async-input.jade'
      else
        return 'templates/transclude.jade'
    link: (scope, elem, attrs, ctrl, transclude) ->
      scope.isRequired = attrs.isRequired?
      scope.inline = attrs.inline?

      scope.type = scope._type || 'text'
      scope.buttonClass = scope._buttonClass || 'button-primary btn-small'

      scope.user = Wallet.user
      scope.status =
        edit: false
        saving: false

      scope.form =
        newValue: scope.ngModel

      scope.edit = () ->
        # finds and focuses on the text input field
        # a brief timeout is necessary before trying to focus
        $timeout (-> elem.find('input').focus()), 50
        scope.status.edit = 1

      scope.focus = () ->
        scope.status.edit = 1

      scope.validate = () ->
        return true unless scope.validator?
        return scope.validator(scope.form.newValue)

      scope.save = () ->
        scope.status.saving = true

        success = () ->
          unless attrs.custom?
            scope.bcAsyncForm.$setPristine()
          scope.status.saving = false
          scope.status.edit = false
          scope.$root.$safeApply(scope)
          Wallet.saveActivity(2)

        error = () ->
          scope.status.saving = false
          scope.$root.$safeApply(scope)

        scope.onSave(scope.form.newValue, success, error)

      scope.cancel = () ->
        scope.bcAsyncForm.$setPristine()
        scope.status.edit = false
        scope.form.newValue = scope.ngModel

      transclude(scope, (clone, scope) ->
        if attrs.custom?
          elem.empty().append(clone)
      )

  }
)
