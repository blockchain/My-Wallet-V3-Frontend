angular
  .module('walletFilters')
  .filter('escapeHtml', escapeHtmlFilter);

function escapeHtmlFilter () {
  var escapeHtml = function (html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };
  return function (html) {
    return typeof html === 'string' ? escapeHtml(html) : html;
  };
}
