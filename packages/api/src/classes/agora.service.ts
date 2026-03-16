import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export const generateAgoraToken = (channelName: string, uid: number) => {
  const appId = process.env.AGORA_APP_ID || 'mock_app_id';
  const appCertificate = process.env.AGORA_APP_CERTIFICATE || 'mock_certificate';
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return token;
};
