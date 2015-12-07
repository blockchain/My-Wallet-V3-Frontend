'use strict';

describe('languages', () => {

  beforeEach(angular.mock.module('walletApp'));

  it('should load the language codes', inject((languages) => {
    expect(languages.length).toEqual(25);
  }));

  it('should sort languages from A to Z by name', inject((languages) => {
    let languagesAreSorted = true;
    languages.map(l => l.name).reduce((name0, name1) => {
      languagesAreSorted = languagesAreSorted && name0 < name1;
      return name1;
    }, '');
    expect(languagesAreSorted).toEqual(true);
  }));

});
