import Twit from 'twit';
import Debug from 'debug';
import {getBotConfig} from '../../__fixtures__/config';
import Search from '../../../actions/Search';
import {getRawTweet} from '../../__fixtures__/rawTweet';
import {getRawUser} from '../../__fixtures__/rawUser';

jest.mock('twit');

const mockDebug = jest.fn();
jest.mock('debug', () => {
    return jest.fn().mockImplementation(() => {
        return mockDebug;
    });
});

jest.mock('debug');

describe('Search', () => {
    const botConfig = getBotConfig();
    const twit = new Twit(botConfig.apiConfig);
    const debug = Debug('dummy');

    const search = new Search(
        botConfig,
        twit,
        debug
    );

    const searchParams: Twit.Params = {
        q: '#مهاجرت',
        count: 10,
        result_type: 'recent',
        lang: 'fa',
        include_entities: true
    };

    const onSuccess = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('run', () => {
        it('should throw an error when api creds are invalid', async() => {
            expect.assertions(5);

            twit.get = jest.fn().mockImplementation(() => {
                throw new Error('Invalid or expired token.');
            });

            await expect(search.run({
                searchParams
            }))
            .rejects
            .toThrow('Invalid or expired token.');

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Searching recent tweets with the following params ...');
            expect(mockDebug).toBeCalledWith(searchParams);
            expect(onSuccess).not.toBeCalled();
        });

        it('should throw an error when searching recent tweets is not successful', async() => {
            expect.assertions(2);

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404
                }
            });

            await expect(search.run({
                searchParams
            }))
            .rejects
            .toThrow('Cannot search recent tweets');

            expect(mockDebug).toBeCalledWith('Cannot search recent tweets.');
        });

        it('should log status message if it is specified and tweet is not successful', async() => {
            expect.assertions(2);

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah blah'
                }
            });

            await expect(search.run({
                searchParams
            }))
            .rejects
            .toThrow('Cannot search recent tweets');

            expect(mockDebug).toBeCalledWith('blah blah');
        });

        it('should throw an error when searching recent retweets is not successful', async() => {
            expect.assertions(2);

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
                resp: {
                    statusCode: 404
                }
            });

            await expect(search.run({
                searchParams
            }))
            .rejects
            .toThrow('Cannot search recent retweets');

            expect(mockDebug).toBeCalledWith('Cannot search recent retweets.');
        });

        it('should log status message if it is specified and retweet is not successful', async() => {
            expect.assertions(2);

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
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah blah'
                }
            });

            await expect(search.run({
                searchParams
            }))
            .rejects
            .toThrow('Cannot search recent retweets');

            expect(mockDebug).toBeCalledWith('blah blah');
        });

        it('should search for recent tweets and log even if finds nothing', async() => {
            expect.assertions(4);

            const mockData: Twit.Twitter.SearchResults = {
                statuses: [],
                search_metadata: {}
            };

            twit.get = jest.fn()
            // search response
            .mockResolvedValueOnce({
                data: mockData,
                resp: {
                    statusCode: 200
                }
            });

            await search.run({
                searchParams
            });

            expect(twit.get).toBeCalledWith('search/tweets', searchParams);
            expect(mockDebug).toBeCalledWith('Searching recent tweets with the following params ...');
            expect(mockDebug).toBeCalledWith('Search successfully completed!');
            expect(mockDebug).toBeCalledWith('Found no tweets.');
        });

        it('should search and retweet retweetable tweets', async() => {
            expect.assertions(14);

            const rawTweetableTweet = getRawTweet({
                favorite_count: 100,
                user: getRawUser({
                    followers_count: 1000,
                    statuses_count: 1000,
                })
            });
            const rawNotTweetableTweet = getRawTweet({
                id: 967,
                id_str: '967',
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

            await search.run({
                searchParams
            });

            expect(mockDebug).toBeCalledTimes(10);
            expect(mockDebug).toBeCalledWith('Searching recent tweets with the following params ...');
            expect(mockDebug).toBeCalledWith(searchParams);
            expect(twit.get).toBeCalledWith('search/tweets', searchParams);
            expect(mockDebug).toBeCalledWith('Search successfully completed!');
            expect(mockDebug).toBeCalledWith('Found \'2\' tweet(s).');
            expect(mockDebug).toBeCalledWith('Searching recent retweets by user: \'dummy\' ...');
            expect(twit.get).toBeCalledWith('statuses/user_timeline', {
                screen_name: 'dummy',
                // max allowed is 200
                count: 200,
                exclude_replies: true,
                include_rts: true
            });
            expect(mockDebug).toBeCalledWith('Found \'0\' retweet(s).');
            expect(mockDebug).toBeCalledWith('1. Tweet with id: \'123\' may be retweeted!');
            expect(mockDebug).toBeCalledWith('2. Tweet with id: \'967\' is not retweetable because: Tweet is retweet.');
            expect(mockDebug).toBeCalledWith('Checking to see if tweet with id: \'123\' has been already retweeted ...');
            expect(mockDebug).toBeCalledWith('Tweet with id: \'123\' has NOT been tweeted.');
            expect(onSuccess).not.toBeCalled();
        });

        it('should call onSuccess if retweet is successful', async() => {
            expect.assertions(1);

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

            await search.run({
                searchParams,
                onSuccess
            });

            expect(onSuccess).toBeCalledTimes(1);
        });

        it('should search and ignore already retweeted tweets', async() => {
            expect.assertions(3);

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

            // cover the scenario when there is a retweet one, but the ids are different
            const rawRetweet2 = getRawTweet({
                retweeted: true,
                retweeted_status: getRawTweet({
                    id_str: '999'
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
                data: [rawRetweet2, rawRetweet, randomTweet],
                resp: {
                    statusCode: 200
                }
            });

            await search.run({
                searchParams,
                onSuccess
            });

            expect(mockDebug).toBeCalledWith('Found \'2\' retweet(s).');
            expect(mockDebug).toBeCalledWith('Tweet with id: \'789\' has been already tweeted.');
            expect(onSuccess).not.toBeCalled();
        });
    });
});
