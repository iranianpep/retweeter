import Tweet from '../entities/Tweet';
import {AbstractAction, runArgs} from './Action';
import Helper from '../Helper';

interface runLikeArgs extends runArgs {
    tweet: Tweet
}

export default class Like extends AbstractAction {
    async run(args: runLikeArgs): Promise<void> {
        const {tweet, onSuccess} = args;

        this.debug(`Liking tweet with id: '${tweet.rawTweet.id_str}' ...`);
        const result = await this.twit.post('favorites/create', {
            id: tweet.rawTweet.id_str
        });

        if (this.isSuccessResponse(result)) {
            this.debug('Liked!');

            if (onSuccess) {
                onSuccess(tweet);
            }
        } else {
            this.debug('Cannot like.');
            if (Helper.objectExists(result.resp.statusMessage)) {
                this.debug(result.resp.statusMessage);
            }

            throw new Error('Cannot like');
        }
    }
}