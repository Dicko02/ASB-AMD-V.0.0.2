async function typeMachine(endpoint) {

    const nomMachine = endpoint.CN.toUpperCase(); // on met tout en majuscule
    const systemMachine = endpoint.OperatingSystem.toLowerCase(); // on met tout en minuscule
    const adressIP = endpoint.IPv4Address;

    if (nomMachine.startsWith("WS-") && (systemMachine.includes("windows 11") || systemMachine.includes("windows 10"))) {

        endpoint.typeMachine = "Desktop"; // Les Desktops

    } else if (nomMachine.startsWith("LP-") && (systemMachine.includes("windows 11") || systemMachine.includes("windows 10"))) {

        endpoint.typeMachine = "Laptop"; // Les Laptops
    
    } else if (nomMachine.startsWith("TAB-") || nomMachine.startsWith("TB-")) {
    
        endpoint.typeMachine = "Tablette"; // Les Tablettes
    
    } else if (nomMachine.startsWith("SRV-") && (systemMachine.includes("windows server") || systemMachine.includes("linux"))) {
    
        endpoint.typeMachine = "Server"; // Les Servers
    
    } else if (/^\d{3}/.test(nomMachine)) {
    
        endpoint.typeMachine = "Guichet"; // Les Guichets
    
    } else if (adressIP) {
    
        if (adressIP.startsWith("10.")) {
    
            endpoint.typeMachine = "Caisse"; // Les Caisses ou Guichets
    
        }
    
    } else {
    
        endpoint.typeMachine = "Inconnu"; // Tous les autres
    
    }

    await endpoint.save();
}

module.exports = typeMachine;
