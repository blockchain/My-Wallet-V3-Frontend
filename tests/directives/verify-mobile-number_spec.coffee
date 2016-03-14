describe "Verify Mobile Number Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined

  beforeEach module("walletApp")
  
  beforeEach inject((_$compile_, _$rootScope_, $injector) ->

    $compile = _$compile_
    $rootScope = _$rootScope_
    Wallet = $injector.get('Wallet')

    Wallet.verifyMobile = (code, success, error) ->
      if code
        success()
      else
        error('error')

    Wallet.changeMobile = (mobile, success, error) ->
      if mobile
        success()
      else
        error('error')      

    return
  )

  beforeEach ->
    element = $compile("<verify-mobile-number button-lg full-width></verify-mobile-number>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    isoScope.onSuccess = () -> true

  it "should have text", ->
    expect(element.html()).toContain "VERIFY"

  describe "verifyMobile", ->

    it "can be verified", ->
      spyOn(isoScope, "onSuccess")
      isoScope.verifyMobile("31 1 2345")
      expect(isoScope.onSuccess).toHaveBeenCalled()

    it "can not be verified if no code is passed", ->
      isoScope.verifyMobile()
      expect(isoScope.errors.verify).toBe('error')

  describe "retrySendCode", ->

    it "should get an error if retry fails", ->
      isoScope.retrySendCode()
      expect(isoScope.errors.retryFail).toBeDefined()

    it "should call successful retry to send", ->
      error = () ->
      Wallet.user.mobile = '639'
      spyOn(isoScope, "onSuccess")
      isoScope.retrySendCode()
      expect(isoScope.errors.retryFail).toBe(null)

