import { products } from "./products2.js";
import { showShit } from "./showscreen.js";
function getStatusInfo(product) {
  let color = "green";
  let labelText = "";

  const formatD = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-GB").replace(",", "");
  };

  if (product.type === "current") {
    color = "green";
    labelText = `auction ends in: ${formatD(product.endTime)} GMT+8`;
  } else if (product.type === "upcoming") {
    color = "orange";
    labelText = `auction start in: ${formatD(product.startTime)} GMT+8`;
  } else {
    color = "red";
    labelText = "This auction has ended";
  }

  return { color, labelText };
}

const grid = document.getElementById("grid-upcomingAuction");
const p = products;

p.slice(0, 8).forEach((product) => {
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
});

// Auth:
// -1 = admin
//  1 = user
//  0 = guest

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

document.addEventListener("DOMContentLoaded", () => {
  let Auth = localStorage.getItem("auth");
  showShit(Auth);
});

const earliestTime = Math.min(
  ...products.map((p) => new Date(p.startTime).getTime())
);
const earliestDate = new Date(earliestTime);

const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = earliestTime - now;

  const hours = Math.floor(distance / (1000 * 60 * 60));

  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("hour").innerHTML = hours;
  document.getElementById("minute").innerHTML =
    ":" + minutes.toString().padStart(2, "0");
  document.getElementById("second").innerHTML =
    ":" + seconds.toString().padStart(2, "0");

  if (distance < 0) {
    clearInterval(timer);
    document.getElementById("hour").innerHTML = "0";
    document.getElementById("minute").innerHTML = "00";
    document.getElementById("second").innerHTML = "00";
  }
}, 1000);

function formatDMY(date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

const smallD = document.getElementById("smallD");
smallD.innerHTML = `The upcoming auction will be held on ${formatDMY(
  earliestDate
)}.`;

const logoutButtons = document.querySelectorAll(".btn-logout");
logoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem("auth", "0");
  });
});
