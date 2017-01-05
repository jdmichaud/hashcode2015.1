/* eslint no-use-before-define: 0 */

const fs = require('fs');
const iconv = require('iconv-lite');

const constants = require('constants');

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
  return Array(parameters.R).fill(Array(parameters.S).fill(constants.AVAILABLE));
}

function decodeParameters(line) {
  const values = line.split(/\W+/);
  return {
    R: values[0],
    S: values[1],
    U: values[2],
    P: values[3],
    M: values[4],
  };
}

function decodeUnavailable(line) {
  const values = line.split(/\W+/);
  return {
    row: values[0],
    slot: values[1],
  };
}

function decodeServer(line) {
  const values = line.split(/\W+/);
  return {
    size: values[0],
    capacity: values[1],
  };
}

function loadInput(filepath) {
  const lines = fixEncoding(fs.readFileSync(filepath)).split('\n');
  const parameters = decodeParameters(lines[0]);
  const rows = generateRows(parameters);
  const pools = [];
  const servers = [];
  for (let i = 0; i < parameters.U; i += 1) {
    const unavailable = decodeUnavailable(lines[i + constants.UNAVAILBLE_OFFSET]);
    insert(rows, unavailable.row, unavailable.slot, constants.UNAVAILBLE);
  }
  for (let i = 0; i < constants.M; i += 1) {
    servers.push(decodeServer(lines[i + constants.UNAVAILBLE_OFFSET + parameters.U]));
  }
  return {
    parameters,
    rows,
    pools,
    servers,
  };
}

function saveResult(rows, pools, filename) {}
function insert(rows, row, col, value, size = 1) {}
function getEmptySpace(rows, size, row = 0, col = 0) {}
function getRow(rows, servers) {}
function computeGC(rows, pool, servers) {}
function score(rows, pools, servers) {}

module.exports = {
  loadInput,
  saveResult,
  insert,
  getEmptySpace,
  getRow,
  computeGC,
  score,
};
