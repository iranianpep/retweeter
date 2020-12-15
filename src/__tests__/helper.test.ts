import Helper from '../Helper';

describe('Helper', () => {
    describe('objectExists', () => {
        it('should return false if an item does not have a value', () => {
            expect(Helper.objectExists(null)).toBe(false);
            expect(Helper.objectExists(undefined)).toBe(false);
        });

        it('should return true if an item has a value', () => {
            expect(Helper.objectExists({})).toBe(true);
            expect(Helper.objectExists(['test'])).toBe(true);
        });
    });

    describe('mockObjectProperty', () => {
        it('should overwrite the object property value', () => {
            const dummy = {
                test: 1
            };

            Helper.mockObjectProperty(dummy, 'test', 5);

            expect(dummy.test).toBe(5);
        });
    });
});
