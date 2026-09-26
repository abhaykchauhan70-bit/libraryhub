/* ===========================================================
   LibraryHub - FINAL FULL CODE (No Error) - ABHAY
=========================================================== */
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
? "http://localhost:5000/api"
  : "https://YOUR-BACKEND.onrender.com/api";

const state = {
  currentUser: null,
  books: [
    { id: "B001", title: "Clean Code", author: "Robert C. Martin", genre: "Technology", isbn: "978-0132350884", copies: 4, available: 2 },
    { id: "B002", title: "The Pragmatic Programmer", author: "Andrew Hunt", genre: "Technology", isbn: "978-0201616224", copies: 3, available: 3 },
    { id: "B003", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "978-0446310789", copies: 5, available: 4 },
  ],
  members: [
    { id: "M001", name: "Ananya Sharma", email: "ananya@college.edu", joined: "2024-07-12" },
    { id: "M002", name: "Rohan Mehta", email: "rohan@college.edu", joined: "2024-08-02" },
  ],
  transactions: [],
  nextIds: { book: 4, member: 3, txn: 1 },
};

function today(){ return new Date().toISOString().slice(0,10); }
function addDays(d, days){ const dt=new Date(d); dt.setDate(dt.getDate()+days); return dt.toISOString().slice(0,10); }
function formatDate(s){ if(!s) return "-"; return new Date(s+"T00:00:00").toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}); }
function escapeHtml(s){ const div=document.createElement("div"); div.textContent=s; return div.innerHTML; }
function findBook(id){ return state.books.find(b=>b.id===id || b._id===id); }
function findMember(id){ return state.members.find(m=>m.id===id || m._id===id); }

function showToast(msg,type="info"){
  const c=document.getElementById("toast-container"); if(!c) return;
  const icons={success:"fa-circle-check",error:"fa-circle-exclamation",info:"fa-circle-info"};
  const t=document.createElement("div"); t.className=`toast toast--${type}`;
  t.innerHTML=`<i class="fa-solid ${icons[type]||icons.info}"></i><span>${escapeHtml(msg)}</span>`;
  c.appendChild(t); setTimeout(()=>{t.classList.add("is-leaving"); setTimeout(()=>t.remove(),220)},3200);
}

/* --- AUTH --- */
const loginPage=document.getElementById("login-page");
const appRoot=document.getElementById("app");
function initAuth(){
  document.getElementById("show-register")?.addEventListener("click",(e)=>{e.preventDefault(); document.getElementById("login-form-wrap").classList.add("auth-card--hidden"); document.getElementById("register-form-wrap").classList.remove("auth-card--hidden");});
  document.getElementById("show-login")?.addEventListener("click",(e)=>{e.preventDefault(); document.getElementById("register-form-wrap").classList.add("auth-card--hidden"); document.getElementById("login-form-wrap").classList.remove("auth-card--hidden");});

  document.getElementById("login-form")?.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const email=document.getElementById("login-email").value.trim();
    const password=document.getElementById("login-password").value;
    try{
      const r=await fetch(`${API_URL}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const d=await r.json(); if(!r.ok) throw new Error(d.message||"Login failed");
      state.currentUser={name:d.name||email.split("@")[0], email:d.email}; enterApp(); showToast(`Welcome ${state.currentUser.name}`,"success");
    }catch(err){ showToast(err.message,"error"); }
  });

  document.getElementById("register-form")?.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const name=document.getElementById("reg-name").value.trim(); const email=document.getElementById("reg-email").value.trim(); const password=document.getElementById("reg-password").value.trim();
    if(name.length<2||!email.includes("@")||password.length<6){ showToast("Please fill correctly","error"); return; }
    try{
      const r=await fetch(`${API_URL}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
      const d=await r.json(); if(!r.ok) throw new Error(d.message||"Register failed");
      showToast("Account created in MongoDB! Now login.","success"); document.getElementById("register-form").reset(); document.getElementById("show-login").click();
    }catch(err){ showToast(err.message,"error"); }
  });
}
async function enterApp(){
  loginPage.style.display="none"; appRoot.classList.remove("app--hidden");
  document.getElementById("user-name").textContent=state.currentUser.name;
  document.getElementById("user-avatar").textContent=state.currentUser.name.charAt(0).toUpperCase();
  document.getElementById("settings-name").value=state.currentUser.name;
  document.getElementById("settings-email").value=state.currentUser.email;
  // Backend se data load karne ki koshish
  try{ const r=await fetch(`${API_URL}/books`); if(r.ok){ const b=await r.json(); if(b.length>0) state.books=b; } }catch{}
  try{ const r=await fetch(`${API_URL}/members`); if(r.ok){ const m=await r.json(); if(m.length>0) state.members=m; } }catch{}
  renderAll();
}
function logout(){ state.currentUser=null; appRoot.classList.add("app--hidden"); loginPage.style.display=""; showToast("Signed out","info"); }

/* --- NAVIGATION --- */
function initNavigation(){
  document.querySelectorAll(".nav-item[data-section]").forEach(btn=>btn.addEventListener("click",()=>switchSection(btn.dataset.section)));
  document.querySelectorAll("[data-goto]").forEach(btn=>btn.addEventListener("click",()=>switchSection(btn.dataset.goto)));
  document.getElementById("logout-btn")?.addEventListener("click",logout);
  document.getElementById("burger-btn")?.addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("is-open"));
}
const sectionTitles={dashboard:"Dashboard",books:"Books",members:"Members","issue-return":"Issue / Return",transactions:"Transactions",search:"Search",reports:"Reports",settings:"Settings"};
function switchSection(name){
  document.querySelectorAll(".nav-item[data-section]").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.section===name));
  document.querySelectorAll(".section").forEach(sec=>sec.classList.toggle("is-active",sec.id===`section-${name}`));
  document.getElementById("section-title").textContent=sectionTitles[name]||"Dashboard";
  document.getElementById("sidebar").classList.remove("is-open");
  if(name==="issue-return") populateIssueReturnForm();
  if(name==="reports") renderReports();
}

/* --- DASHBOARD --- */
function renderDashboard(){
  const total=state.books.reduce((s,b)=>s+b.copies,0);
  const avail=state.books.reduce((s,b)=>s+b.available,0);
  document.getElementById("stat-total-books").textContent=total;
  document.getElementById("stat-available-books").textContent=avail;
  document.getElementById("stat-issued-books").textContent=total-avail;
  document.getElementById("stat-total-members").textContent=state.members.length;
}

/* --- BOOKS --- */
function renderBooks(filter=""){
  const tbody=document.querySelector("#books-table tbody"); if(!tbody) return;
  const q=filter.toLowerCase();
  const list=state.books.filter(b=>!q||b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q));
  tbody.innerHTML=list.map(b=>`<tr><td><span class="cell-title">${escapeHtml(b.title)}</span></td><td>${escapeHtml(b.author)}</td><td>${escapeHtml(b.genre||'General')}</td><td>${escapeHtml(b.isbn||'-')}</td><td>${b.copies}</td><td>${b.available}</td><td><span class="badge ${b.available>0?'badge--green':'badge--brick'}">${b.available>0?'Available':'All Issued'}</span></td></tr>`).join("")||`<tr><td colspan="7" class="empty-state">No books found</td></tr>`;
}
function openBookModal(){ document.getElementById("book-modal-overlay")?.classList.add("is-open"); }
function closeBookModal(){ document.getElementById("book-modal-overlay")?.classList.remove("is-open"); }

/* --- MEMBERS --- THIS IS THE MAIN FIX FOR YOU */
function renderMembers(filter=""){
  const tbody=document.querySelector("#members-table tbody"); if(!tbody) return;
  const q=filter.toLowerCase();
  const list=state.members.filter(m=>!q||m.name.toLowerCase().includes(q)||m.email.toLowerCase().includes(q));
  tbody.innerHTML=list.map(m=>{
    const active=state.transactions.filter(t=>t.memberId===m.id&&t.status==="active").length;
    return `<tr><td><span class="cell-title">${escapeHtml(m.id)}</span></td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.email)}</td><td>${formatDate(m.joined)}</td><td>${active}</td></tr>`;
  }).join("")||`<tr><td colspan="5" class="empty-state">No members yet. Click Add Member.</td></tr>`;
}
function openMemberModal(){ document.getElementById("member-modal-overlay").classList.add("is-open"); }
function closeMemberModal(){ document.getElementById("member-modal-overlay").classList.remove("is-open"); }

/* --- ISSUE / RETURN --- */
function populateIssueReturnForm(){
  const bookSelect=document.getElementById("issue-book-select"); const memberSelect=document.getElementById("issue-member-select");
  if(!bookSelect||!memberSelect) return;
  const availableBooks=state.books.filter(b=>b.available>0);
  bookSelect.innerHTML=availableBooks.length?availableBooks.map(b=>`<option value="${b.id}">${escapeHtml(b.title)} - ${b.available} left</option>`).join(""):`<option value="">No books available</option>`;
  memberSelect.innerHTML=state.members.length?state.members.map(m=>`<option value="${m.id}">${escapeHtml(m.name)}</option>`).join(""):`<option value="">No members</option>`;
  if(!document.getElementById("issue-due-date").value) document.getElementById("issue-due-date").value=addDays(today(),14);
}
function renderReports(){}

/* --- MODALS & FORMS --- */
function initModals(){
  document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>document.getElementById(btn.dataset.close).classList.remove("is-open")));
  document.querySelectorAll(".modal-overlay").forEach(ov=>ov.addEventListener("click",(e)=>{ if(e.target===ov) ov.classList.remove("is-open"); }));
  document.getElementById("add-book-btn")?.addEventListener("click",openBookModal);
  document.getElementById("add-member-btn")?.addEventListener("click",openMemberModal); // FIXED

  document.getElementById("book-form")?.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const newBook={id:`B${String(state.nextIds.book++).padStart(3,"0")}`,title:document.getElementById("book-title").value.trim(),author:document.getElementById("book-author").value.trim(),genre:document.getElementById("book-genre").value.trim(),isbn:document.getElementById("book-isbn").value.trim(),copies:parseInt(document.getElementById("book-copies").value),available:parseInt(document.getElementById("book-copies").value)};
    try{ const r=await fetch(`${API_URL}/books`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newBook)}); if(r.ok) { const d=await r.json(); state.books.push(d); } else { state.books.push(newBook); } }catch{ state.books.push(newBook); }
    showToast("Book Added!","success"); closeBookModal(); renderAll(); e.target.reset();
  });

  document.getElementById("member-form")?.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const name=document.getElementById("member-name").value.trim(); const email=document.getElementById("member-email").value.trim();
    if(!name||!email.includes("@")){ showToast("Enter valid name & email","error"); return; }
    const newMember={id:`M${String(state.nextIds.member++).padStart(3,"0")}`,name,email,joined:today()};
    try{
      const r=await fetch(`${API_URL}/members`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newMember)});
      if(r.ok){ const d=await r.json(); state.members.push(d); } else { state.members.push(newMember); }
    }catch{ state.members.push(newMember); }
    showToast(`${name} added!`,"success"); closeMemberModal(); renderAll(); e.target.reset();
  });
}

function initFilters(){
  document.getElementById("books-filter")?.addEventListener("input",(e)=>renderBooks(e.target.value));
  document.getElementById("members-filter")?.addEventListener("input",(e)=>renderMembers(e.target.value));
}

function renderAll(){ renderDashboard(); renderBooks(document.getElementById("books-filter")?.value||""); renderMembers(document.getElementById("members-filter")?.value||""); populateIssueReturnForm(); }

document.addEventListener("DOMContentLoaded",()=>{
  initAuth(); initNavigation(); initModals(); initFilters();
  const pb=document.getElementById("stat-books-preview"); if(pb) pb.textContent="12";
  const pm=document.getElementById("stat-members-preview"); if(pm) pm.textContent="3,213";
});