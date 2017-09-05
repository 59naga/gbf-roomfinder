import React from 'react';
import { render } from 'react-dom';
import { connect as createSocket } from 'socket.io-client';
import { Provider } from 'react-redux';

import './index.styl';

import store from './store';
import List from './list';

const socket = createSocket(process.env.NODE_ENV === 'production' ? '/' : 'localhost:59798');
socket.on('connect', () => {
  socket.emit('current', (error, tweets) => {
    store.dispatch({
      type: 'INIT',
      payload: tweets,
      error,
    });
  });
});
socket.on('tweet', (tweet) => {
  store.dispatch({
    type: 'ADD',
    payload: tweet,
  });
});

window.addEventListener('DOMContentLoaded', () => {
  render(<Provider store={store}><List /></Provider>, document.querySelector('main'));
});
