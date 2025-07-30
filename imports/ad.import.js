require('dotenv').config();
const { Client } = require('ldapts');
const adData = require('../models/ad.model');
const parseDate = require('../utility_function/parseDateValue');

async function importAdFromLdap() {
  const url = process.env.AD_URL;
  const bindDN = process.env.AD_BIND_DN;
  const password = process.env.AD_PASSWORD;
  const baseDN = process.env.AD_BASE_DN;

  // Vérification des variables essentielles
  if (!url || !bindDN || !password || !baseDN) {
    throw new Error('Variables d’environnement LDAP manquantes (AD_URL, AD_BIND_DN, AD_PASSWORD, AD_BASE_DN)');
  }

  // Création du client LDAP avec options récentes (évite warning punycode)
  const client = new Client({
    url,
    timeout: 10000, // 10 secondes
    connectTimeout: 5000,
  });

  try {
    await client.bind(bindDN, password);
    console.log('✅ Bind LDAP réussi.');

    const { searchEntries } = await client.search(baseDN, {
      scope: 'sub',
      filter: '(objectClass=computer)',
      attributes: [
        'cn', 'name', 'dNSHostName', 'operatingSystem',
        'operatingSystemVersion', 'lastLogonTimestamp',
        'whenCreated', 'description'
      ]
    });

    if (!searchEntries?.length) {
      console.log('⚠️ Aucun ordinateur trouvé dans Active Directory.');
      return;
    }

    const cnSet = new Set();
    let updatesCount = 0;

    const cleanField = (field) => {
      if (Array.isArray(field) && field.length === 0) return "";
      return field;
    };

    for (const e of searchEntries) {
      try {
        if (!e.cn || cnSet.has(e.cn)) {
          if (e.cn) console.log(`⚠️ Doublon détecté pour ${e.cn}, ignoré.`);
          continue;
        }
        cnSet.add(e.cn);

        // Gestion robuste de whenCreated via la fonction utilitaire
        let whenCreated = null;
        try {
          if (e.whenCreated) {
            const parsed = parseDate(e.whenCreated); // ← utilise ta fonction
            if (parsed && !isNaN(parsed)) {
              whenCreated = parsed;
            } else {
              console.log(`⚠️ whenCreated invalide pour ${e.cn}, valeur ignorée.`);
            }
          }
        } catch {
          console.log(`⚠️ Erreur lors du parsing de whenCreated pour ${e.cn}, valeur ignorée.`);
        }

        // Gestion robuste de lastLogonTimestamp (via ta fonction utilitaire)
        let lastLogonDate = null;
        try {
          if (e.lastLogonTimestamp && typeof e.lastLogonTimestamp === 'string' && e.lastLogonTimestamp.trim() !== '') {
            const parsed = parseDate(e.lastLogonTimestamp);
            if (parsed && !isNaN(parsed)) {
              lastLogonDate = parsed;
            } else {
              console.log(`⚠️ lastLogonTimestamp invalide pour ${e.cn}, valeur ignorée.`);
            }
          }
        } catch {
          console.log(`⚠️ Erreur lors du parsing de lastLogonTimestamp pour ${e.cn}, valeur ignorée.`);
        }

        // Construction du document MongoDB
        const doc = {
          CN: e.cn,
          DistinguishedName: e.dn,
          whenCreated,
          LastLogonDate: lastLogonDate,
          OperatingSystem: cleanField(e.operatingSystem),
          OperatingSystemVersion: cleanField(e.operatingSystemVersion),
          DNSHostName: cleanField(e.dNSHostName),
          Description: Array.isArray(e.description) && e.description.length === 0 ? "" : e.description,
        };

        await adData.updateOne({ CN: doc.CN }, { $set: doc }, { upsert: true });
        updatesCount++;
      } catch (err) {
        console.error(`❌ Erreur sur l’entrée ${e.cn || '[sans CN]'} :`, err.message);
      }
    }

    console.log(`✅ ${updatesCount} ordinateurs AD insérés/mis à jour.`);
  } catch (err) {
    console.error('❌ Erreur durant import LDAPTS :', err.message || err);
  } finally {
    await client.unbind().catch(() => {});
  }
}

module.exports = importAdFromLdap;
