import WebSocket from "ws";

const getData = async (socket: WebSocket) => {
  socket.addEventListener("message", ({ data }: { data: any }) => {
    const packet = JSON.parse(data);
    if (packet.returnData) {
      packet.date = new Date();
      console.log("packecior", packet);
      //save to db
    }
    //socket.removeAllListeners();
  });
};

export { getData };
