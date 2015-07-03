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
      ngRequired: '@'
      errorMessage: '='
    }
    transclude: true
    templateUrl: (elem, attrs) ->
      if !attrs.custom?
        return 'templates/bc-async-input.jade'
      else
        return 'templates/transclude.jade'
    link: (scope, elem, attrs, ctrl, transclude) ->
      scope.securityCenter = attrs.securityCenter?

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

      scope.edit = () ->
        # finds and focuses on the text input field
        # a brief timeout is necessary before trying to focus
        $timeout (-> elem.find('input').focus()), 50
        scope.status.edit = 1

      scope.focus = () ->
        scope.status.edit = 1

      scope.validate = () ->
        val = scope.form.newValue
        return true unless scope.validator?
        return scope.validator(val)
        
      # Additional constraints (view already checks if the form is changed and valid)
      scope.disableSubmit = () ->
        val = scope.form.newValue
        return true if scope.bcAsyncForm.$invalid
        return true if scope.bcAsyncForm.$pristine
        return true if val == ctrl.$viewValue.toString() # Not the same as $pristine
        return true if scope.ngRequired && val == ""
        return false

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
