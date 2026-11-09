// Holds the Socket.IO server instance so services can emit events without circular imports.
let io = null;

module.exports = {
  setIO: (instance) => {
    io = instance;
  },
  getIO: () => io,
};
