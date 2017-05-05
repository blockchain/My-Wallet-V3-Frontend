describe "Address Book Entry Directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined
  MyWallet = undefined
  
  beforeEach module('walletDirectives')

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_) ->

    $compile = _$compile_
    $rootScope = _$rootScope_

    return
  )

  beforeEach ->
    element = $compile("<div address-book-entry></div>")($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

    isoScope.address = {}

    angular.mock.inject ($injector, $rootScope, $controller) ->
      Alerts = $injector.get("Alerts")
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")

      Alerts.confirm = () ->
        then: (f) -> f(true)

      MyWallet.wallet = {
        removeAddressBookEntry: () ->
          address = 'address'
          delete MyWallet.wallet.addressBook[address]

        addressBook: {"address": "Satoshi"}
      }

  it "has an element that is defined", ->
    expect(element).toBeDefined()

  it "can delete an address book entry", ->
    spyOn(Wallet, "removeAddressBookEntry").and.callThrough()

    isoScope.delete()
    expect(Wallet.removeAddressBookEntry).toHaveBeenCalled()
    expect(MyWallet.wallet.addressBook['address']).toBeUndefined()
