document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Loading effect on button
    const btn = e.target.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Registering...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: document.getElementById("username").value,
          password: document.getElementById("password").value
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Registration successful! Please log in.");
        window.location.href = "/login/";
      } else {
        alert("❌ " + data.message);
        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
      }
    } catch (err) {
      alert("A system error occurred.");
      btn.innerText = originalText;
      btn.style.opacity = "1";
      btn.disabled = false;
    }
  });