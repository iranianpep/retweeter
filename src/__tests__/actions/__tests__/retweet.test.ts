import Twit from 'twit';
import Debug from 'debug';
import {getBotConfig, getTweetDefaultConfigs} from '../../__fixtures__/config';
import Tweet from '../../../entities/Tweet';
import {getRawTweet} from '../../__fixtures__/rawTweet';
import Bot from '../../..';
import Retweet from '../../../actions/Retweet';

jest.mock('twit');

const mockDebug = jest.fn();
jest.mock('debug', () => {
    return () => mockDebug;
});

describe('Retweet', () => {
    describe('run', () => {
        const botConfig = getBotConfig();
        const twit = new Twit(botConfig.apiConfig);
        const debug = Debug('dummy');
        const tweet = new Tweet(
            getRawTweet(),
            getTweetDefaultConfigs()
        );

        const retweet = new Retweet(
            botConfig,
            twit,
            debug
        );

        const onSuccess = jest.fn();

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should throw an error when api creds are invalid', async() => {
            expect.assertions(3);

            twit.post = jest.fn().mockImplementation(() => {
                throw new Error('Invalid or expired token.');
            });

            await expect(retweet.run({
                tweet
            }))
            .rejects
            .toThrow('Invalid or expired token.');

            expect(mockDebug).toBeCalledTimes(1);
            expect(mockDebug).toBeCalledWith('Retweeting tweet with id: \'123\' ...');
        });

        it('should run onSuccess if retweeting is successful and onSuccess is specifid', async() => {
            expect.assertions(5);

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await retweet.run({
                onSuccess,
                tweet
            });

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Retweeting tweet with id: \'123\' ...');
            expect(twit.post).toBeCalledWith('statuses/retweet/:id', {'id': '123'});
            expect(mockDebug).toBeCalledWith('Retweeted!');
            expect(onSuccess).toBeCalledWith(tweet);
        });

        it('should not run onSuccess if retweeting is successful but onSuccess is not specifid', async() => {
            expect.assertions(4);

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await retweet.run({
                tweet
            });

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Retweeting tweet with id: \'123\' ...');
            expect(twit.post).toBeCalledWith('statuses/retweet/:id', {'id': '123'});
            expect(mockDebug).toBeCalledWith('Retweeted!');
        });

        it('should not run onSuccess if retweeting is not successful', async() => {
            expect.assertions(6);

            twit.post = jest.fn()
            // retweet response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await expect(retweet.run({
                onSuccess,
                tweet
            }))
            .rejects
            .toThrow('Cannot retweet');

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Retweeting tweet with id: \'123\' ...');
            expect(twit.post).toBeCalledWith('statuses/retweet/:id', {'id': '123'});
            expect(onSuccess).not.toBeCalled();
            expect(mockDebug).toBeCalledWith('Cannot retweet.');
        });

        it('should log statusMessage if it is specified', async() => {
            expect.assertions(3);

            twit.post = jest.fn()
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404,
                    statusMessage: 'blah blah'
                }
            });

            await expect(retweet.run({
                onSuccess,
                tweet
            }))
            .rejects
            .toThrow('Cannot retweet');

            expect(mockDebug).toBeCalledTimes(3);
            expect(mockDebug).toBeCalledWith('blah blah');
        });
    });
});