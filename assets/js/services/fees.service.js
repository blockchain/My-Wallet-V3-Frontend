
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
    return satoshiPerKb * (sizeBytes / 1000);
  }

  function getClosestBlock(fee, sizeBytes, feeEstimates) {
    fee = Math.floor(fee);
    let fees = feeEstimates.map(e => service.guessAbsoluteFee(sizeBytes, e.fee));
    let closestBlock = fees.reduce((x, y) => (x-fee > y-fee && fee >= Math.floor(x) ? x : y));
    let low = Math.floor(fees[5])

    let blockIdx = fees.indexOf(closestBlock) + 1;
    if (fee === low) blockIdx = 6;
    if (fee < low) blockIdx = 7;
    return blockIdx;
  }

}
