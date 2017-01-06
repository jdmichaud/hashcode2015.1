const hashcode = require('../js/hashcode');

describe('hashcode', () => {
  describe('loadInput', () => {
    it('shall load a file', () => {
      expect(true).toBe(true);
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
