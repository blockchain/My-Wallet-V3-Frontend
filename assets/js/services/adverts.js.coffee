angular.module("adverts", []).factory "Adverts", ($log, $rootScope, $http) -> 

  service = {
    ads: []
    didFetch: false
  }
  
  service.fetch = () ->
    $http.get("https://blockchain.info/adverts_feed?wallet_version=3").success (data) ->
      adverts = data.partners.home_buttons.splice(0)
      # Pick two random ads from the response to display:
      service.ads.push(adverts.splice(Math.floor(Math.random() * adverts.length), 1)[0])
      service.ads.push(adverts.splice(Math.floor(Math.random() * adverts.length), 1)[0])
          
  service.fetchOnce = () ->
    unless service.didFetch
      service.fetch()
      service.didFetch = true
      
  
  return service
  
  