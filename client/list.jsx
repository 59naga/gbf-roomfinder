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
import { Howl } from 'howler';

import Coop from './list-coop';
import Raid from './list-raid';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

const sound = new Howl({
  src: ['sound.mp3'],
  volume: 0.5,
});

class List extends React.Component {
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
    const container = {}; // TODO: ToastContainerのinputの参照をcoop/raidにもう少し綺麗に渡したい
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
          ref={(input) => { container.input = input; }}
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"
        />
        <ul className="rooms">
          {this.props.tweets.map((tweet) => {
            if (displayed[tweet.roomData.id]) {
              return null;
            }
            displayed[tweet.roomData.id] = true;

            if (tweet.roomData.type === 'raid') {
              return <Raid key={tweet.id_str} tweet={tweet} container={container} />;
            }
            return <Coop key={tweet.id_str} tweet={tweet} container={container} />;
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
  const filtered = state.tweets.filter(tweet => state.tags.reduce((matched, tag) => {
    if (matched) {
      return matched;
    }
    // 「へくとるhl」≒「ﾍｸﾄﾙＨＬ」
    const normalizedTitle = moji(tweet.roomData.title).convert('ZEtoHE').convert('HKtoZK').convert('HGtoKK').toString();
    const regexp = new RegExp(moji(tag).convert('HGtoKK').toString(), 'i');
    return normalizedTitle.match(regexp);
  }, !state.tags.length));
  return update(state, { tweets: { $set: filtered } });
})(List);
