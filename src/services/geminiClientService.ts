/**
 * Client-side Gemini API Service.
 * Proxies all requests to the server backend (/api/gemini/*)
 * keeping API keys secure on the server and supporting standard generation,
 * Server-Sent Events (SSE) streaming, and WebSocket Gemini Live API.
 */

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  model?: string;
}

export interface StreamTextCallbacks {
  onChunk: (chunk: string) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export interface GeminiLiveCallbacks {
  onAudioData: (base64Audio: string) => void;
  onInterrupted?: () => void;
  onClose?: () => void;
  onError?: (err: any) => void;
}

/**
 * Standard text generation via server
 */
export async function generateServerContent(options: GenerateTextOptions): Promise<string> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.text || '';
}

/**
 * Streaming generation via Server-Sent Events (SSE)
 */
export async function streamServerContent(
  prompt: string,
  callbacks: StreamTextCallbacks,
  model: string = 'gemini-3.8-flash'
): Promise<() => void> {
  const controller = new AbortController();

  try {
    const response = await fetch('/api/gemini/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const readLoop = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              callbacks.onDone?.();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                callbacks.onChunk(parsed.chunk);
              }
              if (parsed.error) {
                callbacks.onError?.(parsed.error);
              }
            } catch {
              // ignore malformed JSON chunk
            }
          }
        }
      }
      callbacks.onDone?.();
    };

    readLoop().catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.(err.message || 'Stream read error');
      }
    });
  } catch (err: any) {
    callbacks.onError?.(err.message || 'Failed to initialize stream');
  }

  return () => controller.abort();
}

/**
 * Connects to the server-side Gemini Live API WebSocket (/api/gemini/live)
 */
export function connectServerLiveApi(callbacks: GeminiLiveCallbacks): {
  sendAudioChunk: (base64Audio: string) => void;
  disconnect: () => void;
} {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/gemini/live`;
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.audio) {
        callbacks.onAudioData(data.audio);
      }
      if (data.interrupted) {
        callbacks.onInterrupted?.();
      }
      if (data.error) {
        callbacks.onError?.(data.error);
      }
    } catch (e) {
      console.warn('Failed to parse WebSocket message:', e);
    }
  };

  socket.onerror = (err) => {
    callbacks.onError?.(err);
  };

  socket.onclose = () => {
    callbacks.onClose?.();
  };

  return {
    sendAudioChunk: (base64Audio: string) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ audio: base64Audio }));
      }
    },
    disconnect: () => {
      socket.close();
    },
  };
}
