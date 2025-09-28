const fetch = require('node-fetch');
const mailModel = require('../../models/mail.model'); // modèle des mails / tickets
const logHistory = require('../loggers/logHistory');
const endpointsModel = require('../../models/fusion.model');

const API_URL = process.env.GLPI_URL;
const APP_TOKEN = process.env.GLPI_APP_TOKEN;
const USER_TOKEN = process.env.GLPI_USER_TOKEN;
const DEMANDEUR_NOM = process.env.DEMANDEUR_NOM;

// Fonction safe fetch
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.log(`⚠️ Requête échouée (${res.status}) sur ${url}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.log(`⚠️ Erreur réseau sur ${url}: ${err.message}`);
        return null;
    }
}

// Session GLPI
async function getSessionToken() {
    const data = await safeFetch(`${API_URL}/initSession`, {
        headers: {
            'App-Token': APP_TOKEN,
            'Authorization': `user_token ${USER_TOKEN}`
        }
    });
    return data?.session_token || null;
}

// Récupération tickets
async function getTicketsForRequester(sessionToken) {
    if (!sessionToken) return [];
    const url = `${API_URL}/search/Ticket?criteria[0][field]=4&criteria[0][searchtype]=contains&criteria[0][value]=${encodeURIComponent(DEMANDEUR_NOM)}`;
    const data = await safeFetch(url, {
        headers: {
            'Session-Token': sessionToken,
            'App-Token': APP_TOKEN
        }
    });

    if (!data?.data) return [];
    return data.data.map(row => ({
        id: row[2],
        titre: row[1],
        statut: Number(row[12])
    }));
}


let endpointMap = new Map(); // Map des endpoints pour accès rapide

// Initialisation de la map des endpoints
async function initEndpoints() {
    const allEndpoints = await endpointsModel.find();
    endpointMap = new Map(allEndpoints.map(e => [e.CN || e.Nom, e]));
}

// Vérifie si l'endpoint est critique
function isEndpointCritical(endpoint) {
    const doc = endpointMap.get(endpoint);
    return doc?.criticalLevel === 'critical' ? 'critical' : 'non-critique';
}


// Réouvrir ticket
async function reopenTicket(ticketId, sessionToken) {
    try {
        const res = await fetch(`${API_URL}/Ticket/${ticketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "App-Token": APP_TOKEN,
                "Authorization": `user_token ${USER_TOKEN}`,
                "Session-Token": sessionToken
            },
            body: JSON.stringify({
                input:{
                    id: ticketId,
                    status: 2  // 2 = En cours (attribué)
                }
            })
        });

        const data = await res.json();
        console.log("Réponse API:", data);

        if (!res.ok) throw new Error(`Erreur API: ${res.status} - ${data}`);

        console.log(`✅ Ticket ${ticketId} réouvert`);
        return true;
    } catch (err) {
        console.error(`❌ Impossible de réouvrir le ticket ${ticketId}: ${err.message}`);
        return false;
    }
}


// Traitement des tickets
async function checkTickets() {
    
    const user = "System";
    const sessionToken = await getSessionToken();

    if (!sessionToken) return;

    const tickets = await getTicketsForRequester(sessionToken);
    const traites = tickets.filter(t => [5, 6].includes(t.statut)); // 5=Traité, 6=Clos

    await Promise.all(traites.map(async t => {
        const endpoint = t.titre.split("|")[0].split(":")[1].trim();
        const critical = isEndpointCritical(endpoint);
        const mailEntry = await mailModel.findOne({ ticketId: t.id });

        if (critical === 'critical') {
            const reopenAt = mailEntry?.reopenAt ? new Date(mailEntry.reopenAt) : null;

            if (!reopenAt) {
                const reopenDate = new Date(now.getTime() + 24*60*60*1000);
                await mailModel.findOneAndUpdate(
                    { endpoint: endpoint },
                    { $set: { ticketId: t.id, reopenAt: reopenDate } },
                    { upsert: true }
                );
                console.log(`⏳ Ticket ${t.id} planifié pour réouverture à ${reopenDate}`);
            } else if (reopenAt <= now && [5,6].includes(t.statut)) {
                const reopened = await reopenTicket(t.id, sessionToken);
                if (reopened) {
                    await mailModel.updateOne({ ticketId: t.id }, { $unset: { reopenAt: "" } });
                    logHistory(`🔄 Ticket ${t.id} réouvert pour endpoint critique ${t.titre}`, user);
                }
            }

            // Vérifier si un mail a déjà été envoyé pour ce endpoint
            const endpointMail = await mailModel.findOne({ endpoint: endpoint });
            const creationDate = endpointMail?.createdAt || now;
            const diffDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
            // Une fois arrivé à 7 jours ou plus, envoyer un mail au responsable si ce n'est pas déjà fait
            if (diffDays >= 7) {
                const demandeurNom = process.env.DEMANDEUR_NOM;
                const responsableMail = process.env.RESPONSABLE_MAIL;
                await responsableMail(endpoint, demandeurNom, diffDays);
            }

        } else if ((t.statut === 5 || t.statut === 6) && critical !== 'critical' && mailEntry?.ticketId) {
            const deleteMail = await mailModel.findOneAndDelete({ ticketId: t.id });
            if (deleteMail) console.log(`✅ Mail supprimé pour ticket ${t.id}`);
        }
    }));

}

// Lancement
function watchTickets() {
    initEndpoints();
    checkTickets();
    setInterval(checkTickets, 2*60*60*1000); // toutes les 2 heures
}

module.exports = watchTickets;
