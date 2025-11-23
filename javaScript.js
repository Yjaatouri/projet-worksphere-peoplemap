// i created the zones 
const zones = [
  { id: "reception", name: "Réception", required: true, max: 8, allowed: ["Réceptionniste","Nettoyage"] },
  { id: "serveurs", name: "Salle des serveurs", required: true, max: 5, allowed: ["Technicien IT","Nettoyage"] },
  { id: "securite", name: "Salle de sécurité", required: true, max: 6, allowed: ["Agent de sécurité","Nettoyage"] },
  { id: "conference", name: "Salle de conférence", required: false, max: 7, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "personnel", name: "Salle du personnel", required: false, max: 10, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "archives", name: "Salle d'archives", required: true, max: 4, allowed: ["Manager"] }
];
// get the worker form fom HTML
const form = document.getElementById("worker-form");
// creat arrays to put staff and assingments
let staff = [];
let assignments = {};
zones.forEach(z => assignments[z.id] = []);
// make flags
let currentEditId = null;
let currentTargetZone = null;
// function to make sure that we dont have one worker in two zones
function removeFromAllZones(id){
  let keys = Object.keys(assignments);
  for(let i = 0 ; i<keys.length;i++){
    let zoneName = keys[i];
    let zonelist = assignments[zoneNAme];
    let newList = [];
    for(let j=0 ; j < zonelist.lenght ; j++){
      if(zonelist[j]!== id){
        newList.push(zonelist[j])
      }
    }
    assignments[zoneName] = newList;
  }
}
// creat a function to make sure that the worker is in a allowed place
function isAllowed(role , zoneId){
  if(role === "Manager"){
    return true;
  }
  let zone = null ;
  for(let i = 0 ; i<zones.length; i++){
    if(zones[i].id === zoneId){
      zone = zones[i];
      break;
    }
    for(let j = 0 ; zone.allowed.lenght;j++){
      if(zone.allowed[j] === role){
        return true;
      }
    }
  }
}