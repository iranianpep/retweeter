import Twit from 'twit';
import Debug from 'debug';
import Tweet, {TweetConfig} from './Tweet';
import Helper from './Helper';
import Constant from './Constant';

type BotConfig = {
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
        this.debug = Helper.objectExists(config.debugNamespace) ? Debug(config.debugNamespace) : Debug(Constant.DEBUGGER_DEFAULT_NAMESPACE);
    }

    async retweet(searchParams: Twit.Params): Promise<void> {
        const tweets = await this.search(searchParams);

        if (!Helper.objectExists(tweets) || tweets.length === 0) {
            this.debug('Found no tweets.');
            return;
        }

        this.debug(`Found ${tweets.length} tweet(s).`);

        const retweetedTweets = await this.searchRetweetedTweets();

        let count = 0;
        for (const tweet of tweets) {
            count++;

            if (!tweet.isReTweetable()) {
                this.debug(`${count}. Tweet with id: '${tweet.rawTweet.id_str}' is not retweetable because: ${tweet.retweetError}.`);
                continue;
            }

            this.debug(`${count}. Tweet with id: '${tweet.rawTweet.id_str}' may be retweeted!`);

            if (this.hasAlreadyReTweeted(retweetedTweets, tweet)) {
                continue;
            }

            this.debug(`Retweeting tweet with id: '${tweet.rawTweet.id_str}' ...`);
            const result = await this.twit.post('statuses/retweet/:id', {
                id: tweet.rawTweet.id_str
            });

            if (result.resp.statusCode === 200) {
                this.debug('Retweeted!');
                this.debug('Liking ...');

                const result = await this.twit.post('favorites/create', {
                    id: tweet.rawTweet.id_str
                });

                if (result.resp.statusCode === 200) {
                    this.debug('Liked!');
                } else {
                    this.debug('Cannot like.');
                    if (Helper.objectExists(result.resp.statusMessage)) {
                        this.debug(result.resp.statusMessage);
                    }

                    throw new Error('Cannot like');
                }
            } else {
                this.debug('Cannot retweet.');
                if (Helper.objectExists(result.resp.statusMessage)) {
                    this.debug(result.resp.statusMessage);
                }

                throw new Error('Cannot retweet');
            }
        }

        this.debug('All done.');
    }

    private async search(searchParams: Twit.Params): Promise<Tweet[]> {
        this.debug('Searching recent tweets with the following params ...');
        this.debug(searchParams);

        const result = await this.twit.get('search/tweets', searchParams);

        if (result.resp.statusCode === 200 && Helper.objectExists(result.data)) {
            this.debug('Search successfully completed!');

            const statuses = (result.data as Twit.Twitter.SearchResults).statuses;

            return this.toTweets(statuses);
        } else {
            this.debug('Cannot search recent tweets.');
            if (Helper.objectExists(result.resp.statusMessage)) {
                this.debug(result.resp.statusMessage);
            }

            throw new Error('Cannot search recent tweets');
        }
    }

    private async searchRetweetedTweets(): Promise<Tweet[]> {
        this.debug(`Searching recent retweets by user: '${this.config.screenName}' ...`);

        const result = await this.twit.get('statuses/user_timeline', {
            screen_name: this.config.screenName,
            // max allowed is 200
            count: 200,
            exclude_replies: true,
            include_rts: true
        });

        if (result.resp.statusCode === 200 && Helper.objectExists(result.data)) {
            const recentTweets = result.data as Twit.Twitter.Status[];

            const retweets = this.toTweets(recentTweets, true);
            this.debug(`Found '${retweets.length}' retweet(s).`);

            return retweets;
        } else {
            this.debug('Cannot search recent retweets.');
            if (Helper.objectExists(result.resp.statusMessage)) {
                this.debug(result.resp.statusMessage);
            }

            throw new Error('Cannot search recent retweets');
        }
    }

    private toTweets(statuses: Twit.Twitter.Status[], onlyRetweets = false): Tweet[] {
        const tweets: Tweet[] = [];

        let tweet: Tweet;
        for (const status of statuses) {
            tweet = new Tweet(status, this.config.tweetConfig);

            if (onlyRetweets && !tweet.isRetweet()) {
                continue;
            }

            tweets.push(tweet);
        }

        return tweets;
    }

    private hasAlreadyReTweeted(retweetedTweets: Tweet[], tweet: Tweet): boolean {
        this.debug(`Checking to see if tweet with id: '${tweet.rawTweet.id_str}' has been already retweeted ...`);

        for (const recentTweet of retweetedTweets) {
            if (recentTweet.rawTweet.retweeted_status && recentTweet.rawTweet.retweeted_status.id_str === tweet.rawTweet.id_str) {
                this.debug(`Tweet with id: '${tweet.rawTweet.id_str}' has been already tweeted.`);
                return true;
            }
        }

        this.debug(`Tweet with id: '${tweet.rawTweet.id_str}' has NOT been tweeted.`);

        return false;
    }
}