/* eslint no-use-before-define: 0 */
/* eslint no-underscore-dangle: 0 */

const assert = require('assert');
const fs = require('fs');
const iconv = require('iconv-lite');
const constants = require('./constants');

/**
 * Convert from the original latin1 to proper utf8
 * @param buffer {Buffer} Take a javascript Buffer object as returned by readfile
 * @returns a utf-8 encoded string
 */
function fixEncoding(buffer) {
  // Convert from an encoded buffer to js string.
  return iconv.decode(buffer, 'latin1');
}

function generateRows(parameters) {
  // return Array(parameters.R).fill(Array(parameters.S).fill(constants.AVAILABLE));
  // [rowid, slotid, value, size]
  return [...Array(parameters.R).keys()].map(i => ({
    rowid: i,
    slotid: 0,
    value: constants.AVAILABLE,
    size: parameters.S,
  }));
}

function decodeParameters(line) {
  const values = line.split(/\W+/);
  return {
    R: parseInt(values[0], 10),
    S: parseInt(values[1], 10),
    U: parseInt(values[2], 10),
    P: parseInt(values[3], 10),
    M: parseInt(values[4], 10),
  };
}

function decodeUnavailable(line) {
  const values = line.split(/\W+/);
  return {
    rowid: parseInt(values[0], 10),
    slotid: parseInt(values[1], 10),
  };
}

function decodeServer(line) {
  const values = line.split(/\W+/);
  return {
    size: parseInt(values[0], 0),
    capacity: parseInt(values[1], 0),
  };
}

function loadFile(filepath) {
  const lines = fixEncoding(fs.readFileSync(filepath)).split('\n');
  const parameters = decodeParameters(lines[0]);
  let rows = generateRows(parameters);
  const pools = Array(parameters.P).fill([]);
  const servers = [];
  for (let i = 0; i < parameters.U; i += 1) {
    const unavailable = decodeUnavailable(lines[i + constants.UNAVAILABLE_OFFSET]);
    rows = insert(rows, unavailable.rowid, unavailable.slotid, constants.UNAVAILABLE);
  }
  for (let i = 0; i < parameters.M; i += 1) {
    servers.push(decodeServer(lines[i + constants.UNAVAILABLE_OFFSET + parameters.U]));
  }
  return {
    parameters,
    rows,
    pools,
    servers,
  };
}

function saveResult(rows, parameters, filename) {
  let output = '';
  for (let i = 0; i < parameters.M; i += 1) {
    const position = getPosition(rows, i);
    if (position !== undefined) {
      output += `${i} ${position.row} ${position.slot}\n`;
    } else {
      output += 'x\n';
    }
  }
  fs.writeFileSync(output);
}

function findIndex(rows, rowid, slotid, value, size = 1) {
  let i = 0;
  for (; i < rows.length; i += 1) {
    // If the current slot is OK and the next one is not
    if (rows[i].rowid === rowid && rows[i].slotid <= slotid) {
      if (i + 1 >= rows.length || rows[i + 1].rowid !== rowid || rows[i + 1] > slotid) {
        return i;
      }
    }
  }
  return -1;
}

function insert(rows, rowid, slotid, value, size = 1) {
  const index = findIndex(rows, rowid, slotid, value, size);
  assert(rows[index.value] !== constants.AVAILABLE);
  const item = rows[index];
  // Include all the previous element
  let result = rows.slice(0, index);
  if (item.slotid < slotid) {
    // Add a previous element if we cut the current item in two
    result = result.concat({
      rowid: item.rowid,
      slotid: item.slotid,
      value: item.value,
      size: slotid - item.slotid,
    });
  }
  result = result.concat({
    rowid: item.rowid,
    slotid: slotid,
    value,
    size,
  });
  if (item.size !== size) {
    // Add a next element if we didn't use up all the slots
    return result.concat({
      rowid: rows[index].rowid,
      slotid: slotid + size,
      value: rows[index].value,
      size: rows[index].size - size - (slotid - item.slotid),
    }).concat(rows.slice(index + 1));
  }
  // Replace the element
  return result.concat(rows.slice(index + 1));
}

function getAvailableSlot(rows, size) {
  return rows.filter(row => row.value === constants.AVAILABLE && row.size >= size);
}

function getPosition(rows, servers) {
  // Get row
  var row = 0;
  var size = 0;
  const availableSpaces =
    rows.filter(r => r.rowid === row && r.value === constants.AVAILABLE && r.size >= size);
  const sameSizeAvailable = availableSpaces.filter(available => available.size === size);
  if (sameSizeAvailable.length) {
    console.log('avoid eslint warning');
  }
}

function display(rows) {
  let output = '';
  let currentRow = 0;
  for (let j = 0; j < rows.length; j += 1) {
    if (currentRow !== rows[j].rowid) {
      output += '\n';
      currentRow = rows[j].rowid;
    }
    switch (rows[j].value) {
      case constants.UNAVAILABLE:
        output += new Array(rows[j].size + 1).join('X');
        break;
      case constants.AVAILABLE:
        output += new Array(rows[j].size + 1).join('.');
        break;
      default:
        output += new Array(rows[j].size + 1).join(rows[j].value);
    }
  }
  return output;
}

function computeGC(rows, servers, parameters, pool) {
  let guaranteedCapacity = -1;
  for (let i = 0; i < parameters.R; i += 1) {
    // Keep all rows but row i and keep only servers from the pool
    const items = rows.filter(row => row.rowid !== i && pool.indexOf(row.value) !== -1);
    const capacity = items.reduce((result, item) => servers[item.value].capacity + result, 0);
    if (guaranteedCapacity === -1 || guaranteedCapacity > capacity) {
      guaranteedCapacity = capacity;
    }
  }
  return guaranteedCapacity;
}

function score(rows, servers, parameters, pools) {
  return Math.min.apply(null, pools.map(pool => computeGC(rows, servers, parameters, pool)));
}

module.exports = {
  loadFile,
  saveResult,
  insert,
  getAvailableSlot,
  getPosition,
  computeGC,
  score,
  display,
};
