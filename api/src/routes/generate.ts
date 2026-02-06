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

  // POST /api/generate-image — генерация открытки
  app.post<{ Body: { prompt: string; model?: string; size?: string } }>(
    '/api/generate-image',
    async (request, reply) => {
      const {
        prompt,
        model = 'openai/dall-e-3',
        size = '1024x1024',
      } = request.body;

      if (!prompt) {
        return reply.status(400).send({ error: 'prompt обязателен' });
      }

      try {
        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openrouterApiKey}`,
            'HTTP-Referer': 'https://birthdayai.app',
            'X-Title': 'BirthdayAI',
          },
          body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          app.log.error(`Image generation error: ${response.status} — ${errorText}`);

          // Fallback: если OpenRouter images endpoint не работает, пробуем через chat с моделью
          // которая возвращает URL картинки
          return reply.status(response.status).send({
            error: 'Image generation failed',
            details: errorText,
          });
        }

        const data = await response.json();
        return reply.send(data);
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
