import {Twitter} from 'twit';
import Helper from './Helper';
import {ReTweetableAbstract} from './ReTweetable';
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

    isReTweetable(): boolean {
        if (this.isRetweet()) {
            this.retweetError = 'Tweet is retweet';
            return false;
        }

        if (this.isReply()) {
            this.retweetError = 'Tweet is reply';
            return false;
        }

        if (this.isSensitive()) {
            this.retweetError = 'Tweet is sensitive';
            return false;
        }

        if (!this.hasMinFavs()) {
            this.retweetError = 'Tweet does not have min favs';
            return false;
        }

        if (!this.hasMinFavsToFollowersRatio()) {
            this.retweetError = 'Tweet does not have min favs to followers';
            return false;
        }

        if (this.hasTooManyHashtags()) {
            this.retweetError = 'Tweet has too many hashtags';
            return false;
        }

        if (this.isWithheld()) {
            this.retweetError = 'Tweet is withheld';
            return false;
        }

        if (!this.tweetUser.isReTweetable()) {
            this.retweetError = this.tweetUser.retweetError;
            return false;
        }

        return true;
    }
}