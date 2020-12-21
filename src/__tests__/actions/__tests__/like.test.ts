import Twit from 'twit';
import Debug from 'debug';
import Like from '../../../actions/Like';
import {getBotConfig, getTweetDefaultConfigs} from '../../__fixtures__/config';
import Tweet from '../../../entities/Tweet';
import {getRawTweet} from '../../__fixtures__/rawTweet';
import Bot from '../../..';

jest.mock('twit');

const mockDebug = jest.fn();
jest.mock('debug', () => {
    return jest.fn().mockImplementation(() => {
        return mockDebug;
    });
});

describe('Like', () => {
    describe('run', () => {
        const botConfig = getBotConfig();
        const twit = new Twit(botConfig.apiConfig);
        const debug = Debug('dummy');
        const tweet = new Tweet(
            getRawTweet(),
            getTweetDefaultConfigs()
        );

        const like = new Like(
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

            await expect(like.run({
                tweet
            }))
            .rejects
            .toThrow('Invalid or expired token.');

            expect(mockDebug).toBeCalledTimes(1);
            expect(mockDebug).toBeCalledWith('Liking tweet with id: \'123\' ...');
        });

        it('should run onSuccess if liking is successful and onSuccess is specified', async() => {
            expect.assertions(5);

            twit.post = jest.fn()
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await like.run({
                onSuccess,
                tweet
            });

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Liking tweet with id: \'123\' ...');
            expect(mockDebug).toBeCalledWith('Liked!');
            expect(onSuccess).toBeCalledTimes(1);
            expect(onSuccess).toBeCalledWith(tweet);
        });

        it('should not run onSuccess if liking is successful but onSuccess is not specified', async() => {
            expect.assertions(5);

            twit.post = jest.fn()
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 200
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await like.run({
                tweet
            });

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Liking tweet with id: \'123\' ...');
            expect(twit.post).toBeCalledWith('favorites/create', {'id': '123'});
            expect(mockDebug).toBeCalledWith('Liked!');
            expect(onSuccess).not.toBeCalled();
        });

        it('should not run onSuccess if liking is not successful', async() => {
            expect.assertions(6);

            twit.post = jest.fn()
            // like response
            .mockResolvedValueOnce({
                resp: {
                    statusCode: 404
                }
            });

            const bot = new Bot(botConfig);
            bot.twit = twit;

            await expect(like.run({
                onSuccess,
                tweet
            }))
            .rejects
            .toThrow('Cannot like');

            expect(mockDebug).toBeCalledTimes(2);
            expect(mockDebug).toBeCalledWith('Liking tweet with id: \'123\' ...');
            expect(twit.post).toBeCalledWith('favorites/create', {'id': '123'});
            expect(onSuccess).not.toBeCalled();
            expect(mockDebug).toBeCalledWith('Cannot like.');
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

            await expect(like.run({
                onSuccess,
                tweet
            }))
            .rejects
            .toThrow('Cannot like');

            expect(mockDebug).toBeCalledTimes(3);
            expect(mockDebug).toBeCalledWith('blah blah');
        });
    });
});