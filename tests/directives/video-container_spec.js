describe('Video Container Directive', () => {
  let $compile;
  let $rootScope;
  let $sce;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));
  // beforeEach module('shared')

  beforeEach(inject(function (_$compile_, _$rootScope_, _$sce_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $sce = _$sce_;
  })
  );

  beforeEach(function () {
    element = $compile("<video-container img='img/blockchain-ad-placeholder.jpg' ng-src='adUrl'></video-container>")($rootScope);
    $rootScope.adUrl = 'my.video.mp4';
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it("should have an image", () => expect(isoScope.img).toBeDefined());

  it("should have a video ng-src", () => expect(isoScope.ngSrc).toBeDefined());

  it('should toggle play and pause', () => {
    isoScope.playing = false;
    isoScope.toggle();
    expect(isoScope.playing).toBe(true);
  });
});
