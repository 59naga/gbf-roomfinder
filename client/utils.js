import moji from 'moji';
import { XmlEntities } from 'html-entities';

const entities = new XmlEntities();

// マッチした文字列を返す。なければ初期値
export function extract(str, regexp, defaultValue = '', targetIndex = 1) {
  const matched = str.match(regexp) || [];
  return matched[targetIndex] || defaultValue;
}
// ツイートからルーム情報を抽出する
export function extractRoomData(tweet = '') {
  const lines = tweet.split('\n').slice(1);
  const nextLine = () => lines.shift() || '';

  const id = extract(nextLine(), /^(?:Room ID: |ルームID：)(\w+)$/);

  // '募集対象：誰でもOK' -> '誰でもOK'
  // '誰でもOK' or 'Anyone' -> ''
  const type = nextLine().replace(/^募集対象：/, '').replace(/^(誰でもOK|Anyone)$/, '');
  const readyCheck = !extract(nextLine(), /^(Ready Check Disabled|承認なし)/, false);
  const max = extract(nextLine(), /^(?:Limit: |参戦人数：)(\d+)( players|人)/, 30) | 0;
  const over = extract(nextLine(), /^(?:Rank: |Rank )(\d+)(\+| 以上)/, 0) | 0;

  const optionalLine = lines[0] || '';
  const repeat = extract(optionalLine, /^(?:Repeating Quest: |連続クエスト設定：)(\d+)( times|回連続)/, 0) | 0;
  if (repeat) {
    nextLine();
  }
  const title = entities.decode(moji(lines.join('\n')).convert('ZEtoHE').convert('HKtoZK').toString());

  return {
    id,
    type,
    readyCheck,
    max,
    over,
    repeat,
    title,
  };
}
