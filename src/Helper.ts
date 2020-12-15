export default class Helper {
    static objectExists<T>(obj: T | undefined | null): obj is T {
        return obj !== undefined && obj !== null;
    }

    static mockObjectProperty = <T, K extends keyof T>(object: T, property: K, value: T[K]): void => {
        Object.defineProperty(object, property, {get: () => value});
    };
}