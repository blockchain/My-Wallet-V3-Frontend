describe "cta", () ->
  Wallet = undefined
  $injector = undefined
  $cookies = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject (_$injector_) ->
      $injector = _$injector_
      Wallet = $injector.get("Wallet")
      $cookies = $injector.get("$cookies")

      Wallet.total = () -> 0
      Wallet.status = {}
      Wallet.settings = {}
      Wallet.user = {}

  getService = (cookies = {}) ->
    spyOn($cookies, "put").and.callThrough()
    spyOn($cookies, "get").and.returnValue(cookies.buyCta)
    spyOn($cookies, "putObject").and.callThrough()
    spyOn($cookies, "getObject").and.returnValue(cookies.securityWarning)
    return $injector.get("cta")

  describe ".shouldShowBuyCta()", ->
    it "should not show if the user has seen it", ->
      cta = getService(buyCta: "true")
      expect(cta.shouldShowBuyCta()).toEqual(false)

    it "should show if the user has not seen it", ->
      cta = getService(buyCta: "false")
      expect(cta.shouldShowBuyCta()).toEqual(true)

  describe ".setBuyCtaDissmissed()", ->
    it "should set the buy-alert-seen cookie", ->
      cta = getService(buyCta: "")
      cta.setBuyCtaDissmissed()
      expect($cookies.put).toHaveBeenCalledWith("buy-alert-seen", true)

    it "should reset the cookie jar", ->
      cta = getService(buyCta: "")
      expect(cta.shouldShowBuyCta()).toEqual(true)
      $cookies.get.and.returnValue("true")
      cta.setBuyCtaDissmissed()
      expect(cta.shouldShowBuyCta()).toEqual(false)

  describe ".shouldShowSecurityWarning()", ->
    cta = undefined
    beforeEach ->
      cta = getService(securityWarning: { when: 1000 })
      spyOn(Date, "now").and.returnValue(1001)
      spyOn(Wallet, "total").and.returnValue(1)
      Wallet.status.didConfirmRecoveryPhrase = false
      Wallet.status.needs2FA = false
      Wallet.user.isEmailVerified = false

    it "should show when no conditions are met", ->
      expect(cta.shouldShowSecurityWarning()).toBe(true)

    it "should not show when all conditions are met", ->
      Wallet.status.didConfirmRecoveryPhrase = true
      Wallet.status.needs2FA = true
      expect(cta.shouldShowSecurityWarning()).toBe(true)

    it "should not show when it is not time", ->
      Date.now.and.returnValue(999)
      expect(cta.shouldShowSecurityWarning()).toBe(false)

    it "should not show when balance is 0", ->
      Wallet.total.and.returnValue(0)
      expect(cta.shouldShowSecurityWarning()).toBe(false)

    it "should show when recovery phrase is not backed up", ->
      Wallet.status.didConfirmRecoveryPhrase = false
      Wallet.status.needs2FA = true
      Wallet.user.isEmailVerified = true
      expect(cta.shouldShowSecurityWarning()).toBe(true)

    it "should show when email is not verified or 2FA is not on", ->
      Wallet.status.didConfirmRecoveryPhrase = true
      Wallet.status.needs2FA = false
      Wallet.user.isEmailVerified = false
      expect(cta.shouldShowSecurityWarning()).toBe(true)

  describe ".setSecurityWarningDismissed()", ->
    beforeEach ->
      spyOn(Date, "now").and.returnValue(1001)

    it "should set the contextual-message cookie", ->
      cta = getService(securityWarning: { when: 1000, index: 0 })
      cta.setSecurityWarningDismissed()
      expect($cookies.putObject).toHaveBeenCalledWith("contextual-message", { index: 1, when: 604801001 })

  describe ".getSecurityWarningMessage()", ->
    it "should get the correct message for message index 0", ->
      cta = getService(securityWarning: { when: 1000, index: 0 })
      message = cta.getSecurityWarningMessage()
      expect(message).toEqual("SECURE_WALLET_MSG_1")

    it "should get the correct message for message index 1", ->
      cta = getService(securityWarning: { when: 1000, index: 1 })
      message = cta.getSecurityWarningMessage()
      expect(message).toEqual("SECURE_WALLET_MSG_2")
