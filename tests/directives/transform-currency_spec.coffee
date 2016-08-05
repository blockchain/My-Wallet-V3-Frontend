describe "Transform-Currency Directive", ->
  
  scope = undefined
  isoScope = undefined
  element = undefined

  beforeEach module("walletApp")

  beforeEach ->
    inject ($rootScope, $compile, $injector) ->

      currency = $injector.get('currency')
      currency.conversions.USD = { conversion: 1000, symbol: '$' }

      scope = $rootScope.$new()
      scope.amount = 100
      scope.currency = currency.currencies[0]

      template = '<input ng-model="amount" transform-currency="currency"></fiat>'
      element = $compile(template)(scope)
      scope.$digest()

      isoScope = element.isolateScope()
      isoScope.$digest()

  describe "on initialization", ->

    it "should have a parser defined", ->
      expect(isoScope.parseToModel).toBeDefined()

    it "should have a formatter defined", ->
      expect(isoScope.formatToView).toBeDefined()

  describe "transformation magic", ->

    it "should parse the view (fiat) to the model (satoshi)", ->
      pending()
      # TODO: Figure out how to test this
      expect(scope.amount).toEqual(100)
      expect(element.val()).toEqual('0.1')
      # Changing the input value does not get registered
      element.val('0.2');
      scope.$digest()
      expect(scope.amount).toEqual(200)
      expect(element.val()).toEqual('0.2')

    it "should format the model (satoshi) to the view (fiat)", ->
      expect(scope.amount).toEqual(100)
      expect(element.val()).toEqual('0.1')
      scope.amount = 200
      scope.$digest()
      expect(scope.amount).toEqual(200)
      expect(element.val()).toEqual('0.2')

    it "should leave null alone", ->
      scope.amount = null
      scope.$digest()
      expect(element.val()).toEqual('')

    it "should leave empty alone", ->
      scope.amount = ""
      scope.$digest()
      expect(element.val()).toEqual('')
