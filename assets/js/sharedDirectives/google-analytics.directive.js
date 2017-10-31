angular
  .module('shared')
  .directive('googleAnalytics', googleAnalytics);

function googleAnalytics () {
  const directive = {
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-75417471-1', 'auto');

    let page = document.location.pathname;
    ga('send', 'pageview', page, { anonymizeIp: true });

    scope.$on('$destroy', () => {
      ga('send', 'pageview', {'sessionControl': 'end'});
      document.head.getElementsByTagName('script')[0].remove();
    });
  }
}
