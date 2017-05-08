describe('getByPropertyNestedFilter', () => {
  let $filter = null;

  beforeEach(function () {
    module('walletFilters');
    return inject(_$filter_ => $filter = _$filter_);
  });

  it('should return the correct result', () => {
    let getByPropertyNested = $filter('getByPropertyNested');

    let nested1 = {
      a: [1, 2, 3],
      b: [4, 5, 6],
      c: [7, 8, 9]
    };

    let nested2 = {
      a: [1, 2, 3],
      b: [4, 42, 6],
      c: [7, 8, 9]
    };

    let result = getByPropertyNested('b', 42, [nested1, nested2]);
    expect(result).toBe(nested2);
  });

  it('should return null if there is nothing to get', () => {
    let getByPropertyNested = $filter('getByPropertyNested');
    let result = getByPropertyNested('d', 9, []);
    expect(result).toBe(null);
  });
});
