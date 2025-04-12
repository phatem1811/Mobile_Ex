import { io } from "socket.io-client";


const socket = io("http://192.168.1.16:8080", {
    transports: ["websocket"],
  });

export default socket;
