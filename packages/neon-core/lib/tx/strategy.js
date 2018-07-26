"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u_1 = require("../u");
/**
 * Select the coins in order of value, smallest first.
 * @param {AssetBalance} assetBalance
 * @param {Fixed8} requiredAmt
 * @return {Coin[]}
 */
function smallestFirst(assetBalance, requiredAmt) {
    // Ascending order sort
    assetBalance.unspent.sort((a, b) => a.value.sub(b.value).toNumber());
    return fillFromLeft(requiredAmt, assetBalance.unspent);
}
exports.smallestFirst = smallestFirst;
/**
 * Select the coins in order of value, biggest first.
 * @param {AssetBalance} assetBalance
 * @param {Fixed8} requiredAmt
 * @return {Coin[]}
 */
function biggestFirst(assetBalance, requiredAmt) {
    // Descending order sort
    assetBalance.unspent.sort((a, b) => b.value.sub(a.value).toNumber());
    return fillFromLeft(requiredAmt, assetBalance.unspent);
}
exports.biggestFirst = biggestFirst;
/**
 * Use a balanced approach by selecting a coin that
 * @param {AssetBalance} assetBalance
 * @param {Fixed8} requiredAmt
 * @return {Coin[]}
 */
function balancedApproach(assetBalance, requiredAmt) {
    // Ascending sort first
    assetBalance.unspent.sort((a, b) => a.value.sub(b.value).toNumber());
    // Trim off coins larger than requiredAmt
    const smallCoins = assetBalance.unspent.filter(c => c.value.lte(requiredAmt));
    if (smallCoins.length === 0) {
        return [assetBalance.unspent[0]];
    }
    // Check for naive solution
    const i = smallCoins.findIndex(c => requiredAmt.eq(c.value));
    if (i >= 0) {
        return [smallCoins[i]];
    }
    // Take the largest coin available and fill it up with little pieces
    const bigCoins = assetBalance.unspent.slice(smallCoins.length);
    const selectedInputs = [];
    if (smallCoins.length > 0) {
        selectedInputs.push(smallCoins.pop());
    }
    const remainderAmt = requiredAmt.minus(selectedInputs.length > 0 ? selectedInputs[0].value : 0);
    const remainderInputs = fillFromLeft(remainderAmt, smallCoins.concat(bigCoins));
    return selectedInputs.concat(remainderInputs);
}
exports.balancedApproach = balancedApproach;
/**
 * Selects inputs from left of array till sum of inputs is equal or larger than requiredAmt.
 * @param {Fixed8} requiredAmt
 * @param {Coin[]} availableInputs
 * @return {Coin[]}
 */
function fillFromLeft(requiredAmt, availableInputs) {
    let selectPointer = 0;
    let selectedAmt = new u_1.Fixed8(0);
    // Selected min inputs to satisfy outputs
    while (selectedAmt.lt(requiredAmt)) {
        selectPointer += 1;
        if (selectPointer > availableInputs.length) {
            throw new Error(`Insufficient assets! Reached end of unspent coins! ${availableInputs.length}`);
        }
        selectedAmt = selectedAmt.add(availableInputs[selectPointer - 1].value);
    }
    return availableInputs.slice(0, selectPointer);
}
//# sourceMappingURL=strategy.js.map