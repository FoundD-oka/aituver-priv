import { Message } from "../messages/messages";

interface TextItem {
  type: string;
  text: string;
}

interface ImageItem {
  type: string;
  image_url: { url: string };
}

function isTextItem(item: TextItem | ImageItem): item is TextItem {
  return 'text' in item;
}

export async function getDifyChatResponseStream(
  messages: Message[],
  apiKey: string,
  url: string,
  conversationId: string,
  setDifyConversationId: (id: string) => void
) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const lastMessage = messages[messages.length - 1];
  
  let content = '';
  if (typeof lastMessage.content === 'string') {
    content = lastMessage.content;
  } else if (Array.isArray(lastMessage.content)) {
    content = lastMessage.content
      .filter(isTextItem)
      .map(item => item.text)
      .join(' ');
  }

  const query = lastMessage.location 
    ? `${content} (Location: ${lastMessage.location})`
    : content;

  const body = JSON.stringify({
    inputs: {},
    query: query,
    response_mode: "streaming",
    conversation_id: conversationId,
    user: "aituber-kit",
    files: []
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (!response.body) {
    throw new Error("Invalid response body");
  }

  const reader = response.body.getReader();
  const res = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const textChunk = new TextDecoder("utf-8").decode(value);
          const messages = textChunk.split('\n').filter(line => line.startsWith('data:'));
          messages.forEach(message => {
            const data = JSON.parse(message.slice(5));
            if (data.event === "message") {
              controller.enqueue(data.answer);
              setDifyConversationId(data.conversation_id);
            }
          });
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });

  return res;
}