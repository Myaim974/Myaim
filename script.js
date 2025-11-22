// Fichier: script.js

// --- CONFIGURATION TAILWIND ---
tailwind.config = {
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: { dark: '#0f172a', primary: '#1e40af', primaryLight: '#3b82f6', accent: '#ea580c', success: '#059669', bg: '#f8fafc' }
            },
            boxShadow: { 'pro': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }
        }
    }
}

// --- CONSTANTES DE BASE DE DONNÉES (VERSION 6 - ULTIMATE) ---
const DB_USERS = 'myaim_v6_users'; 
const DB_JOBS = 'myaim_v6_jobs';
const DB_EQUIPMENT = 'myaim_v6_equip'; // Nouvelle table pour la maintenance
const CURRENT_USER = 'myaim_v6_current';

async function initDatabase() {
    
    // On nettoie le LocalStorage pour forcer le téléchargement des nouvelles données serveur
    localStorage.removeItem(DB_USERS);
    localStorage.removeItem(DB_JOBS);
    localStorage.removeItem(DB_EQUIPMENT);
    
    // On vérifie si on a besoin de télécharger (logique simplifiée : on télécharge tout si un manque)
    if (!localStorage.getItem(DB_USERS) || !localStorage.getItem(DB_JOBS)) {
        try {
            console.log("📡 Synchronisation complète avec le serveur...");
            
            // 1. Récupérer les Utilisateurs
            const repUsers = await fetch('/api/users');
            const dataUsers = await repUsers.json();
            localStorage.setItem(DB_USERS, JSON.stringify(dataUsers));

            // 2. Récupérer les Chantiers
            const repJobs = await fetch('/api/jobs');
            const dataJobs = await repJobs.json();
            localStorage.setItem(DB_JOBS, JSON.stringify(dataJobs));

            // 3. Récupérer les Équipements
            const repEquip = await fetch('/api/equipments');
            const dataEquip = await repEquip.json();
            localStorage.setItem(DB_EQUIPMENT, JSON.stringify(dataEquip)); // Attention au nom DB_EQUIPMENT (sans 's' à la fin dans ton script original)

            console.log("✅ Toutes les données ont été synchronisées !");
            
            // Rechargement automatique pour afficher
            if(!sessionStorage.getItem('reloaded')) {
                sessionStorage.setItem('reloaded', 'true');
                location.reload();
            }

        } catch (erreur) {
            console.error("❌ Erreur de synchronisation API :", erreur);
        }
    }
}

    
    // 2. Création des faux chantiers (Reste inchangé)
    if (!localStorage.getItem(DB_JOBS)) {
        const fakeJobs = [
            { id: 101, clientId: "client@test.re", clientName: "Michel Dupont", title: "Installation Split 12000 BTU", category: "Climatisation", location: "Saint-Denis", desc: "Besoin d'une installation rapide pour des bureaux.", status: "Ouvert", budget: "1500", views: 12, contacts: 2, date: "20/11/2025" }
        ];
        localStorage.setItem(DB_JOBS, JSON.stringify(fakeJobs));
    }

    // 3. Création des équipements (Carnet d'entretien)
    if (!localStorage.getItem(DB_EQUIPMENT)) {
        const fakeEquip = [
            { id: 501, ownerId: "client@test.re", name: "Climatiseur Salon", brand: "Samsung", type: "Split Inverter", installDate: "12/01/2024", nextService: "12/07/2025", status: "Bon état" },
            { id: 502, ownerId: "client@test.re", name: "Chauffe-eau Solaire", brand: "ReuniWatt", type: "Monobloc 200L", installDate: "15/03/2023", nextService: "15/03/2026", status: "A réviser" }
        ];
        localStorage.setItem(DB_EQUIPMENT, JSON.stringify(fakeEquip));
    }

    
    // 2. Création des faux chantiers
    if (!localStorage.getItem(DB_JOBS)) {
        const fakeJobs = [
            { id: 101, clientId: "client@test.re", clientName: "Michel Dupont", title: "Installation Split 12000 BTU", category: "Climatisation", location: "Saint-Denis", desc: "Besoin d'une installation rapide pour des bureaux.", status: "Ouvert", budget: "1500", views: 12, contacts: 2, date: "20/11/2025" }
        ];
        localStorage.setItem(DB_JOBS, JSON.stringify(fakeJobs));
    }

    // 3. Création des équipements (Carnet d'entretien)
    if (!localStorage.getItem(DB_EQUIPMENT)) {
        const fakeEquip = [
            { id: 501, ownerId: "client@test.re", name: "Climatiseur Salon", brand: "Samsung", type: "Split Inverter", installDate: "12/01/2024", nextService: "12/07/2025", status: "Bon état" },
            { id: 502, ownerId: "client@test.re", name: "Chauffe-eau Solaire", brand: "ReuniWatt", type: "Monobloc 200L", installDate: "15/03/2023", nextService: "15/03/2026", status: "A réviser" }
        ];
        localStorage.setItem(DB_EQUIPMENT, JSON.stringify(fakeEquip));
    }


const state = { user: JSON.parse(localStorage.getItem(CURRENT_USER)) || null };

// --- UI HELPERS ---
function show(id) { const el = document.getElementById(id); if(el) el.classList.remove('hidden'); }
function hide(id) { const el = document.getElementById(id); if(el) el.classList.add('hidden'); }
function showFlex(id) { const el = document.getElementById(id); if(el) { el.classList.remove('hidden'); el.classList.add('flex'); } }

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    document.getElementById('toast-icon').innerHTML = type === 'success' ? '<i class="fa-solid fa-circle-check text-brand-success text-xl"></i>' : '<i class="fa-solid fa-circle-info text-brand-primary text-xl"></i>';
    toast.className = "show flex items-center gap-4";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3500);
}

function navigateTo(pageId) {
    ['page-home', 'page-dashboard-client', 'page-dashboard-pro'].forEach(id => hide(id));
    show(pageId);
    window.scrollTo(0,0);
    if (state.user) {
        if (pageId === 'page-dashboard-client') renderClientDashboard();
        if (pageId === 'page-dashboard-pro') renderProDashboard();
    }
    const nav = document.getElementById('main-nav');
    if(pageId === 'page-home') { nav.classList.remove('bg-white', 'border-gray-200'); nav.classList.add('bg-white/80', 'backdrop-blur-md', 'border-gray-100'); }
    else { nav.classList.add('bg-white', 'border-gray-200'); nav.classList.remove('bg-white/80', 'backdrop-blur-md', 'border-gray-100'); }
}

function updateNav() {
    if (state.user) {
        hide('nav-guest'); showFlex('nav-logged');
        document.getElementById('user-name-display').innerText = state.user.name;
        document.getElementById('user-avatar-display').src = state.user.avatar;
        document.getElementById('profile-name-input').value = state.user.name;
        document.getElementById('profile-email-input').value = state.user.email;
        if (state.user.role === 'pro') { document.getElementById('user-role-display').innerText = "Espace Entreprise"; } 
        else { document.getElementById('user-role-display').innerText = "Particulier"; }
        updatePremiumBadge();
    } else { showFlex('nav-guest'); hide('nav-logged'); }
}

function updatePremiumBadge() {
    const badge = document.getElementById('status-badge');
    if (state.user.isPremium) {
        badge.className = "bg-brand-accent/10 pl-2 pr-3 py-1.5 rounded-full border border-brand-accent/20 flex items-center gap-2";
        document.getElementById('status-text').innerText = "PREMIUM";
        document.getElementById('status-text').className = "text-xs font-black text-brand-accent uppercase tracking-wider";
        document.getElementById('status-dot').className = "h-2.5 w-2.5 rounded-full bg-brand-accent shadow-sm animate-pulse";
    } else {
        badge.className = "bg-gray-100 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2";
        document.getElementById('status-text').className = "text-xs font-bold text-gray-600 uppercase tracking-wider";
        document.getElementById('status-text').innerText = "Standard";
        document.getElementById('status-dot').className = "h-2.5 w-2.5 rounded-full bg-gray-400 shadow-sm";
    }
    show('status-badge');
}

window.addEventListener('DOMContentLoaded', () => {
    initDatabase(); 
    updateNav();
    if(state.user) finishAuth(false);
});

// --- INSCRIPTION SÉCURISÉE (REGEX) ---
function toggleProFields() {
    const isPro = document.querySelector('input[name="role"][value="pro"]').checked;
    const proFields = document.getElementById('register-pro-fields');
    if (isPro) { proFields.classList.remove('hidden'); document.getElementById('reg-siret').required = true; } 
    else { proFields.classList.add('hidden'); document.getElementById('reg-siret').required = false; }
}

function handleRegister(e) {
    e.preventDefault();
    const role = document.querySelector('input[name="role"]:checked').value;
    const fname = document.getElementById('reg-firstname').value;
    const lname = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const location = document.getElementById('reg-location').value;
    const phone = document.getElementById('reg-phone').value;
    
    // VALIDATION ROBUSTE (SECURITÉ)
    const phoneRegex = /^(0692|0693)\d{6}$/;
    if (!phoneRegex.test(phone)) {
        showToast("Numéro invalide. Doit commencer par 0692 ou 0693.", "error");
        return;
    }

    let siret = "";
    if (role === 'pro') { 
        siret = document.getElementById('reg-siret').value; 
        if(!/^\d{14}$/.test(siret)) {
            showToast("Le SIRET doit comporter 14 chiffres exacts.", "error");
            return;
        }
    }

    let users = JSON.parse(localStorage.getItem(DB_USERS) || '[]');
    if(users.find(u => u.email === email)) { showToast("Cet email est déjà utilisé.", "error"); return; }

    const newUser = { 
        id: Date.now(), 
        name: `${fname} ${lname}`, 
        email: email, 
        password: password, 
        role: role, 
        location: location,
        phone: phone,
        siret: siret, 
        job: (role === 'pro') ? "Artisan Général" : null,
        rating: 5.0, reviews: 0, price: "€€", speed: "Standard",
        avatar: "https://www.w3schools.com/howto/img_avatar.png", 
        isPremium: false,
        isRGE: false
    };
    
    users.push(newUser); 
    localStorage.setItem(DB_USERS, JSON.stringify(users));
    state.user = newUser; 
    localStorage.setItem(CURRENT_USER, JSON.stringify(newUser)); 
    finishAuth(true);
}

// --- FEATURES CLIENT (Maintenance & Chat) ---

function renderClientDashboard() {
    const listContainer = document.getElementById('client-jobs-list');
    const kpiContainer = document.getElementById('client-kpi-container');
    const equipContainer = document.getElementById('client-equip-list'); // Nouveau container maintenance

    // 1. Bannière
    if (state.user.isPremium) hide('client-upgrade-banner'); else show('client-upgrade-banner');
    
    // 2. KPI
    if(kpiContainer) {
        const totalViews = 42; const totalClicks = 7;
        kpiContainer.innerHTML = `<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vues sur mes projets</p><div class="text-3xl font-black text-brand-dark">${state.user.isPremium ? totalViews : '<span class="blur-sm text-gray-300 select-none">99</span>'}</div>${!state.user.isPremium ? '<div class="text-[0.6rem] text-brand-primary font-bold cursor-pointer hover:underline mt-1" onclick="openPaymentModal(\'client\')"><i class="fa-solid fa-lock"></i> Débloquer</div>' : '<div class="text-xs text-green-600 font-bold">+12% cette semaine</div>'}</div><div class="h-12 w-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center text-xl"><i class="fa-regular fa-eye"></i></div></div><div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"><div><p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Entreprises intéressées</p><div class="text-3xl font-black text-brand-accent">${state.user.isPremium ? totalClicks : '<span class="blur-sm text-gray-300 select-none">12</span>'}</div>${!state.user.isPremium ? '<div class="text-[0.6rem] text-brand-primary font-bold cursor-pointer hover:underline mt-1" onclick="openPaymentModal(\'client\')"><i class="fa-solid fa-lock"></i> Débloquer</div>' : '<div class="text-xs text-gray-500 font-bold">Dernier il y a 1h</div>'}</div><div class="h-12 w-12 rounded-xl bg-orange-50 text-brand-accent flex items-center justify-center text-xl"><i class="fa-solid fa-briefcase"></i></div></div>`;
    }

    // 3. Mes Equipements (Maintenance SFE)
    if(equipContainer) {
        const equips = JSON.parse(localStorage.getItem(DB_EQUIPMENT) || '[]').filter(e => e.ownerId === state.user.email);
        if(equips.length === 0) {
            equipContainer.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">Aucun équipement enregistré.</div>';
        } else {
            equipContainer.innerHTML = equips.map(eq => `
                <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-2">
                    <div class="flex items-center gap-3">
                        <div class="bg-blue-50 text-brand-primary h-10 w-10 rounded-lg flex items-center justify-center"><i class="fa-solid fa-fan"></i></div>
                        <div>
                            <div class="font-bold text-brand-dark text-sm">${eq.name}</div>
                            <div class="text-xs text-gray-500">${eq.brand} • ${eq.type}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-gray-400">Entretien</div>
                        <div class="text-xs font-bold text-brand-accent">${eq.nextService}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // 4. Liste des Jobs
    if(!listContainer) return;
    const allJobs = JSON.parse(localStorage.getItem(DB_JOBS) || '[]');
    const myJobs = allJobs.filter(job => job.clientId === state.user.email);
    if (myJobs.length === 0) { listContainer.innerHTML = `<div class="text-center py-8 border-2 border-dashed border-gray-200 rounded-3xl"><p class="text-gray-500">Aucune demande.</p></div>`; } 
    else { listContainer.innerHTML = myJobs.map(job => `<div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center gap-4"><div class="flex items-center gap-4"><div class="h-12 w-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center text-xl">${getIconForCategory(job.category)}</div><div><h4 class="font-bold text-brand-dark">${job.title}</h4><span class="text-xs text-gray-500">${job.category}</span></div></div><div class="text-center"><div class="font-black text-brand-dark">${job.views}</div><div class="text-[0.6rem] text-gray-400 uppercase">Vues</div></div></div>`).join(''); }
}

// --- FONCTION RECHERCHE (AVEC FILTRE RGE) ---
function searchPros() {
    const jobType = document.getElementById('search-job-type').value;
    const location = document.getElementById('search-location').value;
    const onlyRGE = document.getElementById('search-rge').checked; // Nouveau paramètre
    const container = document.getElementById('search-results-container');
    
    container.innerHTML = '<div class="text-center py-10"><i class="fa-solid fa-circle-notch fa-spin text-brand-primary text-3xl"></i></div>'; 

    setTimeout(() => {
        const allUsers = JSON.parse(localStorage.getItem(DB_USERS) || '[]');
        
        const results = allUsers.filter(user => {
            if (user.role !== 'pro') return false;
            const matchJob = (jobType === "Tous métiers") || (user.job === jobType);
            let matchLoc = true;
            if (location !== "Toute l'île") matchLoc = user.location === location;
            
            // Filtre RGE
            if (onlyRGE && !user.isRGE) return false;

            return matchJob && matchLoc;
        });

        container.innerHTML = ''; 
        if (results.length === 0) { container.innerHTML = `<div class="text-center p-4 text-gray-500">Aucun artisan trouvé à ${location}.</div>`; } 
        else {
            results.forEach(pro => {
                let cardContent;
                if (state.user.isPremium) {
                    // Badge RGE affiché si true
                    const rgeBadge = pro.isRGE ? `<span class="bg-green-100 text-green-800 text-[0.6rem] font-bold px-2 py-0.5 rounded ml-2" title="Reconnu Garant de l'Environnement"><i class="fa-solid fa-leaf"></i> RGE</span>` : '';
                    
                    cardContent = `
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 flex items-center justify-between animate-fade-enter">
                            <div class="flex items-center gap-4">
                                <img src="${pro.avatar}" class="h-12 w-12 rounded-full object-cover border-2 border-green-500">
                                <div>
                                    <h4 class="font-bold text-brand-dark flex items-center flex-wrap gap-1">
                                        ${pro.name} <i class="fa-solid fa-circle-check text-brand-success text-xs"></i>
                                        ${rgeBadge}
                                    </h4>
                                    <div class="text-xs text-gray-500">${pro.job} • ${pro.location}</div>
                                    <div class="text-xs text-brand-accent mt-1"><i class="fa-solid fa-star"></i> ${pro.rating} (${pro.reviews} avis)</div>
                                </div>
                            </div>
                            <button onclick="openProDetails(${pro.id})" class="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow-lg">
                                Voir le profil
                            </button>
                        </div>
                    `;
                } else {
                    cardContent = `<div class="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 flex items-center justify-between relative overflow-hidden group"><div class="flex items-center gap-4 filter blur-[3px] opacity-60 select-none"><div class="h-12 w-12 rounded-full bg-gray-300"></div><div><h4 class="font-bold text-gray-800">Entreprise Premium</h4><div class="text-xs text-gray-500">${pro.job} • ${pro.location}</div></div></div><div class="absolute inset-0 flex items-center justify-end pr-6 z-10 bg-gradient-to-r from-transparent via-white/50 to-white/80"><button onclick="openPaymentModal('client')" class="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-primary transition shadow-lg flex items-center gap-2 transform group-hover:scale-105 duration-200"><i class="fa-solid fa-lock"></i> Débloquer</button></div></div>`;
                }
                container.innerHTML += cardContent;
            });
            if(!state.user.isPremium) container.innerHTML += `<div class="text-center mt-4 text-xs text-gray-500 font-medium"><i class="fa-solid fa-info-circle text-brand-primary"></i> Abonnez-vous pour voir les coordonnées.</div>`;
        }
    }, 500);
}

// Fonction pour charger l'historique et ouvrir la fenêtre
async function openChat(proName) {
    closeModal('modal-pro-details'); // Ferme la fiche artisan
    
    const chatTitle = document.getElementById('chat-title-name');
    if(chatTitle) chatTitle.innerText = proName;
    
    const chatBody = document.getElementById('chat-messages');
    chatBody.innerHTML = '<div class="text-center mt-10"><i class="fa-solid fa-circle-notch fa-spin text-brand-primary"></i> Chargement...</div>';
    
    show('modal-chat');

    try {
        // On récupère l'historique depuis le serveur
        const response = await fetch('/api/chat');
        const history = await response.json();
        
        chatBody.innerHTML = `<div class="flex justify-center mb-4"><span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Conversation sauvegardée</span></div>`;

        // Si l'historique est vide, message de bienvenue par défaut
        if (history.length === 0) {
            chatBody.innerHTML += `<div class="flex justify-start mb-3"><div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] text-sm">Bonjour, je suis l'IA de ${proName}. Comment puis-je vous aider ?</div></div>`;
        } else {
            // Sinon, on affiche tout l'historique
            history.forEach(msg => {
                if (msg.sender === 'user') {
                    chatBody.innerHTML += `<div class="flex justify-end mb-3"><div class="bg-brand-primary text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] text-sm text-left shadow-sm">${msg.text}<div class="text-[0.6rem] text-blue-200 text-right mt-1">${msg.time}</div></div></div>`;
                } else {
                    chatBody.innerHTML += `<div class="flex justify-start mb-3"><div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] text-sm shadow-sm">${msg.text}<div class="text-[0.6rem] text-gray-400 mt-1">${msg.time}</div></div></div>`;
                }
            });
        }
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll en bas

    } catch (e) {
        console.error("Erreur historique chat:", e);
    }
}

async function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const msg = input.value;
    if(!msg) return;
    
    const chatBody = document.getElementById('chat-messages');
    
    // 1. Afficher le message du Client (Toi)
    chatBody.innerHTML += `<div class="flex justify-end mb-3 animate-fade-enter"><div class="bg-brand-primary text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] text-sm">${msg}</div></div>`;
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll vers le bas
    
    input.value = ""; // Vider le champ
    
    try {
        // 2. Afficher un indicateur "En train d'écrire..."
        const loadingId = "typing-" + Date.now();
        chatBody.innerHTML += `<div id="${loadingId}" class="flex justify-start mb-3"><div class="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-tl-none text-xs italic"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>L'artisan écrit...</div></div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        // 3. Envoyer le message au Serveur (Backend)
        const reponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        
        const data = await reponse.json();

        // 4. Supprimer le "En train d'écrire" et afficher la réponse de l'IA
        const loadingMsg = document.getElementById(loadingId);
        if(loadingMsg) loadingMsg.remove();

        chatBody.innerHTML += `<div class="flex justify-start mb-3 animate-fade-enter"><div class="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] text-sm font-medium">${data.reply}</div></div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (error) {
        console.error("Erreur Chat :", error);
    }
}

// --- GENERATION DEVIS (SIMULÉ) ---
function generateQuote() {
    const btn = document.getElementById('btn-generate-quote');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Génération...';
    
    setTimeout(() => {
        btn.innerHTML = original;
        // Simulation téléchargement
        const link = document.createElement("a");
        link.href = "#";
        link.download = "Devis_MyAim_2025.pdf";
        // En vrai on utiliserait jsPDF, ici on simule le toast
        showToast("Devis PDF généré avec succès !", "success");
    }, 1500);
}

// --- LOGIQUE PRO (DASHBOARD) ---
function renderProDashboard(filterCategory = "Tous", filterLocation = "Toute l'île") {
    const container = document.getElementById('pro-leads-container');
    if (!container) return;
    if (state.user.isPremium) hide('pro-upgrade-banner'); else show('pro-upgrade-banner');
    const allJobs = JSON.parse(localStorage.getItem(DB_JOBS) || '[]');
    const jobs = allJobs.filter(job => { const matchCat = filterCategory === "Tous" || job.category === filterCategory; const matchLoc = filterLocation === "Toute l'île" || job.location.includes(filterLocation.split(' ')[0]); return matchCat && matchLoc; });
    if (jobs.length === 0) { container.innerHTML = '<div class="text-center p-8 text-gray-500">Aucun chantier trouvé.</div>'; return; }
    container.innerHTML = jobs.map(job => {
        let actionBlock;
        if (state.user.isPremium) { actionBlock = `<div class="bg-green-50 p-4 rounded-2xl border border-green-200 w-full mt-4 animate-fade-enter"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="bg-green-200 text-green-700 h-10 w-10 rounded-xl flex items-center justify-center"><i class="fa-solid fa-user-check"></i></div><div><div class="font-bold text-brand-dark">${job.clientName || 'Client'}</div><div class="text-xs text-gray-600 select-all">0692 00 00 00 • ${job.clientId}</div></div></div><a href="tel:0692000000" class="bg-brand-success text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-sm flex items-center gap-2"><i class="fa-solid fa-phone"></i> Appeler</a></div></div>`; } 
        else { actionBlock = `<div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 w-full mt-4 flex items-center justify-between"><div class="flex items-center gap-3 text-gray-500"><div class="bg-gray-200 h-10 w-10 rounded-xl flex items-center justify-center"><i class="fa-solid fa-lock"></i></div><span class="text-sm font-medium">Contact masqué</span></div><button onclick="openPaymentModal('pro')" class="bg-brand-dark text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-primary transition shadow-sm"><i class="fa-solid fa-unlock-keyhole mr-1"></i> Débloquer</button></div>`; }
        return `<div class="bg-white rounded-3xl shadow-pro border border-gray-100/50 p-6 hover:shadow-md transition group"><div class="flex justify-between items-start mb-4"><div class="flex items-center gap-4"><div class="h-14 w-14 rounded-2xl bg-blue-50 text-brand-primary flex items-center justify-center text-xl">${getIconForCategory(job.category)}</div><div><div class="flex gap-2 mb-1"><span class="bg-blue-100 text-brand-primary text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Nouveau</span><span class="text-gray-400 text-[0.6rem] font-bold px-2 py-0.5 border border-gray-100 rounded uppercase tracking-wider">${job.date}</span></div><h4 class="text-lg font-black text-brand-dark">${job.title}</h4></div></div><div class="text-right"><div class="text-brand-success font-black text-lg">${job.budget}€</div><div class="text-[0.6rem] uppercase font-bold text-gray-400">Budget Est.</div></div></div><div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 relative"><i class="fa-solid fa-quote-left text-2xl text-gray-200 absolute top-2 left-2"></i><p class="text-gray-700 text-sm relative z-10 pl-4 font-medium">"${job.desc || 'Pas de description.'}"</p></div><div class="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2"><i class="fa-solid fa-location-dot text-brand-accent"></i> ${job.location}</div>${actionBlock}</div>`;
    }).join('');
}
function filterProLeads() { const cat = document.getElementById('pro-filter-category').value; const loc = document.getElementById('pro-filter-location').value; renderProDashboard(cat, loc); }
function getIconForCategory(cat) { if(cat.includes('Clim')) return '<i class="fa-solid fa-snowflake"></i>'; if(cat.includes('Plomb')) return '<i class="fa-solid fa-faucet-drip"></i>'; if(cat.includes('Elec')) return '<i class="fa-solid fa-bolt"></i>'; return '<i class="fa-solid fa-helmet-safety"></i>'; }
function submitJob(e) { e.preventDefault(); const newJob = { id: Date.now(), clientId: state.user.email, clientName: state.user.name, title: document.getElementById('job-title').value, category: document.getElementById('job-category').value, budget: document.getElementById('job-budget').value, desc: document.getElementById('job-desc').value, location: "Saint-Denis", status: "Ouvert", views: 0, contacts: 0, date: new Date().toLocaleDateString() }; const allJobs = JSON.parse(localStorage.getItem(DB_JOBS) || '[]'); allJobs.unshift(newJob); localStorage.setItem(DB_JOBS, JSON.stringify(allJobs)); closeModal('modal-post-job'); showToast("Demande publiée !"); renderClientDashboard(); }
function openAuthModal(tab, role) { show('modal-auth'); switchAuthTab(tab); if(role) { for(r of document.getElementsByName('role')) if(r.value === role) r.checked = true; toggleProFields(); } } 
function closeModal(id) { hide(id); }
function switchAuthTab(tab) { if(tab === 'login') { show('form-login'); hide('form-register'); document.getElementById('auth-title').innerText="Connexion"; document.getElementById('tab-login').className="flex-1 py-3 rounded-lg font-bold text-brand-primary bg-white shadow-sm transition-all"; document.getElementById('tab-register').className="flex-1 py-3 rounded-lg font-bold text-gray-500 hover:text-gray-700 transition-all"; } else { hide('form-login'); show('form-register'); document.getElementById('auth-title').innerText="Créer un compte"; document.getElementById('tab-register').className="flex-1 py-3 rounded-lg font-bold text-brand-primary bg-white shadow-sm transition-all"; document.getElementById('tab-login').className="flex-1 py-3 rounded-lg font-bold text-gray-500 hover:text-gray-700 transition-all"; } }
function handleLogin(e) { e.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; let users = JSON.parse(localStorage.getItem(DB_USERS) || '[]'); const foundUser = users.find(u => u.email === email && u.password === password); if (foundUser) { state.user = foundUser; localStorage.setItem(CURRENT_USER, JSON.stringify(foundUser)); finishAuth(true); } else { showToast("Erreur identifiants.", "error"); } }
function finishAuth(showWelcome = true) { closeModal('modal-auth'); updateNav(); if(showWelcome) showToast(`Bienvenue, ${state.user.name} !`); if(state.user.role === 'client') { navigateTo('page-dashboard-client'); } else { navigateTo('page-dashboard-pro'); } }
function logout() { localStorage.removeItem(CURRENT_USER); state.user = null; updateNav(); navigateTo('page-home'); showToast("Déconnexion réussie.", 'info'); }
function openProfileModal() { show('modal-profile'); }
function updateAvatarPreview(event) { document.getElementById('preview-avatar-edit').src = URL.createObjectURL(event.target.files[0]); }
function saveProfile(e) { e.preventDefault(); const newName = document.getElementById('profile-name-input').value; let updated = {...state.user}; updated.name = newName; const index = JSON.parse(localStorage.getItem(DB_USERS)).findIndex(u => u.email === updated.email); let users = JSON.parse(localStorage.getItem(DB_USERS)); users[index] = updated; localStorage.setItem(DB_USERS, JSON.stringify(users)); state.user = updated; localStorage.setItem(CURRENT_USER, JSON.stringify(updated)); closeModal('modal-profile'); showToast("Profil mis à jour."); updateNav(); }
function openPostJobModal() { show('modal-post-job'); }
function openPaymentModal(type) { document.getElementById('payment-type').value = type || 'pro'; document.getElementById('payment-price').innerText = (type === 'client') ? '4.99€' : '9.99€'; show('modal-payment'); }
function processPayment(e) { e.preventDefault(); const btn = e.target.querySelector('button'); const original = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>...'; btn.disabled = true; setTimeout(() => { let updated = {...state.user}; updated.isPremium = true; const index = JSON.parse(localStorage.getItem(DB_USERS)).findIndex(u => u.email === updated.email); let users = JSON.parse(localStorage.getItem(DB_USERS)); users[index] = updated; localStorage.setItem(DB_USERS, JSON.stringify(users)); state.user = updated; localStorage.setItem(CURRENT_USER, JSON.stringify(updated)); closeModal('modal-payment'); showToast("Mode Premium Activé !"); btn.innerHTML = original; btn.disabled = false; finishAuth(false); }, 1500); }

// --- OPEN PRO DETAILS + CHAT BUTTON ---
function openProDetails(proId) {
    const modalContent = document.getElementById('modal-pro-content');
    if (!modalContent) { alert("Erreur HTML: modal-pro-details manquant"); return; }
    const allUsers = JSON.parse(localStorage.getItem(DB_USERS) || '[]');
    const pro = allUsers.find(u => u.id === proId);
    if(!pro) return;

    // BADGE RGE dans la modale
    const rgeBadge = pro.isRGE ? `<span class="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg text-xs font-bold mb-2"><i class="fa-solid fa-leaf"></i> Artisan RGE</span>` : '';

    modalContent.innerHTML = `
        <div class="text-center mb-6">
            <div class="relative inline-block">
                <img src="${pro.avatar}" class="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg">
                <div class="absolute bottom-0 right-0 bg-green-500 h-5 w-5 rounded-full border-2 border-white"></div>
            </div>
            <h3 class="text-2xl font-black text-brand-dark mt-3">${pro.name}</h3>
            <p class="text-gray-500 font-medium mb-2">${pro.job} • ${pro.location}</p>
            ${rgeBadge}
        </div>
        <div class="grid grid-cols-3 gap-2 mb-6">
            <div class="bg-blue-50 p-3 rounded-xl text-center border border-blue-100"><div class="text-lg font-black text-brand-primary">${pro.rating}</div><div class="text-[0.6rem] uppercase font-bold text-gray-400">Note</div></div>
            <div class="bg-orange-50 p-3 rounded-xl text-center border border-orange-100"><div class="text-lg font-black text-brand-accent">${pro.price || '€€'}</div><div class="text-[0.6rem] uppercase font-bold text-gray-400">Prix</div></div>
            <div class="bg-green-50 p-3 rounded-xl text-center border border-green-100"><div class="text-sm font-black text-green-600 mt-1">${pro.speed || 'Standard'}</div><div class="text-[0.6rem] uppercase font-bold text-gray-400 mt-1">Délai</div></div>
        </div>
        <div class="border-t border-gray-100 pt-4">
            <h4 class="font-bold text-brand-dark mb-2">Derniers Avis (${pro.reviews})</h4>
            <div class="space-y-3"><div class="bg-gray-50 p-3 rounded-xl"><div class="flex justify-between text-xs mb-1 font-bold"><span>Client Vérifié</span><span class="text-brand-accent">★★★★★</span></div><p class="text-xs text-gray-600">"Très bon travail, propre et soigné."</p></div></div>
        </div>
        <div class="mt-8 flex gap-3">
            <a href="tel:0692000000" class="flex-1 bg-brand-primary text-white py-3 rounded-xl font-bold text-center hover:bg-blue-800 transition shadow-lg flex items-center justify-center gap-2"><i class="fa-solid fa-phone"></i> Appeler</a>
            <button onclick="openChat('${pro.name}')" class="flex-1 bg-white text-brand-dark border border-gray-200 py-3 rounded-xl font-bold text-center hover:bg-gray-50 transition"><i class="fa-solid fa-comment-dots mr-2"></i> Message</button>
        </div>
    `;
    show('modal-pro-details');
}

function openKpiDetails(type) {
    const modalContent = document.getElementById('modal-kpi-content');
    if (!modalContent) return;
    let title = ""; let contentHtml = "";
    if (type === 'views') { title = "Historique des Vues"; contentHtml = `<div class="space-y-3"><div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"><div class="font-bold text-brand-dark">Novembre</div><div class="flex items-center gap-4"><span class="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">+12%</span><span class="text-lg font-black text-brand-primary w-16 text-right">1248</span></div></div></div>`; } 
    else if (type === 'chantiers') { title = "Suivi Financier des Chantiers"; const chantiers = [{ client: "Mme HOARAU Marie", project: "Installation VRV", total: 12000, paid: 4000 }, { client: "M. PAYET Lucas", project: "Dépannage Fuite", total: 150, paid: 150 }, { client: "Mme FONTAINE Lea", project: "Rénovation SDB", total: 4500, paid: 0 }]; contentHtml = `<div class="space-y-4">` + chantiers.map(s => { const p = Math.round((s.paid/s.total)*100); return `<div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><div class="flex justify-between items-start mb-3"><div><div class="font-black text-brand-dark text-lg">${s.client}</div><div class="text-xs text-gray-500 font-bold uppercase tracking-wider">${s.project}</div></div><div class="text-right"><div class="font-bold text-brand-dark">${s.paid}€ <span class="text-gray-400 text-xs font-normal">/ ${s.total}€</span></div><div class="text-xs font-bold ${p===100?'text-green-600':'text-orange-500'}">${p===100?'Payé':'Acompte'}</div></div></div><div class="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden"><div class="absolute top-0 left-0 h-full ${p===100?'bg-green-500':'bg-brand-primary'} transition-all" style="width: ${p}%"></div><div class="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold text-brand-dark z-10 mix-blend-multiply">${p}%</div></div></div>` }).join('') + `</div>`; }
    else if (type === 'clients') { title = "Ma Base Clients"; contentHtml = `<div class="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center mb-4"><div class="text-3xl font-black text-brand-primary">42</div><div class="text-xs text-blue-800 font-bold uppercase">Clients total</div></div>`; }
    document.getElementById('modal-kpi-title').innerText = title; modalContent.innerHTML = contentHtml; show('modal-kpi-details');
}