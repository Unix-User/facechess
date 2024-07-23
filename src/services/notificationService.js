const isNotificationSupported = () => "Notification" in window;

const showNotification = async (title, options) => {
  if (!isNotificationSupported()) {
    alert("Este navegador não suporta notificações de desktop");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
    return;
  }

  if (Notification.permission === "denied") {
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification(title, options);
  }
};

const createNotification = (title, body, icon) => {
  showNotification(title, { body, icon });
};

const notifyIncomingCall = (callerId) => {
  createNotification(
    "Chamada recebida",
    `${callerId} está te chamando`,
    "/path/to/call-icon.png"
  );
};

const notifyUnreadMessage = (sender, message) => {
  createNotification(
    "Nova mensagem",
    `${sender}: ${message}`,
    "/path/to/message-icon.png"
  );
};

export const notificationService = {
  showNotification,
  notifyIncomingCall,
  notifyUnreadMessage
};