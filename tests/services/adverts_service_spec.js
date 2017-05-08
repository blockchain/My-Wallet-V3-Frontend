describe('AdvertsServices', () => {
  let Adverts;
  let rootScope;
  let sampleAds = '[{"data":"data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN\/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz\/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH\/w\/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA\/g88wAAKCRFRHgg\/P9eM4Ors7ONo62Dl8t6r8G\/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt\/qIl7gRoXgugdfeLZrIPQLUAoOnaV\/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl\/AV\/1s+X48\/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H\/LcL\/\/wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93\/+8\/\/UegJQCAZkmScQAAXkQkLlTKsz\/HCAAARKCBKrBBG\/TBGCzABhzBBdzBC\/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD\/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q\/pH5Z\/YkGWcNMw09DpFGgsV\/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY\/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4\/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L\/1U\/W36p\/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N\/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26\/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE\/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV\/MN8C3yLfLT8Nvnl+F30N\/I\/9k\/3r\/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt\/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi\/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a\/zYnKOZarnivN7cyzytuQN5zvn\/\/tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO\/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3\/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA\/0HIw6217nU1R3SPVRSj9Yr60cOxx++\/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3\/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX\/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8\/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb\/1tWeOT3dvfN6b\/fF9\/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR\/cGhYPP\/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF\/6i\/suuFxYvfvjV69fO0ZjRoZfyl5O\/bXyl\/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o\/2j5sfVT0Kf7kxmTk\/8EA5jz\/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5\/wAAgOkAAHUwAADqYAAAOpgAABdvkl\/FRgAAAPdJREFUeNqc0j8rBlAcxfE7KDGiDBZKksFMSSwmi4VFTMoqUUpiUCzegWzKn5JMDBZ5ARJFUmxSBjF\/LOeppycSp+7wPefeM\/zur6DUnDr0YR5b2MA0Or+5W2qNXhz5Xq\/YRMNPBRN487su0F5bMORvOkdjpaAJt\/6uhUrBpP\/pCS0FB\/6v0YKbwA76cRZ+zmzmqx4sYxiP4aWCh8BIBjobPg434CNec7zt8FrBXWAs4Vz4JNyC93gd8XbCKwX3gfGEi+HTcCs+43XF2w2vFrwEphKuVC1MQVvVDHriHYbXS3b9Et0JB3GFmXA99rBfWZ58\/TUGvgYAVx\/rST0ljjAAAAAASUVORK5CYII=", "id": 1, "url":"https:\/\/blockchain.info\/r?url=https%3A%2F%2Fwww.kraken.com%2F&aid=3587","name":"Kraken Deposit"}]';
  let sampleBadAds = '[{"data":"data:image\/png;base64,sfdsfsd", "id": "javascript:onhover(alert)", "name":"Kraken Deposit"}, {"data":"data:image\/png;base64,sfdsfsd", "id": 2, "name":"javascript:onhover(alert)"}, {"data":"javascript:alert()", "id": 4, "name":"Kraken Deposit"}]';

  let $httpBackend;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, _$rootScope_) {

      $httpBackend = $injector.get('$httpBackend');

      Adverts = $injector.get('Adverts');
      rootScope = _$rootScope_;

    });

  });

  describe('fetch()', () => {
    beforeEach(function () {
      rootScope.apiDomain = "https://api.blockchain.info/";
      $httpBackend.expectGET('https://api.blockchain.info/bci-ads/get?wallet=true&n=2').respond(sampleAds);

      Adverts.fetch();

      return $httpBackend.flush();
    });

    it("should download the most recent adverts feed", () => expect(Adverts.ads.length).toBe(1));

    it("should get the ad title", () => expect(Adverts.ads[0].name).toBe("Kraken Deposit"));

    it("should get the ad URL", () => expect(Adverts.ads[0].url).toContain("http"));

    it("should get the image blob", () => expect(Adverts.ads[0].data).toContain("data:image"));

    it("should get the ad id", () => expect(Adverts.ads[0].id).toBe(1));
  });

  describe('bad ads fetch()', () => {
    beforeEach(function () {
      rootScope.apiDomain = "https://api.blockchain.info/";
      $httpBackend.expectGET('https://api.blockchain.info/bci-ads/get?wallet=true&n=2').respond(sampleBadAds);

      Adverts.fetch();

      return $httpBackend.flush();
    });

    it("should not keep bad ads", () => expect(Adverts.ads.length).toBe(0));
  });

  describe('bad api domain fetch()', () => {
    beforeEach(function () {
      rootScope.apiDomain = "https://api.blockchain.info.attacker.com/";

      return Adverts.fetch();
    });

    it("should not keep bad ads", () => expect(Adverts.ads.length).toBe(0));
  });

  describe("fetchOnce()", () =>
    it('should call fetch() only once', () => {
      spyOn(Adverts, 'fetch');
      Adverts.fetchOnce();
      expect(Adverts.fetch).toHaveBeenCalled();
      Adverts.fetchOnce();
      expect(Adverts.fetch.calls.count()).toBe(1);
    })
  );

  return afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    return $httpBackend.verifyNoOutstandingRequest();
  });
});
