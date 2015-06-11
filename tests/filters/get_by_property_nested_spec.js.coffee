describe "getByPropertyNestedFilter", ->

  $filter = null

  beforeEach ->
    module('walletFilters')
    inject (_$filter_) ->
      $filter = _$filter_

  it "should return the correct result", () ->
    getByPropertyNested = $filter('getByPropertyNested')

    nested1 =
      a: [1, 2, 3]
      b: [4, 5, 6]
      c: [7, 8, 9]

    nested2 =
      a: [1, 2, 3]
      b: [4, 42, 6]
      c: [7, 8, 9]

    result = getByPropertyNested('b', 42, [nested1, nested2])
    expect(result).toBe(nested2)

  it "should return null if there is nothing to get", () ->
    getByPropertyNested = $filter('getByPropertyNested')
    result = getByPropertyNested('d', 9, [])
    expect(result).toBe(null)