import React from 'react';
import PropTypes from 'prop-types';

import update from 'react-addons-update';

import CopyToClipboard from 'react-copy-to-clipboard';
import moment from 'moment';
import Moment from 'react-moment';

class Raid extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { copied: {} };
  }
  render() {
    const tweet = this.props.tweet;

    return (
      <li className={this.state.copied[tweet.id_str] ? 'raid copied' : 'raid'}>
        <figure>
          <a href={`https://twitter.com/${tweet.screen_name}/status/${tweet.id_str}`} target="_blank">
            <img src={tweet.profile_image_url} alt={tweet.screen_name} />
            <p><small>{tweet.screen_name}</small></p>
          </a>
        </figure>
        <CopyToClipboard
          text={tweet.roomData.id}
          onCopy={() => {
            this.props.container.input.success(
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
  }
}

Raid.propTypes = {
  container: PropTypes.shape().isRequired,
  tweet: PropTypes.shape().isRequired,
};
Raid.defaultProps = {
  tweet: {},
};

export default Raid;
