angular.module('walletApp').directive('adverts', (Adverts, $window) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
    }
    templateUrl: 'templates/adverts.jade'
    link: (scope, elem, attrs) ->

      scope.ads = Adverts.ads

      Adverts.fetchOnce()

      # scope.$watchCollection "ads", (newValue) ->
      #   console.log newValue

      scope.visit = (ad) ->
        $window.open(ad.link, "_blank")
        return

  }
)
