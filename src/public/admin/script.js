let indexComplate = [];
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

let currentUserId = null;

async function checkAuth() {
  try {
    const res = await fetch("/api/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const json = await res.json();
    if (!json.success) window.location.href = "./login.html";
    currentUserId = json.data.id;
    return json.data.id;
  } catch (e) {
    window.location.href = "./login/";
  }
}

// Render Products
function renderProducts(products) {
  const container = document.getElementById("products");
  if (!products || products.length === 0) {
    container.innerHTML =
      "<p style='grid-column: 1/-1; text-align: center; color: #999; padding: 20px;'>No products available.</p>";
    return;
  }

  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-item">
        <img src="${p.imageUrl}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="price-admin">IDR ${parseInt(p.price).toLocaleString()}</div>
        <div>
          <span class="stock-badge">📦 Stock: ${p.stock}</span>
        </div>
        <div class="admin-actions">
          <button class="btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn-delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `,
    )
    .join("");
}

// Load Products
async function loadProduct() {
  const userId = currentUserId || (await checkAuth());
  const res = await fetch(`/api/product/${userId}`);
  const json = await res.json();
  const allProducts = json.data;
  renderProducts(allProducts);

  document.getElementById("categoryFilter").onchange = function () {
    let val = this.value;
    if (val === "all") return renderProducts(allProducts);
    const map = { had: 1, tshirt: 2, pants: 3 };
    renderProducts(allProducts.filter((p) => p.categoryId === map[val]));
  };

  loadOrders();
}

async function loadOrders() {
  const container = document.getElementById("orders");
  try {
    const res = await fetch(`/api/orders/`);
    const json = await res.json();
    const orders =
      json.data.filter(
        (o) => o.status !== "Completed" && o.status !== "Canceled",
      ) || [];

    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state">No incoming orders.</div>`;
      return;
    }

    container.innerHTML = orders
      .map((o) => {
        const statusClass = o.status.toLowerCase();
        return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">#ORD-${o.id}</span>
              <span class="order-date">${new Date(o.createdAt).toLocaleDateString("en-US")}</span>
            </div>
            <span class="status-badge ${statusClass}">${o.status}</span>
          </div>

          <div class="order-body">
            <div class="customer-info">
              <strong>${o.customerName}</strong>
              <p>${o.address}</p>
            </div>
            <div class="order-total">
              <span>Total Amount</span>
              <strong>IDR ${parseInt(o.totalAmount).toLocaleString()}</strong>
            </div>
          </div>

          <details>
            <summary>Purchased Items</summary>
            <div class="order-items" id="order-items-${o.id}">
              Loading...
            </div>
          </details>

          <div class="order-actions">
            <select class="status-select" data-id="${o.id}">
              <option value="" disabled selected>Change Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Cancel</option>
            </select>
            <button class="btn-update-status" data-id="${o.id}">Update</button>
          </div>
        </div>
      `;
      })
      .join("");

    orders.forEach((o) => {
      loadOrderItems(o.id);
    });
  } catch (err) {
    container.innerHTML = "<p>Failed to load orders.</p>";
  }
}

async function loadOrderItems(orderId) {
  const container = document.getElementById(`order-items-${orderId}`);
  if (!container) return;

  try {
    const res = await fetch(`/api/orders/${orderId}/items`);
    const json = await res.json();
    const items = json.data;

    container.innerHTML = items
      .map(
        (item) => `
      <div class="order-item">
        <strong>${item.product.name}</strong>
        <p>x${item.quantity}</p>
        <p>IDR ${parseInt(item.priceAtTime).toLocaleString()}</p>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    container.innerText = "Failed to load items.";
  }
}

document.getElementById("orders").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-update-status")) {
    const orderId = e.target.dataset.id;
    const selectElement = e.target.previousElementSibling;
    const newStatus = selectElement.value;

    if (!newStatus) return alert("Please select a status first.");

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Status updated successfully!");
        loadOrders();
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  }
});

// Modal Management
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function openEditModal(productId) {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  const res = await fetch(`/api/product/${currentUserId}`);
  const json = await res.json();
  const product = json.data.find((p) => p.id == productId);

  if (!product) return alert("Product not found.");

  document.getElementById("nameEdit").value = product.name;
  document.getElementById("descEdit").value = product.description || "";
  document.getElementById("priceEdit").value = product.price;
  document.getElementById("stockEdit").value = product.stock;
  document.getElementById("categoryEdit").value = product.categoryId;
  document.getElementById("name-product").innerText = product.name;
  document.getElementById("imagePreviewEdit").src = product.imageUrl;

  document.getElementById("productFormEdit").onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    formData.append("name", document.getElementById("nameEdit").value);
    formData.append("description", document.getElementById("descEdit").value);
    formData.append("price", document.getElementById("priceEdit").value);
    formData.append("stock", document.getElementById("stockEdit").value);
    formData.append("categoryId", document.getElementById("categoryEdit").value);

    const imageInput = document.getElementById("imageEdit");
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);
    formData.append("userId", currentUserId);

    const updateRes = await fetch(`/api/product/${productId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await updateRes.json();
    alert(data.message);
    if (data.success) {
      closeModal();
      loadProduct();
    }
  };
}

async function handleDelete(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  const res = await fetch(`/api/product/${productId}`, { method: "DELETE" });
  const json = await res.json();
  if (json.success) {
    alert("Product deleted successfully.");
    loadProduct();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  loadProduct();

  document.getElementById("products").addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("btn-edit")) {
      openEditModal(id);
    } else if (e.target.classList.contains("btn-delete")) {
      handleDelete(id);
    }
  });

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/logout/";
  });

  document
    .getElementById("btn-close-modal")
    .addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target == document.getElementById("modal")) closeModal();
  });

  document.getElementById("image").addEventListener("change", (e) => {
    const img = document.getElementById("imagePreview");
    img.src = URL.createObjectURL(e.target.files[0]);
    img.style.display = "block";
  });

  document.getElementById("imageEdit").addEventListener("change", (e) => {
    document.getElementById("imagePreviewEdit").src = URL.createObjectURL(
      e.target.files[0],
    );
  });

  document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("desc").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("stock", document.getElementById("stock").value);
    formData.append("categoryId", document.getElementById("category").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("userId", currentUserId);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) location.reload();
  };
});