let cart = [];
let allProducts = [];


lucide.createIcons();

async function load() {
  const res = await fetch("/api/products");
  const json = await res.json();
  allProducts = json.data;
  renderProducts(allProducts);
}

document.getElementById("logout").addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "/logout/";
});

window.add = function (id) {
  const item = cart.find((c) => c.productId === id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({ productId: id, quantity: 1 });
  }

  updateCount();

  const btn = event.currentTarget;
  if (btn && btn.classList.contains("btn-add-cart")) {
    const originalText = btn.innerHTML;
    btn.innerText = "✅ Added";
    btn.style.background = "var(--secondary-green)";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = "";
    }, 800);
  }
};

function updateCount() {
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const countElement = document.getElementById("count");
  if (countElement) {
    countElement.innerText = totalItems;
  }
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  const isActive = sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (isActive) {
    renderCartList();
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.remove("active");
  overlay.classList.remove("active");

  document.getElementById("btn-cart")?.addEventListener("click", toggleCart);
  document.getElementById("close-sidebar")?.addEventListener("click", toggleCart);
  document.getElementById("sidebarOverlay")?.addEventListener("click", toggleCart);
  document.getElementById("btn-continue")?.addEventListener("click", toggleCart);
  document.getElementById("btn-checkout")?.addEventListener("click", checkout);
});

window.add = (id) => {
  const item = cart.find((c) => c.productId === id);
  if (item) item.quantity++;
  else cart.push({ productId: id, quantity: 1 });
  document.getElementById("count").innerText = cart.reduce(
    (a, b) => a + b.quantity,
    0
  );
};

document
  .getElementById("search-product")
  .addEventListener("input", function (e) {
    const keyword = e.target.value.toLowerCase();
    const filtered = allProducts.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(keyword);
      const descMatch = p.description
        ? p.description.toLowerCase().includes(keyword)
        : false;
      return nameMatch || descMatch;
    });

    renderProducts(filtered);
  });

function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = products
    .map((p) => {
      let category = null;
      const stockClass = p.stock <= 10 ? "low-stock" : "in-stock";
      const stockText = p.stock > 0 ? `Stock: ${p.stock}` : "Out of Stock";

      if (p.categoryId === 1) category = "hat";
      else if (p.categoryId === 2) category = "t-shirt";
      else if (p.categoryId === 3) category = "pants";

      return `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img src="${p.imageUrl}" alt="${p.name}">
          <div class="category-badge">${category || "hat"}</div>
        </div>
        <div class="product-info">
          <div class="stock-status ${stockClass}">${stockText}</div>
          <h3>${p.name}</h3>
          <p>${p.description || "Everlore Store’s premium curated collection."}</p>
          
          <div class="product-footer">
            <div class="price">Rp ${Number(p.price).toLocaleString("id-ID")}</div>
            <button class="btn-add-cart" onclick="add(${p.id})" ${p.stock <= 0 ? "disabled" : ""}>
              ${p.stock <= 0 ? "Sold Out" : "Add (+)"}
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

document
  .getElementById("categoryFilter")
  .addEventListener("change", function () {
    let value = this.value;
    if (value === "all") {
      renderProducts(allProducts);
      return;
    } else if (value === "had") value = 1;
    else if (value === "t-shirt") value = 2;
    else if (value === "pants") value = 3;

    const filtered = allProducts.filter((p) => p.categoryId === Number(value));
    renderProducts(filtered);
  });

// Fungsi untuk mengubah jumlah (Plus/Minus)
window.updateQty = (id, delta) => {
  const item = cart.find(c => c.productId === id);
  if (item) {
    item.quantity += delta;
    
    // Jika jumlah jadi 0 atau kurang, hapus dari keranjang
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.productId !== id);
    }
  }
  
  updateCount();      // Update angka di icon keranjang
  renderCartList();   // Re-render isi daftar keranjang
};

function renderCartList() {
  const list = document.getElementById("cartList");
  
  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <i data-lucide="shopping-basket" style="width:48px; height:48px; color:#ccc; margin-bottom:10px;"></i>
        <p style='color:#999;'>Keranjangmu masih kosong...</p>
      </div>`;
    lucide.createIcons(); // Render ikon basket kosong
    return;
  }

  list.innerHTML = cart.map((c) => {
    const p = allProducts.find((x) => x.id === c.productId);
    if (!p) return "";

    return `
      <div class="cart-item">
        <img src="${p.imageUrl}" alt="${p.name}">
        
        <div class="cart-item-info">
          <span class="cart-item-name">${p.name}</span>
          <span class="cart-item-price">Rp ${(p.price * c.quantity).toLocaleString("id-ID")}</span>
          
          <div class="qty-controls">
            <button class="btn-qty" onclick="updateQty(${p.id}, -1)">
              <i data-lucide="minus" style="width:16px; height:16px;"></i>
            </button>
            <span class="qty-count">${c.quantity}</span>
            <button class="btn-qty" onclick="updateQty(${p.id}, 1)">
              <i data-lucide="plus" style="width:16px; height:16px;"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join("");
  lucide.createIcons();
}

function startWelcomeSlider() {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  if (slides.length === 0) return;

  setInterval(() => {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }, 5000);
}

document.addEventListener("DOMContentLoaded", startWelcomeSlider);

async function checkout() {
  const name = document.getElementById("cName").value;
  const addr = document.getElementById("cAddr").value;
  if (!name || !addr || cart.length === 0)
    return alert("Please complete your details and cart.");

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: name,
      address: addr,
      items: cart,
    }),
  });
  const data = await res.json();

  if (data.success) {
    const msg = `Hello Admin, I would like to place an order.\n\nOrder ID: #${data.orderId}\nTotal: Rp ${data.total.toLocaleString()}\nName: ${name}\nAddress: ${addr}`;
    window.location.href = `https://wa.me/6285752214806?text=${encodeURIComponent(msg)}`;
  }
}

async function checkAuth() {
  try {
    const res = await fetch("/api/me", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await res.json();
    if (json.success) {
      if (json.data.role === "admin") {
        document.getElementById("admin").style.display = "inline";
      }
      document.getElementById("username").textContent = json.data.username;
      return true;
    } else {
      window.location.href = "./login/";
    }
  } catch (e) {
    window.location.href = "./login/";
  }
  return false;
}

(async () => {
  if (await checkAuth()) load();
})();