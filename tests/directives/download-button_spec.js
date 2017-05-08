describe('downloadButton', () => {
  let scope;
  let element;
  let isoScope;
  let $timeout;

  beforeEach(module('walletApp'));

  beforeEach(inject(function ($compile, $rootScope, $window, _$timeout_) {
    $timeout = _$timeout_;

    scope = $rootScope.$new();
    scope.content = 'asdf';
    scope.$digest();

    element = $compile("<download-button content='content' filename='test.txt'></download-button>")(scope);
    return isoScope = element.isolateScope();
  })
  );

  it('should use the correct filename', () => {
    isoScope.$digest();
    expect(isoScope.filename).toEqual('test.txt');
  });

  it('should click the anchor tag to trigger download', () => {
    isoScope.$digest();
    spyOn(element[0], 'click');
    scope.$broadcast("download");
    $timeout.flush();
    expect(element[0].click).toHaveBeenCalled();
  });

  describe('content', () => {
    beforeEach(function () {
      spyOn(isoScope, 'createDataUri').and.callFake(x => `data:${x}`);
      return isoScope.$digest();
    });

    it('should create an initial data ref', () => expect(isoScope.dataRef).toEqual('data:asdf'));

    it('should create a data ref when updated', () => {
      isoScope.content = 'abc';
      isoScope.$digest();
      expect(isoScope.dataRef).toEqual('data:abc');
    });
  });

  describe('data uri', () => {
    beforeEach(() => isoScope.$digest());

    it('should create correctly', () => {
      let expected = 'data:text/plain;charset=utf-8,abc';
      expect(isoScope.createDataUri('abc')).toEqual(expected);
    });

    it('should encode', () => {
      let expected = 'data:text/plain;charset=utf-8,%F0%9F%92%B8';
      expect(isoScope.createDataUri('💸')).toEqual(expected);
    });
  });
});
