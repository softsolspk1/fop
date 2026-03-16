import AC, { AgoraChat } from 'agora-chat';

const appKey = process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY || '411183631#1564129';

export const chatClient: AgoraChat.Connection = new AC.connection({
  appKey: appKey,
});

export const initChat = (userId: string, token: string) => {
  chatClient.open({
    user: userId,
    agoraToken: token,
  });
};

export const sendMessage = (to: string, message: string, chatType: 'singleChat' | 'groupChat' = 'groupChat') => {
  const msg = AC.message.create({
    type: 'txt',
    msg: message,
    to: to,
    chatType: chatType,
  });
  
  chatClient.send(msg);
};

export const onMessageReceived = (callback: (msg: any) => void) => {
  chatClient.addEventHandler('messageHandler', {
    onTextMessage: (message) => {
      callback(message);
    },
  });
};
