import axios from 'axios';

const WHITEBOARD_API_URL = 'https://api.netless.link/v5';
const SDK_TOKEN = process.env.AGORA_WHITEBOARD_SDK_TOKEN; // This is the task-level SDK token from Agora Console

/**
 * Creates a new whiteboard room for a class session
 */
export const createWhiteboardRoom = async () => {
  try {
    if (!SDK_TOKEN) {
      console.warn('[Whiteboard]: Missing AGORA_WHITEBOARD_SDK_TOKEN - Cannot create room');
      return null;
    }

    const response = await axios.post(
      `${WHITEBOARD_API_URL}/rooms`,
      { limit: 0, isRecord: false },
      {
        headers: {
          'token': SDK_TOKEN,
          'Content-Type': 'application/json',
          'region': 'in-mum' // Using Mumbai region as a reasonable default for PK
        }
      }
    );

    console.log('[Whiteboard]: Successfully created room:', response.data.uuid);
    return {
      uuid: response.data.uuid,
      roomToken: await generateRoomToken(response.data.uuid)
    };
  } catch (error: any) {
    console.error('[Whiteboard]: Error creating room:', error.response?.data || error.message);
    if (error.response) {
       console.error('[Whiteboard]: API Status:', error.response.status);
    }
    return null;
  }
};

/**
 * Generates a room token for a specific room UUID
 */
export const generateRoomToken = async (uuid: string) => {
  try {
    if (!SDK_TOKEN) return null;

    const response = await axios.post(
      `${WHITEBOARD_API_URL}/tokens/rooms/${uuid}`,
      { lifespan: 3600000, role: 'admin' },
      {
        headers: {
          'token': SDK_TOKEN,
          'Content-Type': 'application/json',
          'region': 'in-mum'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[Whiteboard]: Error generating room token:', error.response?.data || error.message);
    return null;
  }
};
