describe "ui-select helper directive", ->
  scope = undefined
  element = undefined
  $timeout = undefined

  beforeEach module('walletDirectives');
  beforeEach module("walletApp")

  beforeEach inject(($compile, $rootScope, _$timeout_) ->
    $timeout = _$timeout_
    scope = $rootScope.$new()

    angular.extend scope,
      choice: 'a'
      choices: ['a', 'b']
      isOpen: false
      onClose: () ->

    element = $compile("""
      <ui-select ng-model="choice" ui-select-open="isOpen" ui-select-on-close="onClose()">
        <ui-select-match>selected:{{ $select.selected }}</ui-select-match>
        <ui-select-choices repeat="choice in choices">
          <li>choice:{{ choice }}</li>
        </ui-select-choices>
      </ui-select>
    """)(scope)

    scope.$digest()
  )

  applyChange = (change) ->
    change()
    scope.$digest()
    $timeout.flush()

  it "should open when isOpen is set to true", ->
    expect(element[0].innerHTML).not.toContain('choice:b')
    applyChange(() -> scope.isOpen = true)
    expect(element[0].innerHTML).toContain('choice:b')

  it "should close when isOpen is set to false", ->
    applyChange(() -> scope.isOpen = true)
    expect(element[0].innerHTML).toContain('choice:b')
    applyChange(() -> scope.isOpen = false)
    expect(element[0].innerHTML).not.toContain('choice:b')

  it "should trigger the on close event", ->
    spyOn(scope, "onClose").and.callThrough()
    applyChange(() -> scope.isOpen = false)
    expect(scope.onClose).toHaveBeenCalled()
