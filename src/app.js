import express from "express";
import handlebars from "express-handlebars";
import { __dirname } from "./utils.js";
import viewsRouter from "./routes/views.router.js";
import { Server } from "socket.io";

const app = express();

/**
 * Configuración handlebars y recursos estáticos
 */
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use("/", viewsRouter);
app.use(express.static(__dirname + "/public"));

// Servidor HTTP
const httpServer = app.listen(8080, () => {
  console.log("Server listening on port 8080");
});

const io = new Server(httpServer);
let messages = []; // Array donde almacenaremos los mensajes

io.on("connection", (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);

  /**
   * Escuchamos eventos de tipo 'chat-message' (recordemos que es el mismo nombre que usamos en el cliente)
   *  */
  socket.on("chat-message", (data) => {
    // Actualizamos los mensajes
    messages = [...messages, data];

    // Emitimos un nuevo evento de tipo 'message-logs' con los mensajes actualizados
    io.emit("message-logs", messages);
  });

  socket.on("user-authenticated", (data) => {
    const { socketId, username } = data;

    io.to(socketId).emit("message-logs", messages);

    socket.broadcast.emit("user-connected", username);
  });
});
