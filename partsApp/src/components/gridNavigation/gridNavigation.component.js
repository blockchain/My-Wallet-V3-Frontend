import Template from './gridNavigation.pug';

class Controller {
  constructor () {}

  // $onChanges () {
  //   let rowArray = [];
  //   let columnArray = [];
  //   let items = this.gridItems;
  //
  //   for (var i = 0; i < items.length; i++) {
  //     columnArray.push(items[i]);
  //
  //     if ((i + 1) % 3 === 0) {
  //       rowArray.push(columnArray);
  //       columnArray = [];
  //     }
  //   }
  //
  //   this.linkArray = rowArray;
  // }
}

export default {
  controller: Controller,
  template: Template,
  bindings: {
    gridItems: '<'
  }
};
