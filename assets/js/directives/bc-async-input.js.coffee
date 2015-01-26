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
    }
    templateUrl: 'templates/bc-async-input.jade'
    link: (scope, elem, attrs, ngModel) ->
      scope.status = 
        edit: false
        saving: false
        
      scope.form = 
        newValue: scope.ngModel
        
      scope.edit = () ->
        scope.status.edit = 1
        
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






