// ============ Add this to your existing script.js ============
const API_BASE = "http://localhost:5000/api";

// 1) Load real stats into the login screen instead of hardcoded numbers
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/books/stats`);
    const data = await res.json();
    document.getElementById("stat-books-preview").textContent = data.totalTitles;
  } catch (err) {
    console.error("Could not load stats:", err);
  }
}
loadStats();

// 2) Handle the login form submit
document.querySelector("#login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("token", data.token); // save the login session
    window.location.href = "dashboard.html"; // or hide auth-screen, show dashboard
  } catch (err) {
    alert(err.message);
  }
});

// 3) Example: fetch protected data using the saved token
async function getBooks() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/books`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// 4) Example: listening for a USB barcode scanner (acts like fast keyboard typing)
let scanBuffer = "";
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && scanBuffer.length > 3) {
    console.log("Scanned ISBN:", scanBuffer);
    // you could now auto-fill an "Add Book" form with this ISBN
    scanBuffer = "";
  } else if (e.key.length === 1) {
    scanBuffer += e.key;
  }
});
