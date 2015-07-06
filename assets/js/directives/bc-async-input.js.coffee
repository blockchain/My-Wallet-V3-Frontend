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
      type: '@'
      errorMessage: '='
      buttonClass: '@'
    }
    transclude: true
    templateUrl: (elem, attrs) ->
      if !attrs.custom?
        return 'templates/bc-async-input.jade'
      else
        return 'templates/transclude.jade'
    link: (scope, elem, attrs, ctrl, transclude) ->
      scope.isRequired = attrs.isRequired?

      scope.user = Wallet.user
      scope.status =
        edit: false
        saving: false

      scope.form =
        newValue: scope.ngModel

      if attrs.inline?
        scope.inline = true

      unless scope.type?
        scope.type = "text"

      unless scope.buttonClass?
        scope.buttonClass = 'button-primary btn-small'

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

      scope.noChange = () ->
        return false if scope.form.newValue == ''
        return scope.form.newValue == ctrl.$viewValue.toString()

      scope.save = () ->
        scope.status.saving = true

        success = () ->
          unless attrs.custom?
            scope.bcAsyncForm.$setPristine()
          scope.status.saving = false
          scope.status.edit = false

        error = () ->
          scope.status.saving = false

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
