const zones = [
  { id: "reception", name: "Réception", required: true, max: 6, allowed: ["Réceptionniste","Nettoyage"] },
  { id: "serveurs", name: "Salle des serveurs", required: true, max: 4, allowed: ["Technicien IT","Nettoyage"] },
  { id: "securite", name: "Salle de sécurité", required: true, max: 4, allowed: ["Agent de sécurité","Nettoyage"] },
  { id: "conference", name: "Salle de conférence", required: false, max: 8, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "personnel", name: "Salle du personnel", required: false, max: 7, allowed: ["Nettoyage","Réceptionniste","Technicien IT","Manager","Agent de sécurité"] },
  { id: "archives", name: "Salle d'archives", required: true, max: 5, allowed: ["Manager"] }
];
const form = document.getElementById("worker-form");
let staff = [
];
let assignments = {};
zones.forEach(z => assignments[z.id] = []);
let currentEditId = null;
let currentTargetZone = null;
function removeFromAllZones(id) {
  let keys = Object.keys(assignments); 

  for (let i = 0; i < keys.length; i++) {
    let zoneName = keys[i];
    let zoneList = assignments[zoneName];
    let newList = [];
    for (let j = 0; j < zoneList.length; j++) {
      if (zoneList[j] !== id) {
        newList.push(zoneList[j]);
      }
    }
    assignments[zoneName] = newList;
  }
}

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

function canAddToZone(zoneId) {
  
  let zone = null;
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].id === zoneId) {
      zone = zones[i];
      break;
    }
  }

  
  if (!zone) {
    return false;
  }

  
  let currentCount = 0;
  if (assignments[zoneId]) {
    currentCount = assignments[zoneId].length;
  }

  
  if (currentCount < zone.max) {
    return true;
  } else {
    
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
const showError = (input, msg) => {
  const errorEl = input.parentElement.querySelector(".error-msg");
  if (errorEl  ){
    errorEl.textContent = msg;
    errorEl.style.opacity = "1";
  }
};
const clearError = input => {
  const errorEl = input.parentElement.querySelector(".error-msg");
  if (errorEl || input === "") {errorEl.style.opacity = "0"};
};
const clearAllErrors = () => {
  form.querySelectorAll("input, select").forEach(clearError);
  document.querySelectorAll(".exp-date-error").forEach(el => el.remove());
};
function validateForm() {
  clearAllErrors();
  let valid = true;
  let firstErrorField = null;

  let nameValue = form.name.value.trim();
  if (nameValue === "" || !/^[A-Za-zÀ-ÿ\s'-]{2,40}$/.test(nameValue)) {
    showError(form.name, "(2–40 lettres)");
    valid = false;
    if (firstErrorField === null) firstErrorField = form.name;
  }

  if (form.role.value === "") {
    showError(form.role, "Choisissez un rôle");
    valid = false;
    if (firstErrorField === null) firstErrorField = form.role;
  }

  let emailValue = form.email.value.trim();
  if (emailValue === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    showError(form.email, "Entre un email valide");
    valid = false;
    if (firstErrorField === null) firstErrorField = form.email;
  }

  let phoneValue = form.phone.value.trim().replace(/[\s\-\.]/g, '');
  let phoneRegex = /^(0|\+33|0033)[1-9]\d{8}$/;
  if (phoneValue === "" || !phoneRegex.test(phoneValue)) {
    showError(form.phone, "Format: 06 12 34 56 78 ou +33612345678");
    valid = false;
    if (firstErrorField === null) firstErrorField = form.phone;
  }

  let expItems = document.querySelectorAll("#experiences-container .exp-item");
  let hasFullExperience = false;

  for (let i = 0; i < expItems.length; i++) {
    let item = expItems[i];
    let inputs = item.querySelectorAll("input");
    let title   = inputs[0];
    let company = inputs[1];
    let start   = inputs[2];
    let end     = inputs[3];

    if (start.value && end.value && end.value < start.value) {
      end.style.borderColor = "red";
      let msg = item.querySelector(".exp-date-error");
      if (!msg) {
        msg = document.createElement("small");
        msg.className = "exp-date-error error-msg";
        msg.style.color = "red";
        end.parentElement.appendChild(msg);
      }
      msg.textContent = "Date de fin doit être après date début";
      msg.style.opacity = "1";
      valid = false;
    }

    if (title.value.trim() && company.value.trim() && start.value) {
      hasFullExperience = true;
    }
  }

  if (expItems.length > 0 && !hasFullExperience) {
    alert("Ajoutez au moins une expérience complète (Poste + Entreprise + Date début)");
    valid = false;
  }

  if (!valid && firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    firstErrorField.focus();
  }

  return valid;
}

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
window.openEditModal = id => {
  currentEditId = id;
  const p = staff.find(s => s.id === id);
  form.name.value = p.name;
  form.role.value = p.role;
  form.email.value = p.email || "";
  form.phone.value = p.phone || "";
  form.photo.value = p.photo || "";
  document.getElementById("photo-preview").src = p.photo;
  document.getElementById("modal-title").textContent = "Modifier l'employé";

  const container = document.getElementById("experiences-container");
  container.innerHTML = "";
  (p.experiences || []).forEach(exp => addExperienceField(exp.title, exp.company, exp.startDate, exp.endDate || ""));
  if (!p.experiences?.length) addExperienceField();

  document.getElementById("worker-modal").classList.add("active");
};
form.photo.addEventListener("input", () => {
  const url = form.photo.value.trim();
  document.getElementById("photo-preview").src = url ;
});

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
const renderZones = () => {
  zones.forEach(zone => {
    const zoneEl = document.querySelector(`[data-zone="${zone.id}"]`);
    const occupied = assignments[zone.id] || [];
    const counter = zoneEl.querySelector(".zone-counter");
    const list = zoneEl.querySelector(".occupied-list");
    const isEmptyRequired = zone.required && occupied.length === 0;
    counter.textContent = `${occupied.length}/${zone.max}`;
    if (isEmptyRequired) counter.textContent += " (Obligatoire)";
    if (isEmptyRequired) {
      zoneEl.classList.add("required", "empty");
    } else {
      zoneEl.classList.remove("required", "empty");
    }
    list.innerHTML = occupied.map(id => {
      const p = staff.find(s => s.id === id);
      if (!p) return "";
      return `
        <div class="staff-card" data-id="${p.id}" onclick="openProfile('${p.id}')">
          <img src="${p.photo || `https://via.placeholder.com/50?text=${p.name[0]}`}" alt="${p.name}">
          <div class="info"><h4>${p.name}</h4><small>${p.role}</small></div>
          <button onclick="event.stopPropagation(); unassign('${p.id}')">X</button>
        </div>`;
    }).join("");
  });
};
const renderAll = () => { renderUnassigned(); renderZones(); };
window.unassign = id => {
  removeFromAllZones(id);
  renderAll();
};
window.deleteStaff = id => {
  if (confirm("Supprimer cet employé définitivement ?")) {
    staff = staff.filter(s => s.id !== id);
    removeFromAllZones(id);
    renderAll();
  }
};
window.openAddToZone = zoneId => {
  currentTargetZone = zoneId;
  const zone = zones.find(z => z.id === zoneId);
  document.getElementById("add-to-zone-title").textContent = `Assigner → ${zone.name} (${assignments[zoneId].length}/${zone.max})`;
  const eligible = staff.filter(s =>
    !Object.values(assignments).flat().includes(s.id) &&
    isAllowed(s.role, zoneId) &&
    canAddToZone(zoneId)
  );
  const list = document.getElementById("eligible-list");
  const noMsg = document.getElementById("no-eligible");
  if (eligible.length === 0) {
    list.innerHTML = "";
    noMsg.style.display = "block";
  } else {
    noMsg.style.display = "none";
    list.innerHTML = eligible.map(p => `
      <div class="staff-card" onclick="assignToCurrentZone('${p.id}')" style="cursor:pointer;">
        <img src="${p.photo || `https://via.placeholder.com/50?text=${p.name[0]}`}" alt="${p.name}">
        <div class="info"><h4>${p.name}</h4><small>${p.role}</small></div>
      </div>
    `).join("");
  }
  document.getElementById("add-to-zone-modal").classList.add("active");
};
window.assignToCurrentZone = id => {
  if (!currentTargetZone) return;
  removeFromAllZones(id);
  assignments[currentTargetZone].push(id);
  renderAll();
  document.getElementById("add-to-zone-modal").classList.remove("active");
  currentTargetZone = null;
};
window.openProfile = id => {
  const p = staff.find(s => s.id === id);
  if (!p) return;
  document.getElementById("profile-name").textContent = p.name;
  document.getElementById("profile-role").textContent = p.role;
  document.getElementById("profile-email").textContent = p.email || "Non renseigné";
  document.getElementById("profile-phone").textContent = p.phone || "Non renseigné";
  document.getElementById("profile-location").textContent = getCurrentLocation(id);
  document.getElementById("profile-photo").src = p.photo ;
  const expList = document.getElementById("profile-experiences");
  expList.innerHTML = p.experiences?.length
    ? p.experiences.map(e => `<li><strong>${e.title}</strong> — ${e.company} (${new Date(e.startDate).getFullYear()} → ${e.endDate ? new Date(e.endDate).getFullYear() : "Présent"})</li>`).join("")
    : "<li>Aucune expérience renseignée</li>";
  document.getElementById("profile-modal").classList.add("active");
};
document.querySelectorAll(".close-modal").forEach(btn => {
  btn.addEventListener("click", () => btn.closest(".modal").classList.remove("active"));
});
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("active");
  });
});
document.getElementById("search").addEventListener("input", renderUnassigned);
renderAll();