describe('didYouKnowServices', () => {
  let DIY;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {

    let translateMock = {
      instant(string) {
        return string;
      }
    };

    module(function ($provide) {
      $provide.value("$translate",translateMock);
    });

    return angular.mock.inject($injector => DIY = $injector.get('DidYouKnow'));
  });

  describe('initialization', () => {
    it('should provide localized titles', () => {
      expect(DIY.getAll().length).toBeGreaterThan(0);
      expect(DIY.getAll()[0].title).toEqual("DYK_CUSTOM_FEES_TITLE");
    });

    it('should have an id attached to it', () => expect(DIY.getAll()[3].id).toBeDefined());
  });

  describe('state', () =>
    it('should link to a state route, with text, or not', () =>
      Array.from(DIY.getAll()).map((diy) =>
        (diy.state != null) ?
          expect(diy.state).not.toEqual("")
        :
          expect(diy.linkText).not.toBeDefined())
    )
  );
});
