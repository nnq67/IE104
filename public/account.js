// --- DATA CENTER ---
const userData = {
  firstname: "Pong",
  lastname: "Ton",
  email: "pongton@gm.uit.edu.vn",
  phone: "0123456789",
  address: "TPHCM",
  avatar: "https://via.placeholder.com/60?text=User",
  role: "admin",
};

function updateUI() {
  document
    .querySelectorAll(".sync-firstname")
    .forEach((el) => (el.textContent = userData.firstname));
  document
    .querySelectorAll(".sync-lastname")
    .forEach((el) => (el.textContent = userData.lastname));
  document
    .querySelectorAll(".sync-fullname")
    .forEach(
      (el) => (el.textContent = userData.firstname + " " + userData.lastname)
    );
  document
    .querySelectorAll(".sync-email")
    .forEach((el) => (el.textContent = userData.email));
  document
    .querySelectorAll(".sync-address")
    .forEach((el) => (el.textContent = userData.address));

  document
    .querySelectorAll(".sync-avatar")
    .forEach((el) => (el.src = userData.avatar));

  const adminBtn = document.getElementById("btn-admin-db");
  if (userData.role === "admin") {
    adminBtn.style.display = "inline-block";
  } else {
    adminBtn.style.display = "none";
  }
}

function loadTab(evt, fileName) {
  var tablinks = document.getElementsByClassName("tab-link");
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  if (evt) {
    evt.currentTarget.className += " active";
  } else {
    if (fileName.includes("transaction")) tablinks[0].className += " active";
    if (fileName.includes("bidding")) tablinks[1].className += " active";
    if (fileName.includes("setting")) tablinks[2].className += " active";
  }

  fetch(fileName)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("tab-content-placeholder").innerHTML = data;

      if (fileName.includes("transaction-history")) {
        renderTransactionHistory();
      } else if (fileName.includes("bidding-history")) {
        renderBiddingHistory();
      }

      setTimeout(updateUI, 50);
    })
    .catch((error) => console.error("Error loading tab:", error));
}

function renderTransactionHistory() {
  const listContainer = document.getElementById("transaction-list");
  if (!listContainer || typeof products === "undefined") return;

  const endedProducts = products.filter((p) => p.type === "ended").slice(0, 5);

  let html = "";
  endedProducts.forEach((prod, index) => {
    const orderId = "#21" + (3 - index);
    const date = new Date(prod.endTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const status = index === 0 ? "Waiting payment" : "Success";
    const statusClass = index === 0 ? "status-waiting" : "status-success";

    html += `
            <tr>
                <td class="highlight-text">${orderId}</td>
                <td>${date}</td>
                <td class="${statusClass}">${status}</td>
                <td>$${prod.price}</td>
                <td class="text-right">
                    <button class="btn-view" onclick="loadOrderDetail(${prod.id}, '${orderId}', '${status}')">View</button>
                </td>
            </tr>
        `;
  });
  listContainer.innerHTML = html;
}

function loadOrderDetail(productId, orderId, status) {
  fetch("order-detail.html")
    .then((response) => response.text())
    .then((htmlTemplate) => {
      document.getElementById("tab-content-placeholder").innerHTML =
        htmlTemplate;

      const product = products.find((p) => p.id === productId);
      if (!product) return;

      document.getElementById("od-order-id").innerText = orderId;
      document.getElementById("od-date").innerText = new Date(
        product.endTime
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      document.getElementById("od-status").innerText = status;

      const priceRaw = parseInt(product.price.replace(/,/g, ""));
      const commission = priceRaw * 0.05;
      const total = priceRaw + commission;

      document.getElementById(
        "od-product-name"
      ).innerHTML = `<img src="${product.img}" class="product-thumb"> ${product.title}`;
      document.getElementById(
        "od-product-price"
      ).innerText = `$${product.price}`;

      document.getElementById("od-subtotal").innerText = `$${product.price}`;
      document.getElementById(
        "od-commission"
      ).innerText = `$${commission.toLocaleString()}`;
      document.getElementById(
        "od-total"
      ).innerText = `$${total.toLocaleString()}`;

      document.getElementById("od-billing-address").innerText =
        userData.address;

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function renderBiddingHistory() {
  const listContainer = document.getElementById("bidding-list");
  if (!listContainer || typeof products === "undefined") return;

  const biddingProducts = products.filter(
    (p) => p.type === "current" && p.userBid !== null
  );

  let html = "";
  if (biddingProducts.length === 0) {
    html =
      '<div style="text-align: center; padding: 30px;">You have no active bids.</div>';
  } else {
    biddingProducts.forEach((prod) => {
      const currentPriceVal = parseInt(prod.price.replace(/,/g, ""));
      const userBidVal = parseInt(prod.userBid.replace(/,/g, ""));

      let statusText = "Outbid";
      let statusClass = "bid-status-outbid";

      if (userBidVal >= currentPriceVal) {
        statusText = "Leading";
        statusClass = "bid-status-leading";
      }

      html += `
                <div class="bidding-item">
                    <div class="product-info">
                        <img src="${prod.img}" alt="${prod.title}" class="product-thumb">
                        <span>${prod.title}</span>
                    </div>
                    <div class="bid-col">$${prod.userBid}</div>
                    <div class="bid-col">$${prod.price}</div>
                    <div class="bid-col ${statusClass}">${statusText}</div>
                    <div class="bid-col text-right">
                        <a href="product-detail.html?id=${prod.id}" class="btn-view-small">View Product</a>
                    </div>
                </div>
            `;
    });
  }
  listContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
  loadTab(null, "transaction-history.html");
  updateUI();
});

function showSettingSection(sectionId) {
  const sections = document.querySelectorAll(".setting-section");
  sections.forEach((sec) => sec.classList.remove("active"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");
}

function showUserHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  userViews.forEach((el) => (el.style.display = "block"));
  guestViews.forEach((el) => (el.style.display = "none"));
  adminViews.forEach((el) => (el.style.display = "none"));
}

function showGuestHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  guestViews.forEach((el) => (el.style.display = "block"));
  userViews.forEach((el) => (el.style.display = "none"));
  adminViews.forEach((el) => (el.style.display = "none"));
}

function showAdminHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  adminViews.forEach((el) => (el.style.display = "block"));
  userViews.forEach((el) => (el.style.display = "none"));
  guestViews.forEach((el) => (el.style.display = "none"));
}

function showShit(Auth) {
  if (Auth == -1) {
    showAdminHome();
  } else if (Auth == 1) {
    showUserHome();
  } else {
    showGuestHome();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let Auth = localStorage.getItem("auth");
  showShit(Auth);
});

document.addEventListener("DOMContentLoaded", () => {
  let Auth = localStorage.getItem("auth");
  if (Auth == -1) {
    document.getElementById("setting").classList.add("active");
    document.getElementById("setting").click();
    document.getElementById("trans").classList.remove("active");
  } else if (Auth == 1) {
    document.getElementById("trans").click();
  }
});

const logoutButtons = document.querySelectorAll(".btn-logout");
logoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem("auth", "0");
  });
});
