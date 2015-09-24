describe "SettingsCtrl", ->
  scope = undefined
  
  
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
            
      scope = $rootScope.$new()
            
      $controller "SettingsCtrl",
        $scope: scope,
        $stateParams: {}
      
      return

    return


    
    
