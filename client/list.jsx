import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import update from 'react-addons-update';

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import moji from 'moji';

import { ToastMessage, ToastContainer } from 'react-toastr';
import CopyToClipboard from 'react-copy-to-clipboard';
import moment from 'moment';
import Moment from 'react-moment';
import { Howl } from 'howler';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);
moment.locale('ja');

const sound = new Howl({
  src: ['sound.mp3'],
  volume: 0.5,
});

class List extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { copied: {} };
  }
  componentDidUpdate(prevProps) {
    // リストが初期化済みで、タグが変更されておらず
    // 条件に一致するツイートが追加された時に、音声を鳴らす
    const isDirty = this.props.pristine === false;
    const notChangedTags = this.props.tags.join('') === prevProps.tags.join('');
    const addedMatchedTweet = this.props.tweets.length > prevProps.tweets.length;
    if (isDirty && notChangedTags && addedMatchedTweet && this.props.options.alert) {
      sound.play();
    }
  }
  render() {
    let container;
    const displayed = {};
    return (
      <div>
        <header className="controls">
          <TagsInput
            value={this.props.tags}
            inputProps={{ placeholder: '部屋名で検索(OR)', style: { width: '9em' } }}
            onChange={(payload) => {
              this.props.dispatch({ type: 'TAGS', payload });
            }}
          />
          <label className="react-toggle">
            <Toggle
              checked={this.props.options.alert}
              onChange={(event) => {
                this.props.dispatch({ type: 'OPTIONS', payload: { alert: event.target.checked } });
              }}
            />
            <span>音声通知</span>
          </label>
        </header>
        <ToastContainer
          ref={(input) => { container = input; }}
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"
        />
        <ul className="rooms">
          {this.props.tweets.map((tweet) => {
            if (displayed[tweet.roomData.id]) {
              return null;
            }
            displayed[tweet.roomData.id] = true;
            return (
              <li key={tweet.id_str} className={this.state.copied[tweet.id_str] ? 'copied' : null}>
                <figure>
                  <a href={`https://twitter.com/${tweet.screen_name}/status/${tweet.id_str}`} target="_blank">
                    <img src={tweet.profile_image_url} alt={tweet.screen_name} />
                    <p><small>{tweet.screen_name}</small></p>
                  </a>
                </figure>
                <CopyToClipboard
                  text={tweet.roomData.id}
                  onCopy={() => {
                    container.success(
                      `${tweet.roomData.id} をコピーしました`,
                      `${tweet.roomData.title} (${moment(tweet.created_at).fromNow()})`, {
                        timeOut: 1000,
                        extendedTimeOut: 10000,
                        preventDuplicates: true,
                      });
                    this.setState(update(this.state, { copied: { [tweet.id_str]: { $set: true } } }));
                  }}
                >
                  <figcaption>
                    <h2>{tweet.roomData.title || '\u00A0'}</h2>
                    <footer>
                      <h3>
                        {tweet.roomData.over ? `ランク${tweet.roomData.over}以上` : 'ランク制限なし'}
                        {`＼${tweet.roomData.max}人`}
                      </h3>
                      <p>
                        {tweet.roomData.readyCheck ? null : '承認なし＼'}
                        {tweet.roomData.repeat ? `${tweet.roomData.repeat}回連続＼` : null}
                        {<Moment fromNow>{tweet.created_at}</Moment>}
                      </p>
                    </footer>
                    <strong className="room-id">{tweet.roomData.id}</strong>
                  </figcaption>
                </CopyToClipboard>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
List.propTypes = {
  dispatch: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  tweets: PropTypes.arrayOf(PropTypes.shape),
  tags: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.shape({ alert: PropTypes.bool }),
};
List.defaultProps = {
  tweets: [],
  tags: [],
  options: {},
};
export default connect((state) => {
  // 検索条件いずれかに一致するもののみ、Listコンポーネントのprops.tweetsに設定する
  const filtered = state.tweets.filter(tweet => state.tags.reduce((matched, tag) => matched || moji(tweet.roomData.title).convert('HGtoKK').toString().match(new RegExp(moji(tag).convert('HGtoKK').toString(), 'i')), !state.tags.length));
  return update(state, { tweets: { $set: filtered } });
})(List);
