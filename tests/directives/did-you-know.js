describe('Did You Know directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let scope;
  let DidYouKnow;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    DidYouKnow = $injector.get('DidYouKnow');

  })
  );

  // describe "without link", ->

  //   beforeEach ->

  //     spyOn(DidYouKnow, 'getRandom').and.returnValue {
  //       id: 1,
  //       title: 'DYK_RECOVERY_TITLE',
  //       type: 'FEATURE',
  //       text: 'DYK_RECOVERY',
  //       icon: 'ti-lock',
  //     }

  //     element = $compile("<did-you-know></did-you-know>")($rootScope)


  //     $rootScope.$digest()
  //     scope.$apply()

  //   it "should render something", ->
  //     expect(element.html()).not.toEqual("")

  //   it "should get a random DIY", ->
  //     expect(DidYouKnow.getRandom).toHaveBeenCalled()

  //   it "should not render a link", ->
  //     expect(element.html()).not.toContain("<a")

  describe('with link', () => {
    beforeEach(function () {

      // spyOn(DidYouKnow, 'getRandom').and.returnValue {
      //   id: 1,
      //   title: 'DYK_RECOVERY_TITLE',
      //   type: 'FEATURE',
      //   text: 'DYK_RECOVERY',
      //   icon: 'ti-lock',
      //   linkText: 'SECURITY',
      //   state: 'wallet.common.settings.security'
      // }
      spyOn(DidYouKnow, 'getRandom').and.returnValue({
        id: 5,
        title: 'SEND_FEEDBACK',
        type: 'SURVEY',
        text: 'DYK_FEEDBACK_VALUE',
        icon: 'ti-announcement',
        linkText: 'SHARE_FEEDBACK',
        external: true,
        state: 'https://blockchain.co1.qualtrics.com/SE/?SID=SV_0PMH4ruxU5krOmh'
      });

      element = $compile("<did-you-know></did-you-know>")($rootScope);
      $rootScope.$digest();
      return scope.$apply();
    });

    it('should render a link', () => expect(element.html()).toContain("<a"));
  });
});
