describe "passwordEntropy", ->
  $scope = undefined
  isoScope = undefined
  MyWalletHelpers = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    MyWalletHelpers = $injector.get('MyWalletHelpers')

    $scope = $rootScope.$new()
    $scope.fields = { password: '' }
    element = $compile('<password-entropy password="fields.password"></password-entropy>')($scope)
    $scope.$digest()
    isoScope = element.isolateScope()
  )

  beforeEach ->
    expect(isoScope.score).toEqual(0)
    expect(isoScope.barColor).toEqual('progress-bar-danger')
    expect(isoScope.strength).toEqual('weak')

  it "should update the score when the password changes", ->
    $scope.fields.password = 'a'
    $scope.$digest()
    expect(isoScope.score).toEqual(25)

  it "should never set the score to above 100", ->
    $scope.fields.password = 'asdfasdfasdfasdfasdfasdfasdf'
    $scope.$digest()
    expect(isoScope.score).toEqual(100)

  it "should set the display values correctly", ->
    $scope.fields.password = 'ab'
    $scope.$digest()
    expect(isoScope.barColor).toEqual('progress-bar-info')
    expect(isoScope.strength).toEqual('normal')
