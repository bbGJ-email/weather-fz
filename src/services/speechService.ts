const APP_ID = import.meta.env.VITE_APP_ID;
const TTS_API_URL = 'https://api-integrations.appmiaoda.com/app-7zep911h81s1/api-eLMl2P4563j9/text2audio';

export async function textToSpeech(text: string): Promise<Blob> {
  try {
    const encodedText = encodeURIComponent(text);
    const cuid = generateDeviceId();

    const formData = new URLSearchParams({
      tex: encodedText,
      cuid: cuid,
      ctp: '1',
      aue: '3',
      per: '0',
      spd: '5',
      pit: '5',
      vol: '5',
    });

    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-App-Id': APP_ID,
      },
      body: formData.toString(),
    });

    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.startsWith('audio')) {
      const audioBlob = await response.blob();
      return audioBlob;
    }

    const errorData = await response.json();
    throw new Error(errorData.err_msg || '语音合成失败');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('语音合成服务异常');
  }
}

function generateDeviceId(): string {
  const stored = localStorage.getItem('device_id');
  if (stored) {
    return stored;
  }

  const newId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('device_id', newId);
  return newId;
}

export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('音频播放失败'));
    };

    audio.play().catch((error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    });
  });
}
