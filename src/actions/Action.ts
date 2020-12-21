import Twit from 'twit';
import Debug from 'debug';
import {BotConfig} from '..';
import Tweet from '../entities/Tweet';

export interface runArgs {
    onSuccess?: onSuccessType
}

type onSuccessType = (tweet: Tweet) => Promise<void>;

export abstract class AbstractAction {
    config: BotConfig;
    twit: Twit;
    debug: Debug.Debugger;

    constructor(config: BotConfig, twit: Twit, debug: Debug.Debugger) {
        this.config = config;
        this.twit = twit;
        this.debug = debug;
    }

    abstract run(args: runArgs): void;

    protected isSuccessResponse(response: Twit.PromiseResponse): boolean {
        return response.resp.statusCode === 200;
    }
}