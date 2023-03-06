import WebSocket from "ws";

// const auth = async (userId: string, password: string) => {

const auth = (userId: string, password: string) => {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket("wss://ws.xtb.com/demo");

    console.log("inside auth");
    socket.addEventListener("open", () => {
      console.log("inside open", userId, password);
      // Log in to the API
      socket.send(
        JSON.stringify({
          command: "login",
          arguments: {
            userId,
            password,
          },
        })
      );
    });
    let authorized = false;

    socket.addEventListener("message", ({ data }: { data: any }) => {
      const packet = JSON.parse(data);
      if (packet.status == true && packet.streamSessionId && !authorized) {
        resolve(packet.streamSessionId);
        //Pass socket to the function to allow it retrieve data from API
      } else if (packet.status == false) {
        console.log("error", data);
      }
    });
  });
};
export { auth };
