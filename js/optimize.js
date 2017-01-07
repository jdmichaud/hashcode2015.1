/* eslint no-mixed-operators: 0 */

const lodash = require('lodash');

const hashcode = require('./hashcode');
const constants = require('./constants');

function placeServers(rows, servers) {
  servers.sort((s1, s2) => s1.capacity < s2.capacity).forEach((server, serverid) => {
    const slots = hashcode.getAvailableSlot(rows, server.size);
    if (slots.length !== 0) {
      rows = hashcode.insert(rows, slots[0].rowid, slots[0].slotid, serverid, server.size);
    }
  });
  return rows;
}

function createRandomPools(rows, servers, parameters, pools) {
  for (let i = 0; i < parameters.R; i += 1) {
    // Retrieve row id without empty and unavailble slots
    const filtered = rows.filter(item =>
      item.value !== constants.AVAILABLE
      && item.value !== constants.UNAVAILABLE
      && item.rowid === i);
    // scramble it and keep only the first parameters.P item
    const scrambled = lodash.sampleSize(filtered, filtered.length).slice(0, parameters.P);
    // Add the servers to the pool
    pools = lodash.zip(pools, scrambled).map(pair => pair[0].concat([pair[1].value]));
  }
  return pools;
}

function optimize(rows, servers, parameters, pools) {
  const randomPools = createRandomPools(rows, servers, parameters, pools);
  return {
    pools: randomPools,
    score: hashcode.score(rows, servers, parameters, randomPools),
  };
}

module.exports = {
  placeServers,
  optimize,
};
