require('dotenv').config();
const fetch = require('node-fetch');
const mailModel = require('../../models/mail.model');
const logHistory = require('../loggers/logHistory');

const API_URL = process.env.GLPI_URL;
const APP_TOKEN = process.env.GLPI_APP_TOKEN;
const USER_TOKEN = process.env.GLPI_USER_TOKEN;
const DEMANDEUR_NOM = process.env.DEMANDEUR_NOM; //nom exact du demandeur


//Ouverture d'une session API GLPI
async function getSessionToken() {
    const res = await fetch(`${API_URL}/initSession`, {
        headers: {
            'App-Token': APP_TOKEN,
            'Authorization': `user_token ${USER_TOKEN}`
        }
    });
    const data = await res.json();
    return data.session_token;
}


//Récuperation des tickets liés au demandeur
async function getTicketsForRequester(sessionToken) {
    const url = `${API_URL}/search/Ticket?criteria[0][field]=4&criteria[0][searchtype]=contains&criteria[0][value]=${encodeURIComponent(DEMANDEUR_NOM)}`;
    const res = await fetch(url, {
        headers: {
            'Session-Token': sessionToken,
            'App-Token': APP_TOKEN
        }
    });
    const data = await res.json();
    return data.data.map(row => ({
        id: row[2],    //ID du ticket
        titre: row[1], //Titre = endpoint
        statut: row[12] //Statut (4=Résolu, 5=Traité, 6=Clos)
    }));
}


//Vérification et suppression des mails liés aux tickets traités
async function checkTickets() {
    const sessionToken = await getSessionToken();
    const user = "System";

    try {
        const tickets = await getTicketsForRequester(sessionToken);

        //On filtre uniquement les tickets dont le statut est 5 (Traité) ou 6 (Clos)
        const traites = tickets.filter(t => [5, 6].includes(Number(t.statut)));

        if (traites.length === 0) {
            console.log("⏳ Aucun ticket traité pour l’instant.");
            return;
        }

        for (const t of traites) {
                console.log(`✅ Ticket ${t.id} pour endpoint "${t.titre}" est traité.`);

                const deleteMail = await mailModel.findOneAndDelete({ endpoint: t.titre });

                if (deleteMail) {
                    console.log(`✅ Mail supprimé pour endpoint ${t.titre}`);
                    logHistory(`✅ Suppression du mail pour endpoint ${t.titre}`, user);
                } else {
                    console.log(`ℹ️ Aucun mail trouvé pour endpoint ${t.titre}`);
                    logHistory(`ℹ️ Aucun mail trouvé pour endpoint ${t.titre}`, user);
                }
        }
    } catch (error) {
        console.error("❌ Erreur dans checkTickets:", error);
        logHistory(`❌ Erreur checkTickets: ${error.message}`, user);
    }
}

//Lancement de la surveillance toutes les 60 minutes
function watchTickets() {
    checkTickets(); //exécution une fois au démarrage
    setInterval(checkTickets, 3600000); //re-exécution toutes les 60 min
}

module.exports = watchTickets;
