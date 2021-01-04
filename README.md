# Retweeter
Simple bot that retweets and likes recent tweets for a topic if they meet some criteria

![Node.js CI](https://github.com/iranianpep/retweeter/workflows/Node.js%20CI/badge.svg)
[![Build Status](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/build.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/build-status/main)
[![Maintainability](https://api.codeclimate.com/v1/badges/009464f86e33fae8df85/maintainability)](https://codeclimate.com/github/iranianpep/retweeter/maintainability)
[![Code Coverage](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/coverage.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/?branch=main)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/quality-score.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/?branch=main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1d42b9f44b3b4dbdb73571cbee26a6d8)](https://www.codacy.com/gh/iranianpep/retweeter/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=iranianpep/retweeter&amp;utm_campaign=Badge_Grade)
[![StyleCI](https://styleci.io/repos/321806345/shield?branch=main)](https://styleci.io/repos/321806345)

## How to use
- Apply for a Twitter Developer Account to access Twitter APIs
   - Once approved, you will have `API_KEY`, `API_KEY_SECRET`, `ACCESS_TOKEN`, `ACCESS_TOKEN_SECRET`

- Choose the `#interesting_topic_to_retweet` you want to search the recent tweets for
- Choose based on what criteria you would like the retweeter to retweet and like (explained the condig in more details later)
- Instantiate a `Bot` object and call `retweet` function as follow:

```
try {
    console.log('Starting ...');
    const bot = new Bot({
      screenName: 'REPLACE_YOUR_ACCOUNT_SCREEN_NAME',
      apiConfig: {
        consumer_key: YOUR_API_KEY,
        consumer_secret: YOUR_API_KEY_SECRET,
        access_token: YOUR_ACCESS_TOKEN,
        access_token_secret: YOUR_ACCESS_TOKEN_SECRET,
        timeout_ms: 60 * 1000,
        strictSSL: true,
      },
      tweetConfig: {
        minFavs: YOUR_TWEET_MIN_FAVS,
        minFavsToFollowers: YOUR_TWEET_MIN_FAVS_TO_FOLLOWERS_RATIO,
        hashtagsLimit: YOUR_TWEET_MIN_ALLOWED_HASHTAGS,
        wordBlocklist: YOUR_WORD_BLOCKLIST,
        userConfig: {
          minCreationDiff: YOUR_TWEET_USER_MIN_CREATION_DIFF,
          minFollowers: YOUR_TWEET_USER_MIN_FOLLOWERS,
          minTweets: YOUR_TWEET_USER_MIN_TWEETS,
          userBlocklist: YOUR_USER_BLOCKLIST_IDS
        }
      }
    });

    await bot.retweet({
      q: '#interesting_topic_to_retweet',
      count: YOUR_SEARCH_PARAM_COUNT,
      result_type: YOUR_SEARCH_PARAM_RESULT_TYPE,
      lang: 'en',
      // make sure hashtags are included
      include_entities: true
    });
  } catch (error) {
    console.log(error);
  }
```

## Configs
| Name | Description | Required | Type |
| ------------- | ------------- | ------------- | ------------- |
| consumer_key  | Twitter API key | Yes | string
| cconsumer_secret | Twitter API key secret | Yes | string
| access_token | Twitter API access token | Yes | string
| access_token_secret | Twitter API access token secret | Yes | string
| minFavs | Tweet minimum number of favorites for retweeting & liking | Yes | number
| minFavsToFollowers | Ratio of tweet favorites to the user followers for retweeting & liking | Yes | number
| hashtagsLimit | Maximum number of hashtag that can be in a tweet for retweeting & liking | Yes | number
| wordBlocklist | Tweet is ignored if it has any of the blocklisted word | No | string[]
| minCreationDiff | Only consider those users who joined tweeter X days ago | Yes | number
| minFollowers | Tweet user minimum number of total followers for retweeting & liking | Yes | number
| minTweets | Tweet user minimum number of total tweets for retweeting & liking | Yes | number
| userBlocklist | Block listed user IDs | No | string[]
