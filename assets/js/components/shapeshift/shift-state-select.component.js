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
  Env.then(env => this.whitelisted = env.shapeshift.statesWhitelist);

  this.saveState = () => ShapeShift.setUSAState(this.state);
  this.state = state.stateCodes.filter((s) => s.Code === ShapeShift.USAState)[0];
  this.onStateWhitelist = () => this.state ? this.whitelisted.indexOf(this.state.Code) > -1 : true;

  this.signupForShift = () => {
    let state = this.state.Name;
    let email = encodeURIComponent(this.email);

    ShapeShift.signupForShift(email, state);
  };
}
