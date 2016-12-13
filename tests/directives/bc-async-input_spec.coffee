describe 'bcAsyncInput Directive', ->
  $compile = undefined
  scope = undefined
  isoScope = undefined

  compileElement = (attrs) ->
    attrs = attrs.join(' ') if attrs?

    element = $compile('<bc-async-input ' + attrs + ' ng-model="testModal"></bc-async-input>')(scope)
    scope.$digest()

    isoScope = element.isolateScope()
    isoScope.$digest()

    isoScope.$root = { $safeApply: () -> }

    return isoScope

  beforeEach module('walletDirectives');
  beforeEach module('walletApp')

  beforeEach inject((_$compile_, $rootScope, Wallet) ->

    $compile = _$compile_

    scope = $rootScope.$new()
    scope.testModal = 'oldValue'

    scope.testValidator = (value) ->
      return false if value == 'invalidValue'
      return true

  )

  describe 'initialization', ->

    beforeEach ->
      isoScope = compileElement()

    it 'should have a user', ->
      expect(isoScope.status).toBeDefined()

    it 'should have a status', ->
      expect(isoScope.status).toEqual({ edit: false, saving: false })

    it 'should have access to the model value', ->
      expect(isoScope.form.newValue).toBe('oldValue')

    it 'should have buttonClass', ->
      expect(isoScope.buttonClass).toBe('button-primary btn-small')

    it 'should have inline attribute set to false', ->
      expect(isoScope.inline).toBe(false)

    it 'should have type "text" by default', ->
      expect(isoScope.type).toBe('text')

  describe 'inline attributes', ->

    it 'should get passed buttonClass', ->
      isoScope = compileElement(['button-class="button-success button-lg"'])
      expect(isoScope.buttonClass).toBe('button-success button-lg')

    it 'should get passed inline attribute', ->
      isoScope = compileElement(['inline'])
      expect(isoScope.inline).toBe(true)

    it 'should get passed isRequired attribute', ->
      isoScope = compileElement(['is-required'])
      expect(isoScope.isRequired).toBe(true)

    it 'should get passed type attribute', ->
      isoScope = compileElement(['type="email"'])
      expect(isoScope.type).toBe('email')

    it 'should get passed validator', ->
      isoScope = compileElement(['validator="testValidator"'])
      expect(typeof isoScope.validator).toBe('function')

  describe 'edit', ->

    beforeEach ->
      isoScope = compileElement()

    it 'should edit when edit() is called', ->
      isoScope.edit()
      expect(isoScope.status.edit).toBe(1)

    it 'should edit when focus() is called', ->
      isoScope.focus()
      expect(isoScope.status.edit).toBe(1)

  describe 'validation', ->

    beforeEach ->
      isoScope = compileElement([
        'validator="testValidator"'
        'is-required'
      ])

    it 'should be valid', ->
      isoScope.bcAsyncForm.input.$setViewValue('newValue')
      expect(isoScope.bcAsyncForm.$valid).toBe(true)

    it 'should be invalid if empty', ->
      isoScope.bcAsyncForm.input.$setViewValue('')
      expect(isoScope.bcAsyncForm.$valid).toBe(false)

    it 'should be invalid if validator function returns false', ->
      isoScope.bcAsyncForm.input.$setViewValue('invalidValue')
      expect(isoScope.bcAsyncForm.$valid).toBe(false)

    # it 'should be invalid if email type requirement is not met', ->
    #   isoScope = compileElement(['type="email"'])
    #   isoScope.bcAsyncForm.input.$setViewValue('test@test.')
    #   expect(isoScope.bcAsyncForm.$valid).toBe(false)

    it 'should return true if the view is equal to the model', ->
      isoScope.bcAsyncForm.input.$setViewValue('oldValue')
      expect(isoScope.bcAsyncForm.$valid).toBe(false)

  describe 'cancel', ->

    beforeEach ->
      isoScope.bcAsyncForm.input.$setViewValue('newValue')
      isoScope.cancel()

    it 'should not save if cancelled', ->
      expect(isoScope.form.newValue).toBe('oldValue')

    it 'should be pristine', ->
      expect(isoScope.bcAsyncForm.$pristine).toBe(true)

  describe 'save', ->

    beforeEach ->
      isoScope.onSave = (newValue, success, error) ->
        success()

    it 'should validate when save() is called', ->
      spyOn(isoScope, 'validate').and.callThrough()
      isoScope.save()
      expect(isoScope.validate).toHaveBeenCalled()
