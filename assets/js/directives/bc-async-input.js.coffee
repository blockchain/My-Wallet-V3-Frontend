angular.module('walletApp').directive('bcAsyncInput', ($timeout, Wallet) ->
  {
    restrict: "E"
    replace: true
    require: 'ngModel'
    scope: {
      ngModel: '='
      validator: '='
      onSave: '='
      onCancel: '='
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


      if attrs.editing?
        scope.status.edit = true

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
          scope.ngModel = scope.form.newValue # Otherwise cancel will undo this
          unless attrs.custom?
            scope.bcAsyncForm.$setPristine()

          scope.$root.$safeApply(scope)
          Wallet.saveActivity(2)

          # Fixes issue: hit enter after changing PBKDF2 iterations when 2nd
          # password is enabled.
          scope.$evalAsync(()->
            scope.status.saving = false
            unless attrs.editing?
              scope.status.edit = false
          )

        error = () ->
          scope.status.saving = false
          scope.$root.$safeApply(scope)

        scope.onSave(scope.form.newValue, success, error)
        return

      scope.cancel = () ->
        unless attrs.editing?
          scope.status.edit = false
        scope.bcAsyncForm.input.$rollbackViewValue()
        scope.form.newValue = scope.ngModel
        scope.bcAsyncForm.$setPristine()
        scope.onCancel() if scope.onCancel?
        return

      transclude(scope, (clone, scope) ->
        if attrs.custom?
          elem.empty().append(clone)
      )

  }
)
