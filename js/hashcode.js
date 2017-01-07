/* eslint no-use-before-define: 0 */

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
  // [rowid, colid, value, size]
  return [...Array(parameters.R).keys()].map(i => ({
    rowid: i,
    colid: 0,
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
    row: parseInt(values[0], 10),
    slot: parseInt(values[1], 10),
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
  const rows = generateRows(parameters);
  const pools = Array(parameters.P).fill([]);
  const servers = [];
  for (let i = 0; i < parameters.U; i += 1) {
    const unavailable = decodeUnavailable(lines[i + constants.UNAVAILABLE_OFFSET]);
    insert(rows, unavailable.row, unavailable.slot, constants.UNAVAILABLE);
  }
  for (let i = 0; i < parameters.M; i += 1) {
    servers.push(decodeServer(lines[i + constants.UNAVAILBLE_OFFSET + parameters.U]));
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

function insert(rows, rowid, colid, value, size = 1) {
  const row = rows.filter(r => r.rowid === rowid && r.colid === colid);
  let i = 0;
  for (let j = 0; i < row.length; i += 1) {
    j += row[i][2];
    if (j >= colid) {
      break;
    }
  }
}

function getEmptySpace(rows, size, row = 0, col = 0) {}

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

function computeGC(rows, pool, servers) {}
function score(rows, pools, servers) {}

module.exports = {
  loadFile,
  saveResult,
  insert,
  getEmptySpace,
  getPosition,
  computeGC,
  score,
};
