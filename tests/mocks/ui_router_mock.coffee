angular.module("ui.router", ["ng"]).run [
  "$state"
  ($state) ->
    return
]

angular.module("ui.router").provider "$state", ->
    
  $get: () ->
    $state = {current: "somewhere"}
              
    $state.go = (destination) -> 
      return
    
    return $state
    
angular.module("ui.router").provider "$stateParams", ->
    
  $get: () ->
    $stateParams = {}
    
    return $stateParams 