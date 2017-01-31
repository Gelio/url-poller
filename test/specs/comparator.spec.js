import Comparator from '../../src/comparator';

describe('Comparator', () => {
  let comparator;

  beforeEach(() => {
    comparator = new Comparator();
  });

  describe('getCache', () => {
    it('should reveal the cache', () => {
      let cache = comparator.getCache();
      expect(cache).toBeDefined();
    });
  });


  describe('getDiff', () => {
    it('should return a diff for non existing keys', () => {
      let diff = comparator.getDiff('key that was previously not set', 'new value');
      expect(diff.length).toEqual(1);
    });

    it('should return a proper diff for an existng key', () => {
      comparator.getCache().set('some key', 'first line\nanother line');

      let diff = comparator.getDiff('some key', 'first line\nsecond line changed');
      expect(diff.length).toBeGreaterThan(0);
    });
  });


  describe('diffAndUpdate', () => {
    it('should update after returning the diff', () => {
      comparator.getCache().set('some key', 'first line\nanother line');

      let newValue = 'first line\nsecond line changed';
      let diff = comparator.diffAndUpdate('some key', newValue);
      expect(diff.length).toBeGreaterThan(0);

      expect(comparator.getCache().get('some key')).toEqual(newValue);
    });
  });
});
