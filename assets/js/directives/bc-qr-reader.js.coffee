# QR Code scan. Uses js from this fork:
# https://github.com/peekabustudios/webcam-directive/blob/master/app/scripts/webcam.js

walletApp.directive('bcQrReader', ($timeout) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      onResult: '='
      onError: '='
      active: '='
      cameraStatus: '='
    }
    templateUrl: 'templates/bc-qr-reader.jade'
    link: (scope, elem, attrs) ->
      scope.onStream = (stream) -> # I removed the second argument in webcam.js!
        # Evil (TODO: use a directive to manipulate the DOM):
        canvas = document.getElementById("qr-canvas")
        scope.qrStream = stream
        
        scope.lookForQR()
        scope.cameraStatus = true
    
      scope.lookForQR = () ->    
        try 
          canvas = document.getElementById("qr-canvas")
          video = document.getElementsByTagName("video")[0]
      
          if video.videoWidth > 0
            # This won't be set at the first iteration.
            canvas.width =  video.videoWidth
            canvas.height = video.videoHeight
           
            canvas.getContext("2d").drawImage(video,0,0)
      
          qrcode.decode()
        catch e
          # $log.error e
          $timeout((->
            scope.lookForQR()
          ), 250)
  }
)