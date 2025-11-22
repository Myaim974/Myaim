/*
 * Fichier: server.js
 * Auteur: Hoarau Ivan
 * Description: Serveur API Fullstack avec OpenAI (Real AI)
 */

require('dotenv').config(); // Charge la clé secrète
const express = require('express');
const path = require('path');
const OpenAI = require('openai'); // Import officiel OpenAI

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de l'IA
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- BASES DE DONNÉES (Mémoire) ---
const usersDB = [
    { id: 1, name: "SFE Réunion Pro", email: "sfe@pro.re", password: "123", role: "pro", job: "Climatisation", location: "Saint-Denis", rating: 4.9, isPremium: true, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 2, name: "Elec 974 Service", email: "elec@pro.re", password: "123", role: "pro", job: "Électricité", location: "Saint-Pierre", rating: 4.7, isPremium: false, avatar: "https://randomuser.me/api/portraits/men/85.jpg" },
    { id: 99, name: "Michel Dupont", email: "client@test.re", password: "123", role: "client", location: "Saint-Denis", isPremium: false, avatar: "https://randomuser.me/api/portraits/men/1.jpg" }
];

const jobsDB = [
    { id: 101, clientId: "client@test.re", clientName: "Michel Dupont", title: "Installation Split 12000 BTU", category: "Climatisation", location: "Saint-Denis", desc: "Besoin d'une installation rapide pour des bureaux.", status: "Ouvert", budget: "1500", views: 12, contacts: 2, date: "20/11/2025" }
];

const equipmentsDB = [
    { id: 501, ownerId: "client@test.re", name: "Climatiseur Salon", brand: "Samsung", type: "Split Inverter", installDate: "12/01/2024", nextService: "12/07/2025", status: "Bon état" },
    { id: 502, ownerId: "client@test.re", name: "Chauffe-eau Solaire", brand: "ReuniWatt", type: "Monobloc 200L", installDate: "15/03/2023", nextService: "15/03/2026", status: "A réviser" }
];

// Historique du Chat (Mémoire vive)
let messagesDB = []; 

// --- ROUTES API ---

app.get('/api/users', (req, res) => res.json(usersDB));
app.get('/api/jobs', (req, res) => res.json(jobsDB));
app.get('/api/equipments', (req, res) => res.json(equipmentsDB));
app.get('/api/chat', (req, res) => res.json(messagesDB));

// --- ROUTE INTELLIGENTE (OpenAI) ---
app.post('/api/chat', async (req, res) => {
    const userMsgText = req.body.message;
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // 1. Sauvegarder le message utilisateur
    messagesDB.push({ sender: "user", text: userMsgText, time: timestamp });
    console.log("📩 User:", userMsgText);

    try {
        // 2. Préparer le contexte pour l'IA
        // On transforme notre historique MyAim en format OpenAI (role: 'user'/'assistant')
        const conversationHistory = messagesDB.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
        }));

        // 3. Appel à la VRAIE Intelligence Artificielle
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Rapide et efficace (ou gpt-4 si tu veux plus puissant)
            messages: [
                { 
                    role: "system", 
                    content: "Tu es Ivan, un artisan expert en climatisation et plomberie à l'île de La Réunion. Tu réponds aux clients sur l'application MyAim. Tu es professionnel, rassurant, et tu utilises parfois des expressions locales réunionnaises légères. Ton but est de fixer un rendez-vous pour un devis. Ne donne jamais de prix exact sans voir le chantier, donne juste des fourchettes." 
                },
                ...conversationHistory // On injecte tout l'historique pour qu'elle ait de la mémoire
            ],
        });

        const aiReply = completion.choices[0].message.content;

        // 4. Sauvegarder et répondre
        messagesDB.push({ sender: "ai", text: aiReply, time: timestamp });
        console.log("🤖 OpenAI:", aiReply);
        
        res.json({ reply: aiReply, history: messagesDB });

    } catch (error) {
        console.error("Erreur OpenAI:", error);
        res.status(500).json({ reply: "Désolé, je capte mal (Erreur serveur).", history: messagesDB });
    }
});

// --- FRONTEND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START ---
app.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 Serveur MyAim + OpenAI connecté sur le port ${PORT}`);
    console.log(`--------------------------------------------------`);
});