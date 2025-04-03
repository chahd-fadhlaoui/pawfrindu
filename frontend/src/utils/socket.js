import io from "socket.io-client";

const socket = io("http://localhost:8500", {
  auth: { token: localStorage.getItem("token") },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
});

let isInitialized = false;

export const initializeSocket = (token) => {
  if (!isInitialized && !socket.connected) {
    socket.auth = { token };
    socket.connect();
    isInitialized = true;
    // Log moved to connect event in AppContext
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    isInitialized = false;
    console.log("Socket disconnected");
  }
};

export default socket;