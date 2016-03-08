describe 'async select', ->
  $q = undefined
  isoScope = undefined

  beforeEach module('walletApp')

  beforeEach inject((_$compile_, _$rootScope_, _$q_, Wallet) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    $q = _$q_

    element = $compile('<async-select></async-select>')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()
  )

  describe 'didSelect', ->
    mockPromise = (err) ->
      then: (f) ->
        not err and f()
        catch: (g) ->
          err and g()
          finally: (h) -> h()

    beforeEach ->
      isoScope.selected = { name: 'U.S. Dollar', code: 'USD' }

    it 'should change successfully', ->
      item = { name: 'Other Name', code: 'Not USD' }
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise())
      isoScope.didSelect(item)
      expect(isoScope.onChange).toHaveBeenCalledWith(item)
      expect(isoScope.selected.code).toEqual('Not USD')

    it 'should show an error when on failure', inject((Alerts) ->
      spyOn(Alerts, 'displayError')
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise(true))
      isoScope.didSelect({ name: 'Other Name', code: 'Not USD' })
      expect(isoScope.selected.code).toEqual('USD')
      expect(Alerts.displayError).toHaveBeenCalled()
    )

    it 'should set changing to false when async operation is complete', ->
      isoScope.onChange = jasmine.createSpy().and.returnValue(mockPromise())
      isoScope.changing = true
      isoScope.didSelect()
      expect(isoScope.changing).toEqual(false)

  describe 'displayItem', ->
    item = { name: 'U.S. Dollar', code: 'USD' }

    it 'should return a blank string if no item is given', ->
      expect(isoScope.displayItem()).toEqual('')

    it 'should display an item using the display prop', ->
      isoScope.displayProp = 'name'
      expect(isoScope.displayItem(item)).toEqual('U.S. Dollar')

    it 'should display an item using the optional display prop', ->
      isoScope.displayProp = 'name'
      isoScope.displayOptional = 'code'
      expect(isoScope.displayItem(item, true)).toEqual('U.S. Dollar (USD)')

    it 'should not display the optional display prop if flag is false', ->
      isoScope.displayProp = 'name'
      isoScope.displayOptional = 'code'
      expect(isoScope.displayItem(item, false)).toEqual('U.S. Dollar')
