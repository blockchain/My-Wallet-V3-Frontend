class HomeController {

  constructor () {
    'nbInject';
    this.title = 'Home';
    this.navigationItems = [
      { title: 'Components', href: 'components' },
      { title: 'Directives', href: 'directives' }
    ];
  }
}

export default HomeController;
