import Tweet from '../entities/Tweet';
import {AbstractAction, runArgs} from './Action';
import Helper from '../Helper';

interface runRetweetArgs extends runArgs {
    tweet: Tweet
}

export default class Retweet extends AbstractAction {
    async run(args: runRetweetArgs): Promise<void> {
        const {tweet, onSuccess} = args;

        this.debug(`Retweeting tweet with id: '${tweet.rawTweet.id_str}' ...`);
        const result = await this.twit.post('statuses/retweet/:id', {
            id: tweet.rawTweet.id_str
        });

        if (this.isSuccessResponse(result)) {
            this.debug('Retweeted!');

            if (onSuccess) {
                onSuccess(tweet);
            }
        } else {
            this.debug('Cannot retweet.');
            if (Helper.objectExists(result.resp.statusMessage)) {
                this.debug(result.resp.statusMessage);
            }

            throw new Error('Cannot retweet');
        }
    }
}