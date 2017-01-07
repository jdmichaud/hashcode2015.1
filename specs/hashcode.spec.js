const hashcode = require('../js/hashcode');
const constants = require('../js/constants');

describe('hashcode', () => {
  describe('loadInput', () => {
    it('shall load a file', () => {
      const results = hashcode.loadFile('tests/provided.hc');
      expect(results.parameters.R).toEqual(2);
      expect(results.parameters.S).toEqual(5);
      expect(results.parameters.U).toEqual(1);
      expect(results.parameters.P).toEqual(2);
      expect(results.parameters.M).toEqual(5);
      expect(results.pools.length).toEqual(results.parameters.P);
      expect(results.servers.length).toEqual(results.parameters.M);
    });
  });

  describe('insert', () => {
    it('shall insert element', () => {
      // Insert server 3 of size 3 at row 1 slot 1
      const rows = [{
        rowid: 0,
        slotid: 0,
        value: constants.AVAILABLE,
        size: 5,
      }, {
        rowid: 1,
        slotid: 0,
        value: constants.AVAILABLE,
        size: 5,
      }];
      const result = hashcode.insert(rows, 1, 1, 3, 3);
      expect(result.length).toBe(4);
      expect(result[0]).toEqual({
        rowid: 0,
        slotid: 0,
        value: constants.AVAILABLE,
        size: 5,
      });
      expect(result[1]).toEqual({
        rowid: 1,
        slotid: 0,
        value: constants.AVAILABLE,
        size: 1,
      });
      expect(result[2]).toEqual({
        rowid: 1,
        slotid: 1,
        value: 3,
        size: 3,
      });
      expect(result[3]).toEqual({
        rowid: 1,
        slotid: 4,
        value: constants.AVAILABLE,
        size: 1,
      });
    });
  });

  describe('computeGC', () => {
    it('shall compute the guaranteed capacity', () => {
      const rows = [
        { rowid: 0, slotid: 0, value: -2, size: 1 },
        { rowid: 0, slotid: 1, value: 0, size: 3 },
        { rowid: 0, slotid: 4, value: 3, size: 1 },
        { rowid: 1, slotid: 0, value: 1, size: 3 },
        { rowid: 1, slotid: 3, value: 2, size: 2 },
      ];
      const servers = [
        { size: 3, capacity: 10 },
        { size: 3, capacity: 10 },
        { size: 2, capacity: 5 },
        { size: 1, capacity: 5 },
        { size: 1, capacity: 1 },
      ];
      expect(hashcode.computeGC(rows, servers, { R: 2 }, [0, 2])).toBe(5);
    });
  });

  describe('score', () => {
    it('shall compute the minimum guaranteed capacity', () => {
      const rows = [
        { rowid: 0, slotid: 0, value: -2, size: 1 },
        { rowid: 0, slotid: 1, value: 0, size: 3 },
        { rowid: 0, slotid: 4, value: 3, size: 1 },
        { rowid: 1, slotid: 0, value: 1, size: 3 },
        { rowid: 1, slotid: 3, value: 2, size: 2 },
      ];
      const servers = [
        { size: 3, capacity: 10 },
        { size: 3, capacity: 10 },
        { size: 2, capacity: 5 },
        { size: 1, capacity: 5 },
        { size: 1, capacity: 1 },
      ];
      const pools = [
        [0, 2],
        [3, 1],
      ];
      expect(hashcode.score(rows, servers, { R: 2 }, pools)).toBe(5);
    });
  });
});
