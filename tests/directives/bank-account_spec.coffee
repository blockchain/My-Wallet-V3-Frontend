describe "bankAccount", ->
  scope = undefined
  element = undefined
  isoScope = undefined
  MyWallet = undefined

  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, $injector) ->
    scope = $rootScope.$new()
    scope.transaction = {
      step: 'pending',
      bankAccount: {
        'holderName': 'phil'
        'holderAddress': {
          'street': '123',
          'zipcode': '10012',
          'city': 'New York',
          'country': 'USA!'
        },
        'bankName': 'phil'
        'bankAddress': {
          'street': '123',
          'zipcode': '10012',
          'city': 'New York',
          'country': 'USA!'
        }
      }
    }

    MyWallet = $injector.get("MyWallet")

    MyWallet.wallet = {
      isUpgradedToHD: true
      hdwallet: {
        defaultAccountIndex: 0
        accounts: [{ index: 0, archived: false }]
      }
    }

    element = $compile("<bank-account transaction='transaction'></bank-account>")(scope)
    scope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  it "should format a bank account", ->
    expect(isoScope.formattedBankAccount).toBeDefined()
