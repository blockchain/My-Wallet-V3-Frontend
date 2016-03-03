
angular
  .module('walletApp')
  .factory('fees', fees);

function fees() {

  const service = {
    guessAbsoluteFee: guessAbsoluteFee,
    getClosestBlock: getClosestBlock
  };
  return service;

  function guessAbsoluteFee(sizeBytes, satoshiPerKb) {
    return Math.ceil(satoshiPerKb * (sizeBytes / 1000));
  }

  function getClosestBlock(fee, sizeBytes, feeEstimates) {
    fee = Math.ceil(fee);
    let fees = feeEstimates.map(e => service.guessAbsoluteFee(sizeBytes, e.fee));
    let closestBlock = fees.reduce((x, y) => (x-fee > y-fee && fee >= x ? x : y));
    let low = fees[5];

    let blockIdx = fees.indexOf(closestBlock) + 1;
    if (fee === low) blockIdx = 6;
    if (fee < low) blockIdx = 7;
    return blockIdx;
  }

}
