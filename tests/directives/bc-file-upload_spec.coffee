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

  describe "reset", ->
    
    it "should reset file, invalidFile, and call disableWebcam", ->
      spyOn(isoScope, 'disableWebcam')
      isoScope.reset()
      expect(isoScope.file).toBe(null)
      expect(isoScope.invalidFile).toBe(null)
      expect(isoScope.disableWebcam).toHaveBeenCalled()

  describe "enableWebcam()", ->

    it "should activate the webcam", ->
      isoScope.enableWebcam()
      expect(isoScope.state.webcam.active).toBe(true)

  describe "disableWebcam()", ->

    it "should deactivate the webcam", ->
      isoScope.disableWebcam()
      expect(isoScope.state.webcam.active).toBe(undefined)

  describe "upload()", ->

    it "should toggle the webcam", ->
      spyOn(isoScope, 'disableWebcam')
      isoScope.upload()
      expect(isoScope.disableWebcam).toHaveBeenCalled()

    it "should call onUpload()", ->
      spyOn(isoScope, 'onUpload')
      isoScope.upload()
      expect(isoScope.onUpload).toHaveBeenCalled()

  describe "webcamError()", ->

    it "should set the webcam error state", ->
      isoScope.webcamError()
      expect(isoScope.state.webcam.error).toBe(true)
