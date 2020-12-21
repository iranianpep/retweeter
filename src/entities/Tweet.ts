import {Twitter} from 'twit';
import Helper from '../Helper';
import {ReTweetableAbstract, Validation} from '../ReTweetable';
import TweetUser, {TweetUserConfig} from './TweetUser';

export type TweetConfig = {
    minFavs: number,
    minFavsToFollowers: number,
    hashtagsLimit: number,
    userConfig: TweetUserConfig
};

export default class Tweet extends ReTweetableAbstract {
    rawTweet: Twitter.Status;
    tweetUser: TweetUser;
    config: TweetConfig;

    constructor(rawTweet: Twitter.Status, config: TweetConfig) {
        super();
        this.rawTweet = rawTweet;
        this.tweetUser = new TweetUser(this.rawTweet.user, config.userConfig);
        this.config = config;
    }

    isRetweet(): boolean {
        return this.rawTweet.retweeted || Helper.objectExists(this.rawTweet.retweeted_status);
    }

    isReply(): boolean {
        return Helper.objectExists(this.rawTweet.in_reply_to_screen_name)
        || Helper.objectExists(this.rawTweet.in_reply_to_status_id)
        || Helper.objectExists(this.rawTweet.in_reply_to_status_id_str)
        || Helper.objectExists(this.rawTweet.in_reply_to_user_id)
        || Helper.objectExists(this.rawTweet.in_reply_to_user_id_str);
    }

    isSensitive(): boolean {
        return Helper.objectExists(this.rawTweet.possibly_sensitive) && this.rawTweet.possibly_sensitive;
    }

    hasMinFavs(): boolean {
        return Helper.objectExists(this.rawTweet.favorite_count) && this.rawTweet.favorite_count >= this.config.minFavs;
    }

    hasMinFavsToFollowersRatio(): boolean {
        return Helper.objectExists(this.rawTweet.favorite_count) && this.rawTweet.favorite_count / this.rawTweet.user.followers_count >= this.config.minFavsToFollowers;
    }

    hasTooManyHashtags(): boolean {
        return this.rawTweet.entities.hashtags.length > this.config.hashtagsLimit;
    }

    isWithheld(): boolean {
        return Helper.objectExists(this.rawTweet.withheld_copyright) && this.rawTweet.withheld_copyright;
    }

    getRetweetValidations(): Validation[] {
        return [
            {
                validate: () => this.isRetweet(),
                message: () => 'Tweet is retweet'
            },
            {
                validate: () => this.isReply(),
                message: () => 'Tweet is reply'
            },
            {
                validate: () => this.isSensitive(),
                message: () => 'Tweet is sensitive'
            },
            {
                validate: () => !this.hasMinFavs(),
                message: () => 'Tweet does not have min favs'
            },
            {
                validate: () => !this.hasMinFavsToFollowersRatio(),
                message: () => 'Tweet does not have min favs to followers'
            },
            {
                validate: () => this.hasTooManyHashtags(),
                message: () => 'Tweet has too many hashtags'
            },
            {
                validate: () => this.isWithheld(),
                message: () => 'Tweet is withheld'
            },
            {
                validate: () => !this.tweetUser.isReTweetable(),
                message: () => this.tweetUser.retweetError
            },
        ];
    }
}