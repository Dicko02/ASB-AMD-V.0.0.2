
async function typeMachine(endpoint){

    const nomMachine = endpoint.CN;
    const systemMachine = endpoint.OperatingSystem;
    const adressIP = endpoint.IPv4Address;

    if(nomMachine.startsWith("WS-") && (systemMachine.includes("Windows 11") || systemMachine.includes("Windows 10"))){

        endpoint.typeMachine = "Desktop"; //Les Desktops

    }else if(nomMachine.startsWith("LP-") && (systemMachine.includes("Windows 11") || systemMachine.includes("Windows 10"))){

        endpoint.typeMachine = "Laptop"; //Les Laptops

    }else if(nomMachine.startsWith("TAB-")){

        endpoint.typeMachine = "Tablette"; //Les Tablettes

    }else if((systemMachine.includes("Windows server") || systemMachine.includes("Linux"))){

        endpoint.typeMachine = "Server"; //Les Servers

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