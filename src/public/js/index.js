const socket = io();

// Declaramos la variable user para alojar nuestro usuario una vez que se identifique
let user;

Swal.fire({
  title: "Identifícate",
  input: "text", // Especificamos que necesitamos de un input de tipo texto
  text: "Ingresa el usuario para identificarte en el chat",
  // La siguiente función determina una validación para el input.
  // En nuestro caso verificaremos que el nombre de usuario ingresado no esté vacío
  inputValidator: (value) => {
    return !value && "¡Necesitas escribir un nombre de usuario para continuar!";
  },
  // Esta opción evita que el usuario pueda cerrar el diálogo haciendo click fuera de él
  allowOutsideClick: false,
}).then((result) => {
  // Una vez que el usuario ingresa un nombre, lo asignamos a la variable user
  user = result.value;

  socket.emit("user-authenticated", { socketId: socket.id, username: user });
});

// Obtenemos una referencia al elemento con id chat-box
const chatBox = document.getElementById("chat-box");

/**
 * Agregamos un event listener, que nos permitirá escuchar eventos del navegador
 * En este caso, escucharemos el evento keyup, que se dispara cada vez que una tecla se suelta
 */
chatBox.addEventListener("keyup", (ev) => {
  /**
   * Si la tecla presionada es Enter y la longitud del mensaje es mayor a 0, enviamos el mensaje y limpiamos el input
   */
  if (ev.key === "Enter") {
    const message = chatBox.value;

    if (message.trim().length > 0) {
      socket.emit("chat-message", { user, message });
      chatBox.value = "";
    }
  }
});

// Obtenemos una referencia al elemento con id message-logs
const messageLogs = document.getElementById("message-logs");

// Cuando recibimos la lista actualizada de mensajes, los agregamos este elemento, uno debajo del otro
socket.on("message-logs", (data) => {
  let messages = "";
  data.forEach((message) => {
    messages += `<b>${message.user}</b>: ${message.message}</br>`;
  });

  messageLogs.innerHTML = messages;
});

socket.on("user-connected", (username) => {
  // Solo dispararemos si el usuario de esta ventana se ha logueado
  if (user) {
    Swal.fire({
      title: `${username} se ha unido al chat`,
      toast: true,
      position: "top-end",
    });
  }
});
