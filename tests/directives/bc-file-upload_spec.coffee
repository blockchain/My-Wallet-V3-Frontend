describe "BC File Upload Directive", ->
  scope = undefined
  isoScope = undefined

  beforeEach module("walletApp")

  beforeEach ->
    inject ($rootScope, $compile, $injector) ->
      scope = $rootScope.$new()

      scope.state =
        webcam: {}

      scope.webcam =
        video: {}

      scope.onUpload = () ->

      template = '<bc-file-upload state="state" on-upload="onUpload"></bc-file-upload>'
      element = $compile(template)(scope)
      scope.$digest()

      isoScope = element.isolateScope()
      isoScope.$digest()

  describe "enableWebcam()", ->

    it "should start streaming the webcam", ->
      isoScope.enableWebcam()
      expect(isoScope.state.webcam.streaming).toBe(true)

  describe "disableWebcam()", ->

    it "should stop the webcam from streaming", ->
      isoScope.disableWebcam()
      expect(isoScope.state.webcam.streaming).toBe(undefined)

  describe "upload()", ->

    it "should toggle the webcam", ->
      spyOn(isoScope, 'enableWebcam')
      spyOn(isoScope, 'disableWebcam')
      isoScope.upload()
      expect(isoScope.enableWebcam).toHaveBeenCalled()
      expect(isoScope.disableWebcam).toHaveBeenCalled()

    it "should call onUpload()", ->
      spyOn(isoScope, 'onUpload')
      isoScope.upload()
      expect(isoScope.onUpload).toHaveBeenCalled()

  describe "webcamError()", ->

    it "should disable the cam", ->
      spyOn(isoScope, 'disableWebcam')
      isoScope.webcamError()
      expect(isoScope.disableWebcam).toHaveBeenCalled()
