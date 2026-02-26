describe('escapeHtmlFilter', () => {
  beforeEach(module('walletApp'));
  beforeEach(module('walletFilters'));

  it('should escape html', inject(($filter) => {
    let convert = $filter('escapeHtml');
    let html = '<a href="http://evil.com">Click me >:&</a>';
    let escaped = '&lt;a href=&quot;http://evil.com&quot;&gt;Click me &gt;:&amp;&lt;/a&gt;';
    expect(convert(html)).toBe(escaped);
  }));
});
