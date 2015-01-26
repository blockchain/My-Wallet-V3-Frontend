walletApp.directive('bcAsyncInput', ($compile) ->
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
    }
    templateUrl: 'templates/bc-async-input.jade'
    link: (scope, elem, attrs, ngModel) ->
      scope.status = 
        edit: false
        saving: false
        
      scope.form = 
        newValue: scope.ngModel
        
      if scope.type?
        scope.type = "text"
      # else
      #   $compile(elem, scope)
        
      scope.edit = () ->
        scope.status.edit = 1
        
      scope.validate = () ->
        if scope.form.newValue?
          if scope.validator?
            scope.validator(scope.form.newValue)
          else
            !scope.form.$error
        
      scope.save = () ->
        unless scope.status.saving # This gets called twice
          scope.status.saving = true
    
          success = () ->
            scope.status.saving = false
            scope.status.edit = false
      
          error = () ->
            scope.status.saving = false
      
          scope.onSave(scope.form.newValue, success, error)
          
  }
)