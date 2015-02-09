angular.module("adverts", []).factory "Adverts", ($log, $rootScope, $http) -> 

  service = {
    ads: []
    didFetch: false
  }
  
  service.fetch = () ->
    $http.get("https://blockchain.info/adverts_feed?wallet_version=3").success (data) ->
      for button in data.partners.home_buttons
        service.ads.push button
          
  service.fetchOnce = () ->
    unless service.didFetch
      service.fetch()
      service.didFetch = true
      
  
  return service
  
  