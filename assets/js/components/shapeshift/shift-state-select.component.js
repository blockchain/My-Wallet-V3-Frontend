angular
  .module('walletApp')
  .component('shiftStateSelect', {
    bindings: {
      states: '<',
      nextStep: '&'
    },
    templateUrl: 'templates/shapeshift/state-select.pug',
    controller: shiftStateSelectController,
    controllerAs: '$ctrl'
  });

function shiftStateSelectController (MyWallet, Env, ShapeShift, state) {
  Env.then(env => {
    // this.blacklisted = env.shapeshift.statesBlacklist;
    this.blacklisted = ['NY', 'NC'];
  });

  this.onStateBlacklist = state => {
    if (!state) return false;
    return this.blacklisted.indexOf(state.Code) > -1;
  };

  this.saveState = () => ShapeShift.setUSAState(this.state);

  this.signupForShift = () => {
    let email = encodeURIComponent(this.email);
    let state = this.state.Name;
    ShapeShift.signupForShift(email, state);
  };
}
