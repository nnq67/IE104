const params = new URLSearchParams(window.location.search);
let productId = params.get("id");

let currentProduct = null;

function cleanData(p) {
  const toNum = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "object" && val.toNumber) return val.toNumber();
    return parseFloat(val);
  };

  const toDate = (d) => {
    if (!d) return new Date();
    if (typeof d === "string") return new Date(d);
    try {
      return new Date(
        toNum(d.year),
        toNum(d.month) - 1,
        toNum(d.day),
        toNum(d.hour || 0),
        toNum(d.minute || 0)
      );
    } catch (e) {
      return new Date();
    }
  };

  return {
    id: p.itemId || p.id,
    title: p.title || "Untitled",
    author: p.author || "Unknown Artist",
    description: p.description || "No description provided.",
    imageUrl: p.imageUrl || "images/placeholder.jpg",
    price: toNum(p.price),
    startTime: toDate(p.startTime),
    endTime: toDate(p.endTime),
  };
}

async function loadDetail() {
  if (!productId || productId === "null") {
    console.error("ID sản phẩm không hợp lệ");
    document.querySelector(".pdp-right").innerHTML =
      "<h2>Error: Invalid Product ID</h2>";
    return;
  }

  try {
    const response = await fetch(`/api/items/${productId}`);
    if (!response.ok) throw new Error("Sản phẩm không tồn tại hoặc lỗi Server");

    const rawData = await response.json();
    currentProduct = cleanData(rawData);

    document.getElementById("detailImage").src = currentProduct.imageUrl;
    document.getElementById("detailTitle").innerText = currentProduct.title;
    document.getElementById("detailAuthor").innerText =
      " " + currentProduct.author;
    document.getElementById("detailDesc").innerText =
      currentProduct.description;

    renderStatus(currentProduct);

    const relatedRes = await fetch("/api/items");
    if (relatedRes.ok) {
      const allItems = await relatedRes.json();

      const relatedList = allItems
        .filter((item) => (item.itemId || item.id) !== productId)
        .slice(0, 4);
      renderRelated(relatedList);
    }
  } catch (err) {
    console.error("Load Detail Error:", err);
    document.querySelector(
      ".pdp-right"
    ).innerHTML = `<h2>Lỗi: ${err.message}</h2>`;
  }
}

function renderStatus(p) {
  const statusArea = document.getElementById("dynamicStatusArea");
  const bidArea = document.getElementById("bidInputArea");
  const now = new Date();

  if (now < p.startTime) {
    renderUpcoming(p, p.startTime, statusArea, bidArea);
  } else if (now > p.endTime) {
    renderEnded(p, statusArea, bidArea);
  } else {
    renderCurrent(p, p.endTime, statusArea, bidArea);
  }
}

function renderCurrent(p, targetDate, statusArea, bidArea) {
  let displayPrice = p.price.toLocaleString();
  statusArea.innerHTML = `
        <div class="price-section">
            <span class="p-label">current bid:</span>
            <span class="p-value green">$${displayPrice}</span>
        </div>
        <div class="timer-section">
            <p class="timer-label">Time left to end auction:</p>
            <div class="countdown-box" id="countdown"></div>
            <p class="start-date">Auction ends: ${targetDate.toLocaleString()} GMT+7</p>
        </div>
    `;
  if (bidArea) {
    bidArea.style.display = "block";
    document.getElementById("bidAmount").value = p.price + 1000;
    document.getElementById("bidAmount").placeholder =
      "Enter amount > " + p.price;
  }
  startCountdown(targetDate);
}

function renderUpcoming(p, targetDate, statusArea, bidArea) {
  statusArea.innerHTML = `
        <p class="upcoming-msg" style="color: orange; font-weight: bold;">This auction has not been started yet</p>
        <div class="timer-section">
            <p class="timer-label">Time left to start auction:</p>
            <div class="countdown-box" id="countdown"></div>
            <p class="start-date">Auction starts: ${targetDate.toLocaleString()} GMT+7</p>
        </div>
    `;
  if (bidArea) bidArea.style.display = "none";
  startCountdown(targetDate);
}

function renderEnded(p, statusArea, bidArea) {
  statusArea.innerHTML = `
        <div class="price-section">
            <span class="p-label">hammer price:</span>
            <span class="p-value red">$${p.price.toLocaleString()}</span>
        </div>
        <div class="ended-line">
            <hr>
            <p style="color:red; font-style:italic; margin-top:10px;">This auction has ended</p>
        </div>
    `;
  if (bidArea) bidArea.style.display = "none";
}

function renderRelated(list) {
  const grid = document.getElementById("relatedGrid");
  if (!grid) return;
  grid.innerHTML = "";

  list.forEach((p) => {
    const img = p.imageUrl || p.img || "images/placeholder.jpg";
    const id = p.itemId || p.id;
    const title = p.title || "Untitled";

    const now = new Date();

    const start = cleanData(p).startTime;
    const end = cleanData(p).endTime;

    let type = "current";
    let dotClass = "green";

    if (now < start) {
      type = "upcoming";
      dotClass = "orange";
    } else if (now > end) {
      type = "ended";
      dotClass = "red";
    }

    let priceDisplay =
      type === "upcoming" ? "-" : "$" + (p.price || 0).toLocaleString();
    let labelDisplay = type === "ended" ? "hammer price:" : "current bid:";

    const html = `
        <div class="product-card">
            <div class="card-img">
                <a href="product-detail.html?id=${id}"><img src="${img}"></a>
            </div>
            <div class="card-content">
                <h3 class="product-title">${title}</h3>
                <p class="product-author">by ${p.author || "Unknown"}</p>
                <div class="price-row">
                    <span class="price-label">${labelDisplay}</span> 
                    <span class="price-value">${priceDisplay}</span>
                </div>
                <div class="status-row">
                    <span class="status-dot dot-${dotClass}"></span> 
                    <span class="status-text">${type}</span>
                </div>
                <a href="product-detail.html?id=${id}" class="btn-card">View</a>
            </div>
        </div>`;
    grid.innerHTML += html;
  });
}

function startCountdown(targetDate) {
  const timerEl = document.getElementById("countdown");
  if (!timerEl) return;

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      clearInterval(interval);
      timerEl.innerHTML = "EXPIRED";
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    timerEl.innerHTML = `
            <div class="t-box"><span class="num">${pad(
              d
            )}</span><span class="txt">days</span></div>
            <div class="t-box"><span class="num">${pad(
              h
            )}</span><span class="txt">hours</span></div>
            <div class="t-box"><span class="num">${pad(
              m
            )}</span><span class="txt">minutes</span></div>
            <div class="t-box"><span class="num">${pad(
              s
            )}</span><span class="txt">seconds</span></div>
        `;
  }, 1000);
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

const bidBtn = document.getElementById("bid-btn-real");
if (bidBtn) {
  bidBtn.addEventListener("click", async () => {
    const bidInput = document.getElementById("bidAmount");
    const auth = localStorage.getItem("auth");
    const currentUserId = localStorage.getItem("userId");

    if (!currentUserId || auth !== "1") {
      alert("Vui lòng đăng nhập với tài khoản người mua để đấu giá!");
      return;
    }

    const rawValue = bidInput.value.toString().replace(/[^0-9.]/g, "");
    const bidValue = parseFloat(rawValue);

    if (isNaN(bidValue) || bidValue <= currentProduct.price) {
      alert(
        `Giá thầu phải cao hơn giá hiện tại ($${currentProduct.price.toLocaleString()})!`
      );
      return;
    }

    try {
      const res = await fetch("/api/items/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          itemId: productId,
          bidAmount: bidValue,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đặt thầu thành công!");
        window.location.reload();
      } else {
        alert(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Bid Connection Error:", err);
      alert("Lỗi kết nối server.");
    }
  });
}

function updateUIBasedOnAuth() {
  const auth = localStorage.getItem("auth");
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");

  [...userViews, ...guestViews, ...adminViews].forEach(
    (el) => (el.style.display = "none")
  );

  if (auth == "-1") {
    adminViews.forEach((el) => (el.style.display = "block"));
  } else if (auth == "1") {
    userViews.forEach((el) => (el.style.display = "block"));
  } else {
    guestViews.forEach((el) => (el.style.display = "block"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateUIBasedOnAuth();
  loadDetail();
});
