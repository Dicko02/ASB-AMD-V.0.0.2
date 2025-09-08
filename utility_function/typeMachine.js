
async function typeMachine(endpoint){

    const nomMachine = endpoint.CN;
    const systemMachine = endpoint.OperatingSystem;
    const adressIP = endpoint.IPv4Address;

    if(nomMachine.startsWith("WS-") && (systemMachine.includes("Windows 11") || systemMachine.includes("Windows 10"))){

        endpoint.typeMachine = "Desktop"; //Les Desktops

    }else if(nomMachine.startsWith("LP-") && (systemMachine.includes("Windows 11") || systemMachine.includes("Windows 10"))){

        endpoint.typeMachine = "Laptop"; //Les Laptops

    }else if(nomMachine.startsWith("TAB-") || nomMachine.startsWith("TB-")){

        endpoint.typeMachine = "Tablette"; //Les Tablettes

    }else if(nomMachine.startsWith("SRV-") && (systemMachine.includes("Windows server") || systemMachine.includes("Linux"))){

        endpoint.typeMachine = "Server"; //Les Servers

    }else if(/^\d{3}/.test(nomMachine)){

        endpoint.typeMachine = "Guichet"; //Les Guichets

    }else if(adressIP){

        if(adressIP.startsWith("10.")){

            endpoint.typeMachine = "Caisse"; //Les Caisses ou Guichets

        }

    }else{

        endpoint.typeMachine = "Inconnu"; //Tous les autres
        
    }

    await endpoint.save();
}

module.exports = typeMachine;