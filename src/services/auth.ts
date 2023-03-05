const auth = async () => {
  const socket = new WebSocket("wss://ws.xtb.com/demo");
  socket.addEventListener("open", () => {
    // Log in to the API
    socket.send(
      JSON.stringify({
        command: "login",
        arguments: {
          userId: process.env.XTB_ID,
          password: process.env.XTB_PASSWORD,
        },
      })
    );
  });
  let authorized = false;
  socket.addEventListener("message", ({ data }: { data: any }) => {
    const packet = JSON.parse(data);
    if (packet.status == true && packet.streamSessionId && !authorized) {
      console.log("auth", packet);
      authorized = true;
      //Pass socket to the function to allow it retrieve data from API
    } else if (packet.status == false) {
      console.log("error", data);
    }
  });
  return socket;
};

export { auth };
