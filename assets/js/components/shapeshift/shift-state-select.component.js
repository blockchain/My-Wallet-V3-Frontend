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
    this.whitelisted = env.shapeshift.statesWhitelist;
  });

  this.onStateWhitelist = state => {
    if (!state) return true;
    return this.whitelisted.indexOf(state.Code) > -1;
  };

  this.saveState = () => ShapeShift.setUSAState(this.state);

  this.signupForShift = () => {
    let email = encodeURIComponent(this.email);
    let state = this.state.Name;
    ShapeShift.signupForShift(email, state);
  };
}
