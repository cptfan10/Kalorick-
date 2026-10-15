import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Route: AI Meal Recommender
  app.post('/api/recommend-meal', async (req, res) => {
    try {
      const {
        caloriesRemaining,
        proteinRemaining,
        carbsRemaining,
        fatRemaining,
        userGoal,
        mealType,
        ingredientsAvailable,
        dietaryNotes,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(200).json({
          isFallback: true,
          message: 'Používám chytrý offline algoritmus doporučení (API klíč není nastaven).',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Jsi špičkový nutriční terapeut a kuchař pro aplikaci Kalorické tabulky.
Uživatel potřebuje doporučit jedno ideální jídlo přesně na míru svým zbývajícím živinám.

Údaje uživatele:
- Zbývající kalorie pro dnešek: cca ${caloriesRemaining ?? 'neomezeno'} kcal
- Chybějící bílkoviny: cca ${proteinRemaining ?? 'optimální'} g
- Chybějící sacharidy: cca ${carbsRemaining ?? 'optimální'} g
- Chybějící tuky: cca ${fatRemaining ?? 'optimální'} g
- Cíl uživatele: ${userGoal || 'zdravé stravování / fitness'}
- Chod jídla: ${mealType || 'oběd nebo večeře'}
${ingredientsAvailable ? `- Ingredience které má uživatel doma: ${ingredientsAvailable}` : ''}
${dietaryNotes ? `- Zvláštní preference / alergie: ${dietaryNotes}` : ''}

Navrhni přesně jedno lahodné, realistické a vyvážené jídlo (v češtině), které těmto hodnotám co nejlépe odpovídá.
Odpověz POUZE jako validní JSON bez markdownu (žádné \`\`\`json):
{
  "title": "Název jídla v češtině",
  "category": "Kategorie (např. Lehká večeře, Sytý oběd)",
  "description": "2-3 věty popisu, proč je jídlo skvělé a jak chutná",
  "calories": číslo,
  "protein": číslo v gramech,
  "carbs": číslo v gramech,
  "fat": číslo v gramech,
  "fiber": číslo v gramech,
  "whyRecommended": "Vysvětlení, jak zapadá do zbývajících maker a cíle uživatele",
  "ingredients": ["ingredience 1 včetně gramáže", "ingredience 2 včetně gramáže", ...],
  "preparationTimeMin": číslo v minutách,
  "instructions": ["krok 1", "krok 2", "krok 3"]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = aiResponse.text || '';
      // Clean potential markdown blocks
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        isFallback: false,
        recommendation: parsed,
      });
    } catch (err: any) {
      console.error('Gemini API recommendation error:', err?.message || err);
      return res.status(200).json({
        isFallback: true,
        error: err?.message || 'Chyba při komunikaci s AI',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'NutriPlan API' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
