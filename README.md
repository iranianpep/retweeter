# Retweeter
Simple retweeter bot that retweet tweets if they have enough likes

![Node.js CI](https://github.com/iranianpep/retweeter/workflows/Node.js%20CI/badge.svg)
[![Build Status](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/build.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/build-status/main)
[![Maintainability](https://api.codeclimate.com/v1/badges/009464f86e33fae8df85/maintainability)](https://codeclimate.com/github/iranianpep/retweeter/maintainability)
[![Code Coverage](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/coverage.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/?branch=main)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/iranianpep/retweeter/badges/quality-score.png?b=main)](https://scrutinizer-ci.com/g/iranianpep/retweeter/?branch=main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1d42b9f44b3b4dbdb73571cbee26a6d8)](https://www.codacy.com/gh/iranianpep/retweeter/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=iranianpep/retweeter&amp;utm_campaign=Badge_Grade)
[![StyleCI](https://styleci.io/repos/321806345/shield?branch=main)](https://styleci.io/repos/321806345)

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
        userConfig: {
          minCreationDiff: YOUR_TWEET_USER_MIN_CREATION_DIFF,
          minFollowers: YOUR_TWEET_USER_MIN_FOLLOWERS,
          minTweets: YOUR_TWEET_USER_MIN_TWEETS,
          userBlocklist: YOUR_USER_BLACKLIST_IDS
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