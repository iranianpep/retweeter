import moment from 'moment';
import Constant from '../../Constant';
import TweetUser from '../../entities/TweetUser';
import {getUserDefaultConfigs} from '../__fixtures__/config';
import {getRawUser} from '../__fixtures__/rawUser';

describe('TweetUser', () => {
    describe('isPublic', () => {
        it('should return true if user is public', () => {
            const tweetUser = new TweetUser(getRawUser(), getUserDefaultConfigs());

            expect(tweetUser.isPublic()).toBe(true);
        });

        it('should return false if user is protected', () => {
            const tweetUser = new TweetUser(getRawUser({
                protected: true
            }), getUserDefaultConfigs());

            expect(tweetUser.isPublic()).toBe(false);
        });
    });

    describe('isCreatedRecently', () => {
        it('should return true if user is created recently', () => {
            const today = moment().format(Constant.TWITTER_DATETIME_FORMAT);
            const tweetUser = new TweetUser(getRawUser({
                created_at: today
            }), getUserDefaultConfigs({
                minCreationDiff: 1
            }));

            expect(tweetUser.isCreatedRecently()).toBe(true);
        });

        it('should return false if user is not created recently', () => {
            const tweetUser = new TweetUser(getRawUser(), getUserDefaultConfigs());

            expect(tweetUser.isCreatedRecently()).toBe(false);
        });
    });

    describe('hasEnoughFollowers', () => {
        it('should return true if user has enough followers', () => {
            const tweetUser = new TweetUser(getRawUser({
                followers_count: 5
            }), getUserDefaultConfigs({
                minFollowers: 5
            }));

            expect(tweetUser.hasEnoughFollowers()).toBe(true);
        });

        it('should return false if user does not have enough followers', () => {
            const tweetUser = new TweetUser(getRawUser({
                followers_count: 4
            }), getUserDefaultConfigs());

            expect(tweetUser.hasEnoughFollowers()).toBe(false);
        });
    });

    describe('hasEnoughTweets', () => {
        it('should return true if user has enough tweets', () => {
            const tweetUser = new TweetUser(getRawUser({
                statuses_count: 5
            }), getUserDefaultConfigs({
                minTweets: 5
            }));

            expect(tweetUser.hasEnoughTweets()).toBe(true);
        });

        it('should return false if user does not have enough tweets', () => {
            const tweetUser = new TweetUser(getRawUser({
                statuses_count: 4
            }), getUserDefaultConfigs());

            expect(tweetUser.hasEnoughTweets()).toBe(false);
        });
    });

    describe('isBlockListed', () => {
        it('should return true if user id_str is in blocklist', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '321'
            }), getUserDefaultConfigs({
                userBlocklist: ['321']
            }));

            expect(tweetUser.isBlockListed()).toBe(true);
        });

        it('should return false if user id_str is not in blocklist', () => {
            const tweetUser = new TweetUser(getRawUser(), getUserDefaultConfigs());

            expect(tweetUser.isBlockListed()).toBe(false);
        });
    });

    describe('isReTweetable', () => {
        it('should return true if tweet is eligible to be retweeted', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: false,
                followers_count: 1000,
                statuses_count: 1000
            }), getUserDefaultConfigs({
                minCreationDiff: 1,
                minFollowers: 5,
                minTweets: 5
            }));

            expect(tweetUser.isReTweetable()).toBe(true);
            expect(tweetUser.retweetError).toBe('');
        });

        it('should return false if user is blocklisted', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: false,
                followers_count: 1000,
                statuses_count: 1000
            }), getUserDefaultConfigs({
                userBlocklist: ['12345']
            }));

            expect(tweetUser.isReTweetable()).toBe(false);
            expect(tweetUser.retweetError).toBe('User is in blocklist');
        });

        it('should return false if user is protected', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: true,
                followers_count: 1000,
                statuses_count: 1000
            }), getUserDefaultConfigs());

            expect(tweetUser.isReTweetable()).toBe(false);
            expect(tweetUser.retweetError).toBe('User is not public');
        });

        it('should return false if user is created recently', () => {
            const today = moment().format(Constant.TWITTER_DATETIME_FORMAT);
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: false,
                created_at: today,
                followers_count: 1000,
                statuses_count: 1000
            }), getUserDefaultConfigs());

            expect(tweetUser.isReTweetable()).toBe(false);
            expect(tweetUser.retweetError).toBe('User is created recently');
        });

        it('should return false if user does not have enough followers', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: false,
                followers_count: 1,
                statuses_count: 1000
            }), getUserDefaultConfigs());

            expect(tweetUser.isReTweetable()).toBe(false);
            expect(tweetUser.retweetError).toBe('User does not have enough followers');
        });

        it('should return false if user does not have enough tweets', () => {
            const tweetUser = new TweetUser(getRawUser({
                id_str: '12345',
                protected: false,
                followers_count: 1000,
                statuses_count: 1
            }), getUserDefaultConfigs());

            expect(tweetUser.isReTweetable()).toBe(false);
            expect(tweetUser.retweetError).toBe('User does not have enough tweets');
        });
    });
});