import {Twitter} from 'twit';
import {getRawUser} from './rawUser';

export const getRawTweet = (
    tweetOverrides?: Partial<Twitter.Status>,
    userOverrides?: Partial<Twitter.User>
    ): Twitter.Status => {
    const defaultTweet: Twitter.Status = {
        id: 123,
        id_str: '123',
        created_at: '',
        entities: {
            hashtags: [],
            media: [],
            urls: [],
            user_mentions: [],
            symbols: [],
            polls: []
        },
        filter_level: 'none',
        is_quote_status: '',
        retweet_count: 0,
        retweeted: false,
        truncated: false,
        user: getRawUser(userOverrides)
    };

    return {...defaultTweet, ...tweetOverrides};
};