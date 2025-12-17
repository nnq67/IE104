const grid = document.getElementById("grid-upcomingAuction");

products.slice(0, 8).forEach((product) => {
  renderOneCard(product);
});

function renderOneCard(product) {
  const card = document.createElement("div");

  let displayPrice = product.price !== "-" ? `$${product.price}` : "-";
  let priceLabel =
    product.type === "ended"
      ? "hammer price:"
      : product.type === "upcoming"
      ? "starting price:"
      : "current bid:";

  const { color, labelText } = getStatusInfo(product);
  card.innerHTML = `
                    <div class="product-card type-${product.type}">
                        <div class="card-img">
                            <a href="./product-detail.html?id=${product.id}">
                                <img src="${product.img}" alt="${product.title}" loading="lazy">
                            </a>
                        </div>
                        <div class="card-content">
                            <h3 class="product-title">${product.title}</h3>
                            <p class="product-author">by ${product.author}</p>
                            
                            <div class="price-row">
                                <span class="price-label">${priceLabel}</span>
                                <span class="price-value">${displayPrice}</span>
                            </div>

                            <div class="status-row">
                                <span class="status-dot dot-${color}"></span>
                                <span class="status-text">${labelText}</span>
                            </div>

                            <a href="./product-detail.html?id=${product.id}" class="btn-card">Bid now</a>
                        </div>
                    </div>
  `;

  grid.appendChild(card);
}

// Auth:
// -1 = admin
//  1 = user
//  0 = guest

let Auth = 0;

document.addEventListener("DOMContentLoaded", () => {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");

  function showUserHome() {
    userViews.forEach((el) => (el.style.display = "block"));
    guestViews.forEach((el) => (el.style.display = "none"));
    adminViews.forEach((el) => (el.style.display = "none"));
  }

  function showGuestHome() {
    guestViews.forEach((el) => (el.style.display = "block"));
    userViews.forEach((el) => (el.style.display = "none"));
    adminViews.forEach((el) => (el.style.display = "none"));
  }

  function showAdminHome() {
    adminViews.forEach((el) => (el.style.display = "block"));
    userViews.forEach((el) => (el.style.display = "none"));
    guestViews.forEach((el) => (el.style.display = "none"));
  }

  function showShit() {
    if (Auth === -1) {
      showAdminHome();
    } else if (Auth === 1) {
      showUserHome();
    } else {
      showGuestHome();
    }
  }

  showShit();
});
