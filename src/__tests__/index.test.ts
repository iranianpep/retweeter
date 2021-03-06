import Twit from 'twit';
import Debug from 'debug';
import Bot from '..';
import Like from '../actions/Like';
import Retweet from '../actions/Retweet';
import {getBotConfig} from './__fixtures__/config';
import Constant from '../Constant';

const mockDebug = jest.fn();
jest.mock('debug', () => {
    return jest.fn().mockImplementation(() => {
        return mockDebug;
    });
});

jest.mock('../actions/Like');
jest.mock('../actions/Retweet');

const mockRun = jest.fn();
jest.mock('../actions/Search', () => {
    return jest.fn().mockImplementation(() => {
        return {run: mockRun};
    });
});

describe('Bot', () => {
    const searchParams: Twit.Params = {
        q: '#test',
        count: 10,
        result_type: 'recent',
        lang: 'fa',
        include_entities: true
    };

    const botConfig = getBotConfig();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create debug with the specified namespace', () => {
        botConfig.debugNamespace = 'testNamespace';
        new Bot(botConfig);

        expect(Debug).toBeCalledWith('testNamespace');
    });

    it('should create debug with the default namespace if namespace is not specified', () => {
        botConfig.debugNamespace = '';
        new Bot(botConfig);

        expect(Debug).toBeCalledWith(Constant.DEBUGGER_DEFAULT_NAMESPACE);
    });

    describe('retweet', () => {
        const botConfig = getBotConfig();
        const twit = new Twit(botConfig.apiConfig);
        const debug = Debug('dummy');

        it('should run the search', async() => {
            expect.assertions(7);

            const bot = new Bot(botConfig);
            await bot.retweet(searchParams);

            expect(Like).toBeCalledTimes(1);
            expect(Like).toBeCalledWith(
                botConfig,
                twit,
                debug
            );

            expect(Retweet).toBeCalledTimes(1);
            expect(Retweet).toBeCalledWith(
                botConfig,
                twit,
                debug
            );

            expect(mockRun).toBeCalled();
            expect(mockDebug).toBeCalledTimes(1);
            expect(mockDebug).toBeCalledWith('All done.');
        });
    });
});