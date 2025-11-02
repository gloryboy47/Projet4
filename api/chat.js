// api/chat.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode POST uniquement' });
  }

  const { message, context } = req.body;

  try {
    const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `Tu es CANBot, assistant IA de CANDrive.ma (location voitures premium CAN 2025 Maroc).
            
CONNAISSANCES:
- Voitures: Dacia Sandero (280DH), Hyundai Tucson SUV (480DH), Audi A6 (720DH), Tesla Model 3 (650DH), Peugeot 3008 (550DH)
- Offre: -30% avec badge supporter CAN
- Villes: Casablanca, Marrakech, Rabat, Tanger, Agadir, Fès
- Services: GPS inclus, assurance tous risques, livraison stades/hôtels

RÈGLES:
- Réponds EN FRANÇAIS uniquement
- Sois court (2-4 phrases max)
- Utilise emojis sparingly (⚽🚗🎟️)
- Si réservation: "Cliquez sur Réserver sur la carte !"
- Si prix: Mentionne l'offre -30%
- Ton: Amical, pro, enthousiaste pour la CAN

Contexte requête: ${context || ''}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 250,
        temperature: 0.8
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    res.status(200).json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      reply: "⚠️ Service temporairement indisponible.<br>Essayez: 'SUV disponible ?' ou contactez-nous !" 
    });
  }
}