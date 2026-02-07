import { FastifyInstance } from 'fastify';
import { config } from '../config';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateBody {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
}

export async function generateRoutes(app: FastifyInstance) {
  // POST /api/generate — проксирование запроса к OpenRouter
  app.post<{ Body: GenerateBody }>('/api/generate', async (request, reply) => {
    const { model, messages, temperature = 0.9, max_tokens = 500 } = request.body;

    if (!model || !messages || !Array.isArray(messages) || messages.length === 0) {
      return reply.status(400).send({ error: 'model и messages обязательны' });
    }

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openrouterApiKey}`,
          'HTTP-Referer': 'https://birthdayai.app',
          'X-Title': 'BirthdayAI',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        app.log.error(`OpenRouter error: ${response.status} — ${errorText}`);
        return reply.status(response.status).send({
          error: 'AI provider error',
          details: errorText,
        });
      }

      const data = await response.json();
      return reply.send(data);
    } catch (err: any) {
      app.log.error(`Generate error: ${err.message}`);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/generate-image — генерация открытки через chat/completions + modalities
  app.post<{ Body: { prompt: string; model?: string; aspect_ratio?: string } }>(
    '/api/generate-image',
    async (request, reply) => {
      const {
        prompt,
        model = 'google/gemini-2.5-flash-image',
        aspect_ratio = '1:1',
      } = request.body;

      if (!prompt) {
        return reply.status(400).send({ error: 'prompt обязателен' });
      }

      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openrouterApiKey}`,
            'HTTP-Referer': 'https://birthdayai.app',
            'X-Title': 'BirthdayAI',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'user', content: prompt },
            ],
            modalities: ['image', 'text'],
            image_config: {
              aspect_ratio,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          app.log.error(`Image generation error: ${response.status} — ${errorText}`);
          return reply.status(response.status).send({
            error: 'Image generation failed',
            details: errorText,
          });
        }

        const data: any = await response.json();
        const message = data?.choices?.[0]?.message;

        // Логируем структуру ответа для отладки
        app.log.info(`Image response keys: ${JSON.stringify(Object.keys(message || {}))}`);
        if (message?.images?.[0]) {
          app.log.info(`First image keys: ${JSON.stringify(Object.keys(message.images[0]))}`);
          // Логируем начало URL (без base64 данных)
          const firstImg = message.images[0];
          const urlPreview = (firstImg.image_url?.url || firstImg.url || 'EMPTY').substring(0, 80);
          app.log.info(`First image url preview: ${urlPreview}`);
        }

        // 1) Поле images (стандарт OpenRouter)
        if (message?.images && message.images.length > 0) {
          const extracted = message.images.map((img: any) => {
            // Пробуем все возможные форматы
            const url = img.image_url?.url  // { image_url: { url: "data:..." } }
              || img.url                     // { url: "data:..." }
              || img.b64_json                // { b64_json: "iVBOR..." }
              || '';
            return { url };
          });

          if (extracted[0]?.url) {
            return reply.send({ data: extracted });
          }
          app.log.error(`Extracted URL is empty. Raw image: ${JSON.stringify(message.images[0]).substring(0, 500)}`);
        }

        // 2) content как массив multipart (некоторые модели)
        if (Array.isArray(message?.content)) {
          const imageParts = message.content.filter(
            (p: any) => p.type === 'image_url' || p.type === 'image'
          );
          if (imageParts.length > 0) {
            return reply.send({
              data: imageParts.map((p: any) => ({
                url: p.image_url?.url || p.url || '',
              })),
            });
          }
        }

        // 3) content как строка с base64 data URL
        if (typeof message?.content === 'string') {
          const base64Match = message.content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (base64Match) {
            return reply.send({
              data: [{ url: base64Match[0] }],
            });
          }
        }

        // Ничего не нашли — логируем полный ответ
        app.log.error(`No images found. Full message: ${JSON.stringify(message).substring(0, 2000)}`);
        return reply.status(500).send({
          error: 'No image generated',
          details: 'AI model did not return an image',
        });
      } catch (err: any) {
        app.log.error(`Image generation error: ${err.message}`);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // GET /api/models — список доступных моделей
  app.get('/api/models', async (_request, reply) => {
    return reply.send({
      models: [
        { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
        { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
        { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
        { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
        { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', provider: 'Google' },
        { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B', provider: 'Meta' },
        { id: 'mistralai/mistral-large', label: 'Mistral Large', provider: 'Mistral' },
      ],
    });
  });
}
