'use strict';

describe('languages', () => {
  beforeEach(angular.mock.module('walletApp'));

  it('should load the language codes', inject((languages) => {
    expect(languages.languages.length).toEqual(25);
  }));

  it('should sort languages from A to Z by name', inject((languages) => {
    let languagesAreSorted = true;
    languages.languages.map(l => l.name).reduce((name0, name1) => {
      languagesAreSorted = languagesAreSorted && name0 < name1;
      return name1;
    }, '');
    expect(languagesAreSorted).toEqual(true);
  }));

  it('should get the translation code', inject(($translate, languages) => {
    spyOn($translate, 'use').and.returnValue('nl');
    let code = languages.get();
    expect(code).toEqual('nl');
  }));

  it('should set the translation code', inject(($translate, languages) => {
    spyOn($translate, 'use');
    languages.set('de');
    expect($translate.use).toHaveBeenCalledWith('de');
  }));

  describe('parseFromPath', () => {
    let fixtures = {
      '/de/wallet': 'de',
      '/nl/wallet/#/': 'nl',
      '/en/wallet/#/login': 'en'
    };

    Object.keys(fixtures).forEach(route => {
      it(`should parse ${route}`, inject((languages) => {
        let fixture = fixtures[route];
        let parsed = languages.parseFromUrl(route);
        expect(parsed).toEqual(fixture);
      }));
    });
  });
});
