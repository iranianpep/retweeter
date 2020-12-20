import Twit from 'twit';
import Debug from 'debug';
import Tweet, {TweetConfig} from './entities/Tweet';
import Helper from './Helper';
import Constant from './Constant';
import Like from './actions/Like';
import Retweet from './actions/Retweet';
import Search from './actions/Search';

export type BotConfig = {
    screenName: string,
    debugNamespace?: string,
    apiConfig: Twit.Options,
    tweetConfig: TweetConfig
};

export default class Bot {
    twit: Twit;
    config: BotConfig;
    debug: Debug.Debugger;

    constructor(config: BotConfig) {
        this.twit = new Twit(config.apiConfig);
        this.config = config;
        this.debug = Helper.objectExists(config.debugNamespace) && config.debugNamespace ? Debug(config.debugNamespace) : Debug(Constant.DEBUGGER_DEFAULT_NAMESPACE);
    }

    async retweet(searchParams: Twit.Params): Promise<void> {
        const like = new Like(this.config, this.twit, this.debug);
        const likeOnSuccess = async(tweet: Tweet) => await like.run({
            tweet
        });

        const retweet = new Retweet(this.config, this.twit, this.debug);
        const retweetOnSuccess = async(tweet: Tweet) => await retweet.run({
            tweet,
            onSuccess: likeOnSuccess
        });

        const search = new Search(this.config, this.twit, this.debug);
        await search.run({
            searchParams,
            onSuccess: retweetOnSuccess
        });

        this.debug('All done.');
    }
}