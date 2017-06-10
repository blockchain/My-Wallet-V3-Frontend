
function Adverts () {
  this.ads = [];
  this.fetchOnce = function () { };

  return {
    ads: this.ads,
    fetchOnce: this.fetchOnce
  };
}

function Env () { return new Promise(() => {}); }

export default {
  Adverts: Adverts,
  Env: Env
};
