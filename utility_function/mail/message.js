
// Fonction de creation du message du mail
function message(endpoint){

    function dangerousityColor(){
        let CL = endpoint.criticalLevel?.toLowerCase();
        
        if(CL === 'low'){
        return 'green';

        }else if(CL === 'medium'){
        return 'yellow';

        }else if(CL === 'high'){
        return 'orange';

        }else if(CL === 'critical'){
        return 'red';
        }
    };

    function PourcentageCoherence(){
        let resultV1 = (endpoint.incoherenceNumber * 100)/endpoint.incoherenceTotalScore;
        let resultV2 = 100 - resultV1;
        let arrondi = resultV2.toFixed(2); // retourne une chaîne "3.33"
        return arrondi;
    };

    const htmlContent = `
        <div style="
            border:1px solid #e5e7eb;
            border-radius:8px;
            padding:20px;
            margin-bottom:20px;
            box-shadow:0 2px 6px rgba(0,0,0,0.1);
            background-color:#fff;
            font-family:Arial, sans-serif;
            font-size:14px;
            color:#111827;
        ">
            <table style="width:100%; border-collapse:collapse;">
            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Nom</td>
                <td style="padding:8px 12px;">${endpoint.CN ?? 'Inconnu'}</td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Utilisateur</td>
                <td style="padding:8px 12px;">${endpoint.Utilisateur ?? 'Inconnu'}</td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Type de machine</td>
                <td style="padding:8px 12px;">${endpoint.typeMachine ?? 'Inconnu'}</td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Niveau de dangerosité</td>
                <td style="padding:8px 12px; color:${dangerousityColor()};">
                ${endpoint.criticalLevel ?? 'Inconnu'} (score : ${endpoint?.dangerousityNumber ?? 'Inconnu'})
                </td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Pourcentage de cohérence</td>
                <td style="padding:8px 12px; color:#2563eb;">
                ${PourcentageCoherence() ?? 'Inconnu'}%
                </td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Antivirus</td>
                <td style="padding:8px 12px; color:#16a34a;">
                ${endpoint.AntivirusNom ?? 'Inconnu'} (v${endpoint.AntivirusVersion ?? 'Inconnu'}) — Actif : ${endpoint.AntivirusActif ?? 'Inconnu'}
                </td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Adresse IP</td>
                <td style="padding:8px 12px; color:#7c3aed;">
                ${endpoint.IPv4Address ?? 'Inconnu'}
                </td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">État de chiffrement du disque</td>
                <td style="padding:8px 12px;">${endpoint.etatChiffrement ?? 'Inconnu'}</td>
            </tr>

            <tr style="border-bottom:1px solid #e5e7eb; vertical-align:top;">
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Non Conformes</td>
                <td style="padding:8px 12px;">
                ${
                    endpoint.ConformitiesChecked && endpoint.ConformitiesChecked.length > 0
                    ? endpoint.ConformitiesChecked.map(item => `_${item};`).join("<br>")
                    : 'Aucune'
                }
                </td>
            </tr>

            <tr>
                <td style="font-weight:600; color:#374151; padding:8px 12px;">Composants</td>
                <td style="padding:8px 12px;">
                ${endpoint.Composites?.join(', ') || 'Aucune'}
                </td>
            </tr>
            </table>
        </div>
    `;

    const textContent = `
        Nom: ${endpoint.CN ?? 'Inconnu'}
        Utilisateur: ${endpoint.Utilisateur ?? 'Inconnu'}
        Type de machine: ${endpoint.typeMachine ?? 'Inconnu'}
        Niveau de dangerosité: ${endpoint.criticalLevel ?? 'Inconnu'} (score : ${endpoint?.dangerousityNumber ?? 'Inconnu'})
        Pourcentage de cohérence: ${PourcentageCoherence() ?? 'Inconnu'}%
        Antivirus: ${endpoint.AntivirusNom ?? 'Inconnu'} (v${endpoint.AntivirusVersion ?? 'Inconnu'}) — Actif : ${endpoint.AntivirusActif ?? 'Inconnu'}
        Adresse IP: ${endpoint.IPv4Address ?? 'Inconnu'}
        État de chiffrement du disque: ${endpoint.etatChiffrement ?? 'Inconnu'}
        Non Conformes: ${
            endpoint.ConformitiesChecked && endpoint.ConformitiesChecked.length > 0
            ? endpoint.ConformitiesChecked.map(item => `_${item};`).join("\n")
            : 'Aucune'
        }
        Composants: ${endpoint.Composites?.join(', ') || 'Aucune'}
    `;

    return { htmlContent, textContent };
}

module.exports = message;