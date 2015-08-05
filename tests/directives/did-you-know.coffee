describe "Did You Know directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined

  beforeEach module("walletApp")
  beforeEach(module("templates/did-you-know.jade"))

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()

    DidYouKnow = $injector.get("DidYouKnow")
    DidYouKnow.dyks = [
      {
        title: 'You can send Custom Fees?'
        type: 'Feature'
        text: 'When the bitcoin network is experiencing a lot of traffic, you can ensure that your transactions go through by enabling higher fees with our Advanced Send feature. Just click on the Advanced Send toggle in our Send screen to get started!'
        icon: 'ti-signal'
        linkText: ''
        link: ''
      },
      {
        title: 'Passwords are not stored or shared with us?'
        type: 'Feature'
        text: 'This means only you know the password you used for your wallet, but your funds can still be recovered with the 12-word recovery phrase. Find out how and more by visiting our'
        icon: 'ti-lock'
        linkText: 'Security Center'
        link: '/#/security-center'
      }
    ]

    return
  )

  beforeEach ->
    element = $compile("<div><did-you-know></did-you-know></div>")($rootScope)
    $rootScope.$digest()
    scope.$apply()

  it "can randomize", -> 
    pending()

  it "fetches a random Did You Know", -> 
    pending()


