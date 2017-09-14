import { createServer } from 'http';
import createSocketIoServer from 'socket.io';

import createListener from './express';
import createRoomFinder from './twitter';

const listener = createListener();
const server = createServer(listener);
const io = createSocketIoServer(server);

io.sockets.setMaxListeners(0);

server.listen(process.env.PORT || 59798);
createRoomFinder(io, process.env);
