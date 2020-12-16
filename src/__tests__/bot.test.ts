import Twit from 'twit';
import Bot from '../index';
import {getRawTweet} from './__fixtures__/rawTweet';
import {getRawUser} from './__fixtures__/rawUser';
import {getTweetDefaultConfigs} from './tweet.test';

jest.mock('twit');

const mockDebug = jest.fn();
jest.mock('debug', () => {
    return () => mockDebug;
});

describe('Bot', () => {
    describe('retweet', () => {
        const apiConfig = {
            consumer_key: 'dummy',
            consumer_secret: 'dummy',
            access_token: 'dummy',
            access_token_secret: 'dummy',
            timeout_ms: 60 * 1000,
            strictSSL: false
        };

        const searchParams: Twit.Params = {
            q: '#مهاجرت',
            count: 10,
            result_type: 'recent',
            lang: 'fa',
            include_entities: true
        };

        let bot: Bot;

        beforeEach(() => {
            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs()
            });
        });

        it('should throw Invalid or expired token error when api creds are invalid', async() => {
            expect.assertions(1);

            bot.twit.get = jest.fn().mockImplementation(() => {
                throw new Error('Invalid or expired token.');
            });

            await expect(bot.retweet(searchParams))
            .rejects
            .toThrow('Invalid or expired token.');
        });

        it('should log the error if there is an error calling the search tweets endpoint', async() => {
            expect.assertions(4);

            const twit = new Twit(apiConfig);
            const response = {
                data: [],
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah'
                }
            } as Twit.PromiseResponse;

            twit.get = jest.fn().mockResolvedValue(response);

            bot.twit = twit;

            await expect(bot.retweet(searchParams))
            .rejects
            .toThrow('Cannot search recent tweets');

            expect(twit.get).toBeCalledWith('search/tweets', searchParams);
            expect(mockDebug).toBeCalledWith('Cannot search recent tweets.');
            expect(mockDebug).toBeCalledWith('blah');
        });

        it('should log the error if there is an error calling search retweet endpoint', async() => {
            expect.assertions(3);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);

            const rawTweetableTweet = getRawTweet({
                id_str: '789',
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });

            const mockData: Twit.Twitter.SearchResults = {
                statuses: [
                    rawTweetableTweet
                ],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            })
            // searchRetweetedTweets response
            .mockResolvedValueOnce({
                data: [],
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah blah'
                }
            });

            bot.twit = twit;

            await expect(bot.retweet(searchParams))
            .rejects
            .toThrow('Cannot search recent retweets');

            expect(mockDebug).toBeCalledWith('Cannot search recent retweets.');
            expect(mockDebug).toBeCalledWith('blah blah');
        });

        it('should return null when no tweet is found', async() => {
            expect.assertions(3);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);
            const mockData: Twit.Twitter.SearchResults = {
                statuses: [],
                search_metadata: {}
            };

            twit.get = jest.fn()
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            });

            bot.twit = twit;

            const result = await bot.retweet(searchParams);

            expect(twit.get).toBeCalledWith('search/tweets', searchParams);
            expect(mockDebug).toBeCalledWith('Found no tweets.');
            expect(result).toBeUndefined();
        });

        it('should ignore found tweets if they have been already tweeted', async() => {
            expect.assertions(5);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);

            const rawTweetableTweet = getRawTweet({
                id_str: '789',
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });

            const rawRetweet = getRawTweet({
                retweeted: true,
                retweeted_status: getRawTweet({
                    id_str: '789'
                })
            });

            const randomTweet = getRawTweet();

            const mockData: Twit.Twitter.SearchResults = {
                statuses: [
                    rawTweetableTweet
                ],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            })
            // searchRetweetedTweets response
            .mockResolvedValueOnce({
                data: [rawRetweet, randomTweet],
                resp: {
                    statusCode: 200
                }
            });


            bot.twit = twit;

            await bot.retweet(searchParams);

            expect(mockDebug).toBeCalledWith('Searching recent retweets by user: \'dummy\' ...');
            expect(mockDebug).toBeCalledWith('Found \'1\' retweet(s).');
            expect(mockDebug).toBeCalledWith('1. Tweet with id: \'789\' may be retweeted!');
            expect(mockDebug).toBeCalledWith('Checking to see if tweet with id: \'789\' has been already retweeted ...');
            expect(mockDebug).toBeCalledWith('Tweet with id: \'789\' has been already tweeted.');
        });

        it('should make an API call to the search endpoint with the correct params and handle 200', async() => {
            expect.assertions(2);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);

            const rawTweetableTweet = getRawTweet({
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });
            const rawNotTweetableTweet = getRawTweet({
                retweeted: true
            });
            const mockData: Twit.Twitter.SearchResults = {
                statuses: [
                    rawTweetableTweet,
                    rawNotTweetableTweet
                ],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            })
            // searchRetweetedTweets response
            .mockResolvedValueOnce({
                data: [],
                resp: {
                    statusCode: 200
                }
            });

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            })
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            });

            bot.twit = twit;

            await bot.retweet(searchParams);

            expect(twit.get).toBeCalledWith('search/tweets', searchParams);
            expect(mockDebug).toBeCalledWith('Found 2 tweet(s).');
        });

        it('should log the error if there is an when retweeting', async() => {
            expect.assertions(3);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);

            const rawTweetableTweet = getRawTweet({
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });

            const mockData: Twit.Twitter.SearchResults = {
                statuses: [
                    rawTweetableTweet
                ],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            })
            // searchRetweetedTweets response
            .mockResolvedValueOnce({
                data: [],
                resp: {
                    statusCode: 200
                }
            });

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah'
                }
            });

            bot.twit = twit;

            await expect(bot.retweet(searchParams))
            .rejects
            .toThrow('Cannot retweet');

            expect(mockDebug).toBeCalledWith('Cannot retweet.');
            expect(mockDebug).toBeCalledWith('blah');
        });

        it('should log the error if there is an when liking', async() => {
            expect.assertions(3);

            bot = new Bot({
                screenName: 'dummy',
                apiConfig,
                tweetConfig: getTweetDefaultConfigs({
                    userConfig: {
                        minCreationDiff: 1,
                        minFollowers: 5,
                        minTweets: 5
                    }
                })
            });

            const twit = new Twit(apiConfig);

            const rawTweetableTweet = getRawTweet({
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });

            const mockData: Twit.Twitter.SearchResults = {
                statuses: [
                    rawTweetableTweet
                ],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            })
            // searchRetweetedTweets response
            .mockResolvedValueOnce({
                data: [],
                resp: {
                    statusCode: 200
                }
            });

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            })
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah'
                }
            });

            bot.twit = twit;

            await expect(bot.retweet(searchParams))
            .rejects
            .toThrow('Cannot like');

            expect(mockDebug).toBeCalledWith('Cannot like.');
            expect(mockDebug).toBeCalledWith('blah');
        });
    });
});