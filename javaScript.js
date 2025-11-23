const zones = [
  { id: "reception", name: "Réception", required: true, max: 5, allowed: ["Réceptionniste","Nettoyage"] },
  { id: "serveurs", name: "Salle des serveurs", required: true, max: 4, allowed: ["Technicien IT","Nettoyage"] },
  { id: "securite", name: "Salle de sécurité", required: true, max: 4, allowed: ["Agent de sécurité","Nettoyage"] },
  { id: "conference", name: "Salle de conférence", required: false, max: 20, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "personnel", name: "Salle du personnel", required: false, max: 20, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "archives", name: "Salle d'archives", required: true, max: 5, allowed: ["Manager"] }
];

const form = document.getElementById("worker-form");


let staff = [];
let assignments = {};
zones.forEach(z => assignments[z.id] = []);

let currentEditId = null;
let currentTargetZone = null;
