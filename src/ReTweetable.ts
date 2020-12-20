export interface ReTweetableInterface {
    retweetError: string;

    isReTweetable(): boolean;
}

export abstract class ReTweetableAbstract implements ReTweetableInterface {
    retweetError = '';

    abstract isReTweetable(): boolean;
}
