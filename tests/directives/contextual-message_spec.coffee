describe "Contextual message directive", ->
  $compile = undefined
  element = undefined
  scope = undefined
  Wallet = undefined
  $cookies = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    $cookies = $injector.get("$cookies")
    Wallet = $injector.get("Wallet")
    SecurityCenter = $injector.get("SecurityCenter")
    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet = {
      balanceSpendableActiveLegacy: 100000000
      keys: [{ archived: false }, { archived: true }]
      hdwallet: {
        accounts: [{ archived: false }, { archived: false }, { archived: true }]
      }
    }
    return
  )

  beforeEach ->
    spyOn($cookies, "getObject").and.returnValue({ when: 1000 })
    spyOn(Wallet, "total").and.returnValue(1)
    spyOn(Date, "now").and.returnValue(1001)
    Wallet.status.didConfirmRecoveryPhrase = false
    Wallet.status.needs2FA = false
    Wallet.user.isEmailVerified = false

    element = $compile("<div style='height: 100px;'><contextual-message></contextual-message></div>")(scope)
    scope.$apply()

  it "has a 2 preset messages", ->
    expect(scope.presets.length).toEqual(2)

  it "originally does not reveal a msg", ->
    expect(scope.reveal).toBe(false)

  it "should be able to reveal the message", ->
    spyOn(scope, "revealMsg").and.callThrough()
    scope.revealMsg()
    expect(scope.reveal).toBe(true)

  it "should show when no conditions are met", ->
    expect(scope.shouldShow()).toBe(true)

  it "should not show when all conditions are met", ->
    Wallet.status.didConfirmRecoveryPhrase = true
    Wallet.status.needs2FA = true
    expect(scope.shouldShow()).toBe(true)

  it "should not show when it is not time", ->
    Date.now.and.returnValue(999)
    expect(scope.shouldShow()).toBe(false)

  it "should not show when balance is 0", ->
    Wallet.total.and.returnValue(0)
    expect(scope.shouldShow()).toBe(false)

  it "should show when recovery phrase is not backed up", ->
    Wallet.status.didConfirmRecoveryPhrase = false
    Wallet.status.needs2FA = true
    Wallet.user.isEmailVerified = true
    expect(scope.shouldShow()).toBe(true)

  it "should show when email is not verified or 2FA is not on", ->
    Wallet.status.didConfirmRecoveryPhrase = true
    Wallet.status.needs2FA = false
    Wallet.user.isEmailVerified = false
    expect(scope.shouldShow()).toBe(true)
