document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Simple loading effect on button
  const btn = e.target.querySelector("button");
  const originalText = btn.innerText;
  btn.innerText = "Processing...";
  btn.style.opacity = "0.7";
  btn.disabled = true;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      }),
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      localStorage.setItem("token", data.token);
      if (data.message === "admin") {
        window.location.href = "/admin/";
      } else {
        window.location.href = "/dashboard/";
      }
    } else {
      alert("❌ " + data.message);
      btn.innerText = originalText;
      btn.style.opacity = "1";
      btn.disabled = false;
    }
  } catch (err) {
    alert("A connection error occurred.");
    btn.innerText = originalText;
    btn.style.opacity = "1";
    btn.disabled = false;
  }
});