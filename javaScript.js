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
for(let i = 0; i<zones.length ; i++){
  assignments[zones[i].id] = [];
}

// make flags
let currentEditId = null;
let currentTargetZone = null;
// function to make sure that we dont have one worker in two zones
function removeFromAllZones(id){
  let keys = [];
  keys.push("reception");
  keys.push("serveurs");
  keys.push("securite");
  keys.push("conference");
  keys.push("personnel");
  keys.push("archives");

  for(let i = 0 ; i<keys.lenght ; i++){
    let zoneName = keys[i];
    let zoneList = assignments[zoneName];
    let newList = [];
    for(let j = 0 ; j<zoneList.lenght ; j++){
      if(zoneList[j] !==id){
        newList.push(zoneList[j]);
      }
    }
    assignments[zoneName] = newList;
  }
}
// creat a function to make sure that the worker is in a allowed place
function isAllowed(role, zoneId) {

  if (role === "Manager") {
    return true;
  }
  let zone = null;
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].id === zoneId) {
      zone = zones[i];
      break;
    }
  }
  for (let j = 0; j < zone.allowed.length; j++) {
    if (zone.allowed[j] === role) {
      return true;
    }
  }
 return false;
}
// creat a function to add worker to a zone
function canAddToZone(zoneId){
  let zone = null;
  for(let i = 0 ;i<zones.length; i++){
    if(zones[i].id === zoneId){
      zone = zones[i];
      break;
    }
  }
  let count = 0;
  if(assignments[zoneId]){
    count = assignments[zoneId].lenght;
  } 
  if(count<zone.max){
    return true;
  }else{
    alert("Impossible d'ajouter un travailleur à cette zone.");
    return false;
  }
}
function getCurrentLocation(id) {
  for (let i = 0; i < zones.length; i++) {
    let zoneId = zones[i].id;
    let list = assignments[zoneId];

    for (let j = 0; j < list.length; j++) {
      if (list[j] === id) {
        return zones[i].name;
      }
    }
  }
  return "Non assigné";
}
// crear a arrow function to show errors 
const showError = (input, msg) => {
  const errorEl = input.parentElement.querySelector(".error-msg");
  if(errorEl){
    errorEl.textContennt = msg;
    errorEl.style.opacity = "1"; 
  }
};
// function to clear error
const clearError = input => {
  const errorEl = input.parentElement.querySelector(".error-msg");
  if (errorEl) errorEl.style.opacity = "0";
};
// clear all errors to submit
const clearAllErrors = () => {
  form.querySelectorAll("input, select").forEach(clearError);
  document.querySelectorAll(".exp-date-error").forEach(el => el.remove());
};
// creat validation and regex 
const validateForm = () => {
  clearAllErrors();
  let valid = true;
  let firstError = null;

  const nameVal = form.name.value.trim();
  if (!nameVal || !/^[A-Za-zÀ-ÿ\s'-]{2,40}$/.test(nameVal)) {
    showError(form.name, "Nom invalide (2–40 lettres)");
    valid = false;
    if (!firstError) firstError = form.name;
  }

  if (!form.role.value) {
    showError(form.role, "Choisissez un rôle");
    valid = false;
    if (!firstError) firstError = form.role;
  }

  const emailVal = form.email.value.trim();
  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    showError(form.email, "Email invalide");
    valid = false;
    if (!firstError) firstError = form.email;
  }

  const phoneVal = form.phone.value.trim().replace(/[\s\-\.]/g, '');
  const phoneRegex = /^(0|\+33|0033)[1-9]\d{8}$/;
  if (!phoneVal || !phoneRegex.test(phoneVal)) {
    showError(form.phone, "Format: 06 12 34 56 78 ou +33612345678");
    valid = false;
    if (!firstError) firstError = form.phone;
  }


  const expItems = document.querySelectorAll("#experiences-container .exp-item");
  let hasCompleteExp = false;

  expItems.forEach(item => {
    const inputs = item.querySelectorAll("input");
    const [titleInp, companyInp, startInp, endInp] = inputs;

    if (startInp.value && endInp.value && endInp.value < startInp.value) {
      endInp.style.borderColor = "var(--red)";
      let msg = item.querySelector(".exp-date-error");
      if (!msg) {
        msg = document.createElement("small");
        msg.className = "exp-date-error error-msg";
        msg.style.color = "var(--red)";
        endInp.parentElement.appendChild(msg);
      }
      msg.textContent = "Date de fin ≥ date début";
      msg.style.opacity = "1";
      valid = false;
    }

    if (titleInp.value.trim() && companyInp.value.trim() && startInp.value) {
      hasCompleteExp = true;
    }
  });

  if (expItems.length > 0 && !hasCompleteExp) {
    alert("Ajoutez au moins une expérience complète (Poste + Entreprise + Date début)");
    valid = false;
  }

  if (!valid && firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    firstError.focus();
  }

  return valid;
};