import Tweet from '../../entities/Tweet';
import {getTweetDefaultConfigs} from '../__fixtures__/config';
import {getRawTweet} from '../__fixtures__/rawTweet';
import {getRawUser} from '../__fixtures__/rawUser';

describe('Tweet', () => {
    describe('isRetweet', () => {
        it('should return true if tweet is retweet', () => {
            const tweet = new Tweet(getRawTweet({
                retweeted: true
            }), getTweetDefaultConfigs());

            expect(tweet.isRetweet()).toBe(true);
        });

        it('should return false if tweet is not retweet', () => {
            const tweet = new Tweet(getRawTweet(), getTweetDefaultConfigs());

            expect(tweet.isRetweet()).toBe(false);
        });
    });

    describe('isReply', () => {
        it('should return true if tweet is reply', () => {
            const tweet = new Tweet(getRawTweet({
                in_reply_to_status_id_str: '123'
            }), getTweetDefaultConfigs());

            expect(tweet.isReply()).toBe(true);
        });

        it('should return false if tweet is not reply', () => {
            const tweet = new Tweet(getRawTweet(), getTweetDefaultConfigs());

            expect(tweet.isReply()).toBe(false);
        });
    });

    describe('isSensitive', () => {
        it('should return true if tweet is sensitive', () => {
            const tweet = new Tweet(getRawTweet({
                possibly_sensitive: true
            }), getTweetDefaultConfigs());

            expect(tweet.isSensitive()).toBe(true);
        });

        it('should return false if tweet is not sensitive', () => {
            const tweet = new Tweet(getRawTweet(), getTweetDefaultConfigs());

            expect(tweet.isSensitive()).toBe(false);
        });
    });

    describe('hasMinFavs', () => {
        it('should return true if tweet has enough favs', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 1000
            }), getTweetDefaultConfigs({
                minFavs: 5
            }));

            expect(tweet.hasMinFavs()).toBe(true);
        });

        it('should return false if tweet does not have enough favs', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 4
            }), getTweetDefaultConfigs({
                minFavs: 5
            }));

            expect(tweet.hasMinFavs()).toBe(false);
        });
    });

    describe('hasMinFavsToFollowersRatio', () => {
        it('should return true if user has enough min favs to followers ratio', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 50,
                user: getRawUser({
                    followers_count: 50
                })
            }), getTweetDefaultConfigs({
                minFavsToFollowers: 0.8
            }));

            expect(tweet.hasMinFavsToFollowersRatio()).toBe(true);
        });

        it('should return false if user does not have enough min favs to followers ratio', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 50,
                user: getRawUser({
                    followers_count: 10000
                })
            }), getTweetDefaultConfigs());

            expect(tweet.hasMinFavsToFollowersRatio()).toBe(false);
        });
    });

    describe('hasTooManyHashtags', () => {
        it('should return true if tweet has too many hashtags', () => {
            const tweet = new Tweet(getRawTweet({
                entities: {
                    hashtags: [
                        {
                            indices: [1, 1],
                            text: 'blah blah'
                        },
                        {
                            indices: [1, 1],
                            text: 'blah2 blah2'
                        }
                    ],
                    media: [],
                    urls: [],
                    user_mentions: [],
                    symbols: [],
                    polls: []
                }
            }), getTweetDefaultConfigs({
                hashtagsLimit: 1
            }));

            expect(tweet.hasTooManyHashtags()).toBe(true);
        });

        it('should return false if tweet does not have too many hashtags', () => {
            const tweet = new Tweet(getRawTweet(), getTweetDefaultConfigs());
            expect(tweet.hasTooManyHashtags()).toBe(false);
        });
    });

    describe('isWithheld', () => {
        it('should return true if tweet is withheld', () => {
            const tweet = new Tweet(getRawTweet({
                withheld_copyright: true
            }), getTweetDefaultConfigs());

            expect(tweet.isWithheld()).toBe(true);
        });

        it('should return false if tweet is not withheld', () => {
            const tweet = new Tweet(getRawTweet(), getTweetDefaultConfigs());

            expect(tweet.isWithheld()).toBe(false);
        });
    });

    describe('hasBlockListedWord', () => {
        it('should return true if word block list is in tweet', () => {
            const tweet = new Tweet(
                getRawTweet({
                    text: 'this tweet has a bad word in it تست '
                }),
                getTweetDefaultConfigs({
                    wordBlocklist: [' تست ']
                })
            );

            expect(tweet.hasBlockListedWord()).toBe(true);
        });

        it('should return false if word block list is empty', () => {
            const tweet = new Tweet(
                getRawTweet(),
                getTweetDefaultConfigs()
            );

            expect(tweet.hasBlockListedWord()).toBe(false);
        });

        it('should return false if tweet text is empty', () => {
            const tweet = new Tweet(
                getRawTweet({
                    text: ''
                }),
                getTweetDefaultConfigs({
                    wordBlocklist: ['bad', 'worst']
                })
            );

            expect(tweet.hasBlockListedWord()).toBe(false);
        });

        it('should return false if word block list is NOT in tweet', () => {
            const tweet = new Tweet(
                getRawTweet({
                    text: 'this is a good tweet'
                }),
                getTweetDefaultConfigs({
                    wordBlocklist: ['bad', 'worst']
                })
            );

            expect(tweet.hasBlockListedWord()).toBe(false);
        });
    });

    describe('isReTweetable', () => {
        it('should return true if tweet is eligible to be retweeted', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs({
                userConfig: {
                    minCreationDiff: 1,
                    minFollowers: 5,
                    minTweets: 5
                }
            }));

            expect(tweet.isReTweetable()).toBe(true);
        });

        it('should return false if tweet is retweet', () => {
            const tweet = new Tweet(getRawTweet({
                retweeted: true,
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet is retweet');
        });

        it('should return false if tweet is reply', () => {
            const tweet = new Tweet(getRawTweet({
                in_reply_to_user_id_str: '123',
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet is reply');
        });

        it('should return false if tweet is sensitive', () => {
            const tweet = new Tweet(getRawTweet({
                possibly_sensitive: true,
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet is sensitive');
        });

        it('should return false if tweet is sensitive', () => {
            const tweet = new Tweet(getRawTweet({
                possibly_sensitive: true,
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet is sensitive');
        });

        it('should return false if tweet does not have enough favs', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 1,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet does not have min favs');
        });

        it('should return false if tweet does not have enough favs to followers', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 10,
                user: getRawUser({
                    followers_count: 1000000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet does not have min favs to followers');
        });

        it('should return false if tweet has too many hashtags', () => {
            const tweet = new Tweet(getRawTweet({
                entities: {
                    hashtags: [
                        {
                            indices: [1, 1],
                            text: 'blah blah'
                        }
                    ],
                    media: [],
                    urls: [],
                    user_mentions: [],
                    symbols: [],
                    polls: []
                },
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs({
                hashtagsLimit: 0
            }));

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet has too many hashtags');
        });

        it('should return false if tweet is withheld', () => {
            const tweet = new Tweet(getRawTweet({
                withheld_copyright: true,
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet is withheld');
        });

        it('should return false if tweet has a block listed word', () => {
            const tweet = new Tweet(getRawTweet({
                text: 'this tweet is the worst.',
                favorite_count: 1000,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs({
                wordBlocklist: ['worst']
            }));

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('Tweet has block listed word in it');
        });

        it('should return false if user is not eligible', () => {
            const tweet = new Tweet(getRawTweet({
                favorite_count: 1000,
                user: getRawUser({
                    protected: true,
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            }), getTweetDefaultConfigs());

            expect(tweet.isReTweetable()).toBe(false);
            expect(tweet.retweetError).toBe('User is not public');
        });
    });

    describe('getText', () => {
        it('should return full text if it is truncated', () => {
            const tweet = new Tweet(
                getRawTweet({
                    truncated: true,
                    full_text: 'this is the full text'
                }),
                getTweetDefaultConfigs()
            );

            expect(tweet.getText()).toBe('this is the full text');
        });

        it('should return text if it is not truncated', () => {
            const tweet = new Tweet(
                getRawTweet({
                    truncated: false,
                    text: 'this is the text'
                }),
                getTweetDefaultConfigs()
            );

            expect(tweet.getText()).toBe('this is the text');
        });
    });
});