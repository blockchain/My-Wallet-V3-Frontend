describe "Did You Know directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  scope = undefined
  DidYouKnow = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    DidYouKnow = $injector.get("DidYouKnow")

    return
  )

  # describe "without link", ->

  #   beforeEach ->

  #     spyOn(DidYouKnow, "getRandom").and.returnValue {
  #       id: 1,
  #       title: 'DYK_RECOVERY_TITLE',
  #       type: 'FEATURE',
  #       text: 'DYK_RECOVERY',
  #       icon: 'ti-lock',
  #     }

  #     element = $compile("<did-you-know></did-you-know>")($rootScope)


  #     $rootScope.$digest()
  #     scope.$apply()

  #   it "should render something", ->
  #     expect(element.html()).not.toEqual("")

  #   it "should get a random DIY", ->
  #     expect(DidYouKnow.getRandom).toHaveBeenCalled()

  #   it "should not render a link", ->
  #     expect(element.html()).not.toContain("<a")

  describe "with link", ->
    beforeEach ->

      # spyOn(DidYouKnow, "getRandom").and.returnValue {
      #   id: 1,
      #   title: 'DYK_RECOVERY_TITLE',
      #   type: 'FEATURE',
      #   text: 'DYK_RECOVERY',
      #   icon: 'ti-lock',
      #   linkText: 'SECURITY',
      #   state: 'wallet.common.settings.security'
      # }
      spyOn(DidYouKnow, "getRandom").and.returnValue {
        id: 5,
        title: 'SEND_FEEDBACK',
        type: 'SURVEY',
        text: 'DYK_FEEDBACK_VALUE',
        icon: 'ti-announcement',
        linkText: 'SHARE_FEEDBACK',
        external: true,
        state: 'https://blockchain.co1.qualtrics.com/SE/?SID=SV_0PMH4ruxU5krOmh'
      }

      element = $compile("<did-you-know></did-you-know>")($rootScope)
      $rootScope.$digest()
      scope.$apply()

    it "should render a link", ->
      expect(element.html()).toContain("<a")
