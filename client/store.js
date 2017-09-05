import { createStore, compose } from 'redux';
import update from 'react-addons-update';
import persistState from 'redux-localstorage';
import { extractRoomData } from './utils';

const initialState = {
  pristine: true,
  tweets: [],
  tags: [],
  options: {
    alert: false,
  },
};

function addRoomData(tweet) {
  return Object.assign({}, tweet, { roomData: extractRoomData(tweet.text) });
}

export default createStore((state, { type, payload, error }) => {
  if (error) throw error;

  switch (type) {
    case 'INIT':
      return update(state, {
        pristine: { $set: true },
        tweets: { $set: payload.map(tweet => addRoomData(tweet)) },
      });
    case 'ADD':
      return update(state, {
        pristine: { $set: false },
        tweets: { $unshift: [addRoomData(payload)] },
      });
    case 'TAGS':
      return update(state, { tags: { $set: payload } });
    case 'OPTIONS':
      return update(state, { options: { $set: payload } });
    default:
      return state;
  }
}, initialState, compose(persistState(['tags', 'options'])));
