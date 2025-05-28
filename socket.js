import { io } from "socket.io-client";


const socket = io("https://fastfood-online-backend.onrender.com", {
    transports: ["websocket"],
  });

export default socket;
