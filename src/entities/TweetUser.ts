import moment from 'moment';
import {Twitter} from 'twit';
import Constant from '../Constant';
import Helper from '../Helper';
import {ReTweetableAbstract, Validation} from '../ReTweetable';

export type TweetUserConfig = {
    minCreationDiff: number,
    minFollowers: number,
    minTweets: number,
    userBlocklist?: string[]
};

export default class TweetUser extends ReTweetableAbstract {
    rawUser: Twitter.User;
    config: TweetUserConfig;

    constructor(rawUser: Twitter.User, config: TweetUserConfig) {
        super();
        this.rawUser = rawUser;
        this.config = config;
    }

    isPublic(): boolean {
        return !this.rawUser.protected;
    }

    isCreatedRecently(): boolean {
        const createdAt = moment(this.rawUser.created_at, Constant.TWITTER_DATETIME_FORMAT, Constant.LANG_EN);
        const now = moment();

        return now.diff(createdAt, Constant.MOMENT_DAYS) < this.config.minCreationDiff;
    }

    hasEnoughFollowers(): boolean {
        return this.rawUser.followers_count >= this.config.minFollowers;
    }

    hasEnoughTweets(): boolean {
        return this.rawUser.statuses_count >= this.config.minTweets;
    }

    isBlockListed(): boolean {
        return Helper.objectExists(this.config.userBlocklist) && this.config.userBlocklist.includes(this.rawUser.id_str);
    }

    getRetweetValidations(): Validation[] {
        return [
            {
                validate: () => this.isBlockListed(),
                message: () => 'User is in blocklist'
            },
            {
                validate: () => !this.isPublic(),
                message: () => 'User is not public'
            },
            {
                validate: () => this.isCreatedRecently(),
                message: () => 'User is created recently'
            },
            {
                validate: () => !this.hasEnoughFollowers(),
                message: () => 'User does not have enough followers'
            },
            {
                validate: () => !this.hasEnoughTweets(),
                message: () => 'User does not have enough tweets'
            }
        ];
    }
}