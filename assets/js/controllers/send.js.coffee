@SendCtrl = ($scope, $log, Wallet, $modalInstance, ngAudio, $timeout, $stateParams) ->
  
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
    
  $scope.processURLfromQR = (url) ->
    paymentRequest = Wallet.parsePaymentRequest(url)
    if paymentRequest.isValid
      $scope.transaction.to = paymentRequest.address
      $scope.transaction.amount = paymentRequest.amount if paymentRequest.amount
      $scope.transaction.currency = paymentRequest.currency if paymentRequest.currency

      $scope.qrStream.stop()
      $scope.cameraOn = false
    else
      $scope.alerts.push {msg: "Not a bitcoin QR code."}
      $log.error "Not a bitcoin QR code:" + url
      
      $timeout((->
        $scope.lookForQR()
      ), 250)
   
  qrcode.callback = $scope.processURLfromQR
  
    
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
      if $stateParams.accountIndex == undefined || $stateParams.accountIndex == null || $stateParams.accountIndex == ""
        $scope.transaction.from = $scope.accounts[0]
      else 
        $scope.transaction.from = $scope.accounts[parseInt($stateParams.accountIndex)]
  
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
  
