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
// add event to submit 
form.addEventListener("submit", function(e) {
  e.preventDefault();
  if (!validateForm()) return;

  let experiences = [];
  let expItems = document.querySelectorAll("#experiences-container .exp-item");

  for (let i = 0; i < expItems.length; i++) {
    let inputs = expItems[i].querySelectorAll("input");
    let title   = inputs[0].value.trim();
    let company = inputs[1].value.trim();
    let start   = inputs[2].value;
    let end     = inputs[3].value || null;

    if (title && company && start) {
      experiences.push({
        title: title,
        company: company,
        startDate: start,
        endDate: end
      });
    }
  }

  let worker = {
    id: currentEditId || Date.now().toString(),
    name: form.name.value.trim(),
    role: form.role.value,
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    photo: form.photo.value.trim() || null,
    experiences: experiences
  };

  if (currentEditId) {
    for (let i = 0; i < staff.length; i++) {
      if (staff[i].id === currentEditId) {
        staff[i] = worker;
        break;
      }
    }
  } else {
    staff.push(worker);
  }

  renderAll();
  closeModal("worker-modal");
  form.reset();
  currentEditId = null;
});
// add experience 
const addExperienceField = (title = "", company = "", start = "", end = "") => {
  const div = document.createElement("div");
  div.className = "exp-item";
  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
      <h4 style="margin:0; color:var(--primary);">Expérience</h4>
      <button type="button" style="background:var(--red); color:white; border:none; padding:0.25rem 0.5rem; border-radius:8px; cursor:pointer; font-size:1.2rem;">×</button>
    </div>
    <div class="form-grid">
      <div><label>Poste *</label><input type="text" value="${title}"></div>
      <div><label>Entreprise *</label><input type="text" value="${company}"></div>
      <div><label>Date début *</label><input type="date" value="${start}"></div>
      <div><label>Date fin <small>(laisser vide si actuel)</small></label><input type="date" value="${end}"></div>
    </div>
  `;
  div.querySelector("button").onclick = () => div.remove();
  document.getElementById("experiences-container").appendChild(div);
};
document.getElementById("add-exp").onclick = () => addExperienceField();
// function to close modal 
const closeModal = id => {
  document.getElementById(id).classList.remove("active");
  clearAllErrors();
  form.reset();
  document.getElementById("experiences-container").innerHTML = "";
  document.getElementById("photo-preview").src = "https://via.placeholder.com/150?text=No+Photo";
};
document.getElementById("add-worker-btn").addEventListener("click", () => {
  currentEditId = null;
  form.reset();
  document.getElementById("photo-preview").src = "https://via.placeholder.com/150?text=No+Photo";
  document.getElementById("experiences-container").innerHTML = "";
  addExperienceField();
  document.getElementById("modal-title").textContent = "Ajouter un employé";
  document.getElementById("worker-modal").classList.add("active");
});
// open a modal to edit a worker
window.openEditModal = id => {
  currentEditId = id;
  const p = staff.find(s => s.id === id);
  form.name.value = p.name;
  form.role.value = p.role;
  form.email.value = p.email || "";
  form.phone.value = p.phone || "";
  form.photo.value = p.photo || "";
  document.getElementById("photo-preview").src = p.photo || "https://via.placeholder.com/150?text=No+Photo";
  document.getElementById("modal-title").textContent = "Modifier l'employé";

  const container = document.getElementById("experiences-container");
  container.innerHTML = "";
  (p.experiences || []).forEach(exp => addExperienceField(exp.title, exp.company, exp.startDate, exp.endDate || ""));
  if (!p.experiences?.length) addExperienceField();

  document.getElementById("worker-modal").classList.add("active");
};
form.photo.addEventListener("input", () => {
  const url = form.photo.value.trim();
  document.getElementById("photo-preview").src = url || "https://via.placeholder.com/150?text=No+Photo";
});
// function to render Unassigned workers 
const renderUnassigned = () => {
  const container = document.getElementById("unassigned-list");
  const search = (document.getElementById("search").value || "").toLowerCase();
  const unassigned = staff.filter(s => !Object.values(assignments).flat().includes(s.id));
  const filtered = unassigned.filter(s => s.name.toLowerCase().includes(search) || s.role.toLowerCase().includes(search));
  document.getElementById("unassigned-count").textContent = `(${filtered.length})`;
  container.innerHTML = filtered.map(p => `
    <div class="staff-card" data-id="${p.id}">
      <img src="${p.photo || `https://via.placeholder.com/50?text=${p.name[0]}`}" alt="${p.name}">
      <div class="info"><h4>${p.name}</h4><small>${p.role}</small></div>
      <div class="actions">
        <button onclick="openEditModal('${p.id}')">Edit</button>
        <button onclick="deleteStaff('${p.id}')">Delete</button>
      </div>
    </div>
  `).join("");
};