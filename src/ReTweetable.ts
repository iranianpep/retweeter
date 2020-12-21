export interface ReTweetableInterface {
    retweetError: string;

    isReTweetable(): boolean;
    getRetweetValidations(): Validation[];
}

export type Validation = {
    validate: () => boolean,
    message: () => string
};

export abstract class ReTweetableAbstract implements ReTweetableInterface {
    retweetError = '';

    abstract getRetweetValidations(): Validation[];

    isReTweetable(): boolean {
        const validations = this.getRetweetValidations();

        for (const validation of validations) {
            if (validation.validate()) {
                this.retweetError = validation.message();
                return false;
            }
        }

        return true;
    }
}
