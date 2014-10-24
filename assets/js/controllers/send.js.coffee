@SendCtrl = ($scope, $log, Wallet, $modalInstance, ngAudio, $timeout, $stateParams, $translate) ->
  
  $scope.advanced = false
  $scope.privacyGuard = false
  
  $scope.alerts = Wallet.alerts
  
  $scope.currencies = {isOpen: false}
  
  $scope.transaction = {from: null, to: "", amount: "0", currency: "BTC", privacyGuard: false, advanced: false}
  
  $scope.addressBook = Wallet.addressBook
  $scope.accounts = Wallet.accounts
  
  $translate("SEND_TO_PLACEHOLDER").then (translation) ->
    $scope.toPlaceholder = translation
  
  # QR Code scan. Uses js from this fork:
  # https://github.com/peekabustudios/webcam-directive/blob/master/app/scripts/webcam.js
  $scope.onError = (error) -> 
    # This never gets called...
    $translate("CAMERA_PERMISSION_DENIED").then (translation) ->
      Wallet.displayWarning(translation)
    
  $scope.processURLfromQR = (url) ->
    paymentRequest = Wallet.parsePaymentRequest(url)
    if paymentRequest.isValid
      $scope.transaction.to = paymentRequest.address
      $scope.transaction.amount = paymentRequest.amount if paymentRequest.amount
      $scope.transaction.currency = paymentRequest.currency if paymentRequest.currency

      $scope.cameraOff()
    else
      $translate("QR_CODE_NOT_BITCOIN").then (translation) ->
        Wallet.displayWarning(translation)

      $log.error "Not a bitcoin QR code:" + url
      
      $timeout((->
        $scope.lookForQR()
      ), 2000)
   
  qrcode.callback = $scope.processURLfromQR
  
  $scope.cameraOn = () ->
    $scope.cameraRequested = true
    
  $scope.cameraOff = () ->
    $scope.qrStream.stop()
    $scope.cameraIsOn = false
    $scope.cameraRequested = false
    
  $scope.onStream = (stream) -> # I removed the second argument in webcam.js!
    # Evil (TODO: use a directive to manipulate the DOM):
    canvas = document.getElementById("qr-canvas")
    $scope.qrStream = stream
        
    $scope.lookForQR()
    $scope.cameraIsOn = true
    
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
    Wallet.clearAlerts()
    $modalInstance.dismiss ""
  
  $scope.send = () ->
    Wallet.clearAlerts()

    Wallet.send($scope.accounts.indexOf($scope.transaction.from), $scope.transaction.to, numeral($scope.transaction.amount), $scope.transaction.currency, $scope.observer)
  
  $scope.closeAlert = (alert) ->
    Wallet.closeAlert(alert)
    
  #################################
  #           Private             #
  #################################
  
  $scope.$watchCollection "accounts", () ->
    if $scope.transaction.from == null && $scope.accounts.length > 0
      if $stateParams.accountIndex == undefined || $stateParams.accountIndex == null || $stateParams.accountIndex == ""
        $scope.transaction.from = $scope.accounts[0]
      else 
        $scope.transaction.from = $scope.accounts[parseInt($stateParams.accountIndex)]
  
  $scope.$watchCollection "[transaction.to, transaction.from.address, transaction.amount]", () ->
    $scope.transaction.fee = Wallet.recommendedTransactionFeeForAccount($scope.accounts.indexOf($scope.transaction.from), numeral($scope.transaction.amount).multiply(100000000)).divide(100000000)
    $scope.transactionIsValid = $scope.validate($scope.transaction)
    
    
  $scope.validate = (transaction) ->
    return false if transaction.to == null
    return false if transaction.to == undefined
    return false if transaction.to == ""
    return false unless Wallet.isValidAddress(transaction.to)
    return false if transaction.amount == undefined
    return false if transaction.amount == null
    return false if transaction.amount == ""
    return false if parseFloat(transaction.amount) > $scope.transaction.from.balance / 100000000
    return false if parseFloat(transaction.amount) == 0
    
    
    return false if transaction.currency != 'BTC'
    
    return true
  
  $scope.observer = {}
  $scope.observer.transactionDidFailWithError = (message) ->
    Wallet.displayError(message)
  $scope.observer.transactionDidFinish = () ->
    sound = ngAudio.load("beep.wav")
    sound.play()
    $modalInstance.close ""
  
