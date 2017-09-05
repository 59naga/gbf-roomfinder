import express from 'express';

export default () => {
  const listener = express();

  listener.use(express.static('public'));

  return listener;
};
