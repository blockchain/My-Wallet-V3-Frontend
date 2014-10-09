@SendCtrl = ($scope, $log, Wallet, $modalInstance, ngAudio, $timeout) ->
  
  $scope.alerts = []
  
  $scope.currencies = {isOpen: false}
  
  $scope.transaction = {from: null, to: "", amount: 0.0, currency: "BTC", privacyGuard: false, advanced: false}
  
  $scope.addressBook = Wallet.addressBook
  $scope.accounts = Wallet.accounts
  
  # QR Code scan. Uses js from this fork:
  # https://github.com/peekabustudios/webcam-directive/blob/master/app/scripts/webcam.js
  $scope.onError = (error) -> # Never called
    $log.error "Permission denied"
    $scope.alerts.push {type: "danger", msg: "Permission to use camera denied"}
    
  # QR code recoginized, is it a payment request?
  qrcode.callback = (result) ->
    if result.indexOf("bitcoin://") == 0
      withoutPrefix = result.replace("bitcoin://","")
      if withoutPrefix.indexOf("?") != -1
        address = withoutPrefix.substr(0, withoutPrefix.indexOf("?"))
        $scope.transaction.to = address
        argumentList = withoutPrefix.replace(address + "?", "")
        loopCount = 0 
        
        for i in [1..argumentList.match(/&/g | []).length]
          argument = argumentList.substr(0,argumentList.indexOf("="))
          isLastArgument = argumentList.indexOf("&") == -1
          
          value = undefined
          
          if !isLastArgument
            value = argumentList.substr(argument.length + 1, argumentList.indexOf("&") - argument.length - 1)
          else
            value = argumentList.substr(argument.length + 1, argumentList.length - argument.length - 1)
                    
          if argument == "amount"
            $scope.transaction.amount = value
            $scope.transaction.currency = "BTC"
          else
            $log.info "Ignoring argument " + argument + " in: " + result
            loopCount++
            
            
          argumentList = argumentList.replace(argument + "=" + value, "")

      else
        $scope.transaction.to = withoutPrefix
        
      $scope.qrStream.stop()
      $scope.cameraOn = false
    else 
      $log.error "Not a bitcoin QR code:" + result
      $timeout((->
        $scope.lookForQR()
      ), 250)
    
  $scope.cameraOff = () ->
    $scope.qrStream.stop()
    $scope.cameraOn = false
    
  $scope.onStream = (stream) -> # I removed the second argument in webcam.js!
    # Evil (TODO: use a directive to manipulate the DOM):
    canvas = document.getElementById("qr-canvas")
    $scope.qrStream = stream
        
    $scope.lookForQR()
    $scope.cameraOn = true
    
  $scope.lookForQR = () ->    
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
        $scope.lookForQR()
      ), 250)
      
  
  $scope.close = () ->
    $modalInstance.dismiss ""
  
  $scope.send = () ->
    for alert in $scope.alerts
      $scope.alerts.pop(alert)

    Wallet.send($scope.accounts.indexOf($scope.transaction.from), $scope.transaction.to, $scope.transaction.amount, $scope.transaction.currency, $scope.observer)
  
  $scope.closeAlert = (index) ->
    $scope.alerts.splice index, 1
    return
    
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "accounts", () ->
    if $scope.transaction.from == null && $scope.accounts.length > 0
      $scope.transaction.from = $scope.accounts[0]
  
  $scope.$watchCollection "[transaction.to, transaction.from.address]", () ->
    $scope.transactionIsValid = $scope.validate($scope.transaction)
    
  $scope.validate = (transaction) ->
    return false if transaction.to == null
    return false if transaction.to == undefined
    return false if transaction.to == ""
    return false if transaction.currency != 'BTC'
    
    return true
  
  $scope.observer = {}
  $scope.observer.transactionDidFailWithError = (message) ->
    $scope.alerts.push {type: "danger", msg: message}
  $scope.observer.transactionDidFinish = () ->
    sound = ngAudio.load("beep.wav")
    sound.play()
    $modalInstance.close ""
  
