import Twitter from 'twitter';
import { formatTweet } from './utils';

const keywords = [
  '［グラブル］マルチバトル参加者募集！',
  'Join my Granblue Fantasy raid room!',
];

export default (io, env) => {
  const twitter = new Twitter({
    consumer_key: env.TWITTER_CONSUMER_KEY,
    consumer_secret: env.TWITTER_CONSUMER_SECRET,
    access_token_key: env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  let currentTweets = [];
  // クライアント接続時にキャッシュしている最新のツイート一覧をクライアントへ返す。
  io.on('connection', (socket) => {
    socket.on('current', (callback) => {
      callback(null, currentTweets);
    });
  });

  // 最新のツイートをキャッシュする
  const updateInterval = (60 * 60 * (1000 + 200)) / 150;
  const updateParams = {
    q: `"${keywords.join('" OR "')}"`, // eg '"foo" OR "bar" PR "baz"',
    count: 100,
  };
  const update = () => {
    twitter.get('search/tweets', updateParams, (error, tweets) => {
      if (error) throw new Error(error[0].message);
      currentTweets = tweets.statuses.map(formatTweet);
    });
  };

  // updateInterval ミリ秒感覚で再度キャッシュする
  update();
  setInterval(update, updateInterval);

  // 購読したツイートを受信するたびにクライアントへ通知する
  const stream = twitter.stream('statuses/filter', { track: keywords.join(',') });
  stream.on('data', (tweet) => {
    io.emit('tweet', formatTweet(tweet));
  });

  return twitter;
};
