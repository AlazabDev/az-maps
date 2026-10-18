import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي لنظام Alazab Maps (az-maps) - المنصة الجغرافية المكانية المؤسسية لمجموعة العزب.
أنت خبير في نظم المعلومات الجغرافية (GIS)، وقواعد بيانات PostGIS، وإدارة بلاغات صيانة UberFix، وتوزيع الفنيين، وتكامل المشروعات مع ERPNext وDaftra في جمهورية مصر العربية (خاصة الإسكندرية والقاهرة الكبرى والساحل الشمالي).

مهامك الرئيسية:
1. الإجابة بدقة عن استفسارات المواقع، المشروعات، والفروع (مثل أبو عوف سيدي جابر، وأبراج العلمين، ومقر المهندسين).
2. تحليل كثافة بلاغات الصيانة (Heatmap) واقتراح تحسين نطاقات الاستجابة السريعة (SLA).
3. استعلام بيانات الأماكن والطرق والمرافق الحيوية في مصر باستخدام أداة خرائط جوجل (Google Maps Grounding).
4. الرد بلغة عربية مهنية، واضحة ومباشرة مع ذكر الإحداثيات والنطاقات الجغرافية بدقة.`;

/**
 * Multi-turn Chat endpoint using gemini-3.8-flash with Google Maps Grounding
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userLocation } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Default location to Alexandria Sidi Gaber if not provided
    const lat = userLocation?.latitude || 31.216;
    const lng = userLocation?.longitude || 29.949;

    // Convert messages to GenAI contents format
    // Filter history for previous turns and format correctly
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Use gemini-3.8-flash with Google Maps tool for spatial grounding
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const replyText = response.text || 'عذراً، لم أتمكن من استخراج رد مناسب.';

    // Extract Grounding Chunks (Google Maps places & links)
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsGrounding: Array<{ uri: string; title: string }> = [];

    for (const chunk of rawChunks as any[]) {
      if (chunk.maps?.uri) {
        mapsGrounding.push({
          uri: chunk.maps.uri,
          title: chunk.maps.title || 'عرض الموقع في خرائط Google',
        });
      }
      if (chunk.web?.uri) {
        mapsGrounding.push({
          uri: chunk.web.uri,
          title: chunk.web.title || 'مرجع إضافي',
        });
      }
    }

    res.json({
      text: replyText,
      mapsGrounding,
    });
  } catch (err: any) {
    console.error('Gemini Chat API Error:', err);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة المحادثة مع المساعد الذكي',
      details: err.message,
    });
  }
});

/**
 * Dedicated Google Maps Grounded search endpoint
 */
app.post('/api/maps/grounding', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;

    const lat = latitude || 31.216;
    const lng = longitude || 29.949;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query || 'ما هي أقرب مراكز الصيانة والمستودعات في محيط سيدي جابر بالإسكندرية؟',
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsGrounding = (rawChunks as any[])
      .filter((c: any) => c.maps?.uri)
      .map((c: any) => ({
        uri: c.maps.uri,
        title: c.maps.title || 'عرض في Google Maps',
      }));

    res.json({
      text: response.text,
      mapsGrounding,
    });
  } catch (err: any) {
    console.error('Maps Grounding Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
