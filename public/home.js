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
    // Đang diễn ra => Hiển thị khi nào KẾT THÚC
    color = "green";
    labelText = `auction ends in: ${formatD(product.endTime)} GMT+8`;
  } else if (product.type === "upcoming") {
    // Sắp diễn ra => Hiển thị khi nào BẮT ĐẦU
    color = "orange";
    labelText = `auction start in: ${formatD(product.startTime)} GMT+8`;
  } else {
    // Đã kết thúc
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

document.addEventListener("DOMContentLoaded", (Auth) => {
  Auth = 1;
  showShit(Auth);
});
