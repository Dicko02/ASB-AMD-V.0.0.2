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

// Vérifie si l'endpoint est critique
async function isEndpointCritical(endpoint) {
    const CN = endpoint;
    const doc = await endpointsModel.findOne({ CN });

    if(doc?.criticalLevel === 'critical'){
        return 'critical';
    }else{
        return 'non-critique';
    }

}

// Réouvrir ticket
async function reopenTicket(ticketId) {
    try {
        const res = await fetch(`${API_URL}/Ticket/${ticketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "App-Token": APP_TOKEN,
                "Authorization": `user_token ${USER_TOKEN}`
            },
            body: JSON.stringify({ status: 1 }) // 1 = Nouveau
        });
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
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

    for (const t of traites) {
        // Extraction de l'endpoint du titre et vérification de son état critique
        const endpoint = t.titre.split("|")[0].split(":")[1].trim();
        const critical = await isEndpointCritical(endpoint);

        // vérifier si le ticket critique a déjà un champ reopenAt
        const mailEntry = await mailModel.findOne({ ticketId: t.id });
        if (critical === 'critical') {
            const now = new Date();
            const reopenAt = mailEntry?.reopenAt ? new Date(mailEntry.reopenAt) : null;

            if (!reopenAt) {

                // création du champ reopenAt +24h si inexistant
                const reopenDate = new Date(now.getTime() + 24*60*60*1000);

                await mailModel.findOneAndUpdate(
                    { endpoint: endpoint },
                    { $set: { ticketId: t.id, reopenAt: reopenDate } },
                    { upsert: true }
                );

                console.log(`⏳ Ticket ${t.id} pour endpoint "${t.titre}" critique → réouverture planifiée à ${reopenDate}`);

            } else if (reopenAt <= now) {

                // réouverture du ticket si la date est passée et toujours critique
                if ([5,6].includes(t.statut)) {

                    const reopened = await reopenTicket(t.id);

                    if (reopened) {

                        // Suppression du champ reopenAt
                        await mailModel.updateOne({ ticketId: t.id }, { $unset: { reopenAt: "" } });
                        logHistory(`🔄 Ticket ${t.id} réouvert pour endpoint critique ${t.titre}`, user);

                    }
                }
            }
        } else if ((t.statut === 5 || t.statut === 6) && critical != 'critical' && mailEntry?.ticketId) {

            // Suppression uniquement par ticketId
            const deleteMail = await mailModel.findOneAndDelete({ ticketId: t.id });

            if (deleteMail) {
                console.log(`✅ Mail supprimé par id du ticket pour endpoint ${endpoint}`);
                logHistory(`✅ Suppression mail pour endpoint ${endpoint}`, user);
            } else {
                console.log(`ℹ️ Aucun mail trouvé pour ticketId ${t.id} (endpoint ${endpoint})`);
                logHistory(`ℹ️ Aucun mail trouvé pour ticketId ${t.id} (endpoint ${endpoint})`, user);
            }

        } else {
            console.log(`ℹ️ le mail dedie au ticket qui a pour ticketId ${t.id} (endpoint ${endpoint}) n'a pas ete trouve ou le ticket n'est pas dans un etat a traiter`);
            logHistory(`ℹ️ Aucun mail trouvé pour ticketId ${t.id} (endpoint ${endpoint})`, user);
        }
    }
}

// Lancement
function watchTickets() {
    checkTickets();
    setInterval(checkTickets, 2*60*60*1000); // toutes les 2 heures
}

module.exports = watchTickets;
