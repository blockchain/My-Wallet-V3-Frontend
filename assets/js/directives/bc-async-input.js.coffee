walletApp.directive('bcAsyncInput', () ->
  {
    restrict: "E"
    replace: 'true'
    require: 'ngModel'
    scope: {
      ngModel: '='
      validator: '='
      onSave: '='
      actionTitle: '='
      type: '@'
      errorMessage: '='
    }
    templateUrl: 'templates/bc-async-input.jade'
    link: (scope, elem, attrs, ngModel) ->
      scope.status = 
        edit: false
        saving: false
        
      scope.form = 
        newValue: scope.ngModel
        
      if attrs.inline?
        scope.inline = true
        
      if scope.type?
        scope.type = "text"
        
      scope.edit = () ->
        scope.status.edit = 1
        
      scope.focus = () ->
        scope.status.edit = 1
        
      scope.validate = () ->
        if scope.form.newValue?
          if scope.validator?
            scope.validator(scope.form.newValue)
          else
            !scope.form.$error
        
      scope.save = () ->
        scope.status.saving = true
  
        success = () ->
          scope.status.saving = false
          scope.status.edit = false
    
        error = () ->
          scope.status.saving = false
    
        scope.onSave(scope.form.newValue, success, error)
          
  }
)