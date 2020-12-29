import {BotConfig} from '../..';
import {TweetConfig} from '../../entities/Tweet';
import {TweetUserConfig} from '../../entities/TweetUser';

export const getUserDefaultConfigs = (overrides?: Partial<TweetUserConfig>): TweetUserConfig => {
    const defaultConfigs: TweetUserConfig = {
        minCreationDiff: 30,
        minFollowers: 30,
        minTweets: 100,
        userBlocklist: []
    };

    return {...defaultConfigs, ...overrides};
};

export const getTweetDefaultConfigs = (overrides?: Partial<TweetConfig>, userConfigOverrides?: Partial<TweetUserConfig>): TweetConfig => {
    const defaultConfigs: TweetConfig = {
        minFavs: 3,
        minFavsToFollowers: 0.02,
        hashtagsLimit: 5,
        userConfig: getUserDefaultConfigs(userConfigOverrides),
        wordBlocklist: []
    };

    return {...defaultConfigs, ...overrides};
};

export const getBotConfig = (): BotConfig => {
    const apiConfig = {
        consumer_key: 'dummy',
        consumer_secret: 'dummy',
        access_token: 'dummy',
        access_token_secret: 'dummy',
        timeout_ms: 60 * 1000,
        strictSSL: false
    };

    return {
        screenName: 'dummy',
        apiConfig,
        tweetConfig: getTweetDefaultConfigs()
    };
};