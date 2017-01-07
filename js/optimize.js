const hashcode = require('./hashcode');

function placeServers(rows, servers) {
  servers.forEach((server, serverid) => {
    const slots = hashcode.getAvailableSlot(rows, server.size);
    if (slots.length !== 0) {
      rows = hashcode.insert(rows, slots[0].rowid, slots[0].slotid, serverid, server.size);
    }
  });
  return rows;
}

function optimize(rows, servers, parameters) {
  
}

module.exports = {
  placeServers,
  optimize,
};
