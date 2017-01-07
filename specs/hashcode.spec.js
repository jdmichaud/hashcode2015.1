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
      expect(results.rows.length).toEqual(results.parameters.R);
      expect(results.rows[0]).toEqual([
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
      ]);
      expect(results.rows[1]).toEqual([
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
        constants.AVAILABLE,
      ]);
      expect(results.pools.length).toEqual(results.parameters.P);
      expect(results.servers.length).toEqual(results.parameters.M);
    });
  });

  describe('insert', () => {
    it('shall insert element', () => {
      // Insert server 3 of size 3 at row 1 column 2
      const result = hashcode.insert([[0, 0, 5], [1, 0, 5]], 1, 2, 3, 3);
      expect(result.length).toBe(4);
      expect(result[0]).toEqual([0, 0, 5]);
      expect(result[1]).toEqual([1, 0, 1]);
      expect(result[2]).toEqual([1, 3, 1]);
      expect(result[3]).toEqual([1, 0, 1]);
    });
  });
});
