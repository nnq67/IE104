// 1. KHỞI TẠO TRANG
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get('id'));

// Tìm sản phẩm trong DB
let product = null;
if(typeof products !== 'undefined') {
    product = products.find(p => p.id === productId);
} else {
    console.error("products.js not loaded");
}

// DOM Elements
const statusArea = document.getElementById('dynamicStatusArea');
const bidArea = document.getElementById('bidInputArea');

// Hàm format ngày
const formatD = (d) => d.toLocaleString('en-GB').replace(',', '');

if (product) {
    document.getElementById('detailImage').src = product.img;
    document.getElementById('detailTitle').innerText = product.title;
    document.getElementById('detailAuthor').innerText = "by " + product.author;
    document.getElementById('detailDesc').innerText = product.desc; 
    document.title = "Aucelot - " + product.title;

    const startDate = new Date(product.startTime);
    const endDate = new Date(product.endTime);

    if (product.type === 'current') {
        // Current: Đếm ngược tới END TIME
        renderCurrent(product, endDate);
    } else if (product.type === 'upcoming') {
        // Upcoming: Đếm ngược tới START TIME
        renderUpcoming(product, startDate);
    } else {
        renderEnded(product);
    }

    //hiển thị random 4 products ở dưới
    const related = products.filter(p => p.id !== productId)
                                .sort(() => 0.5 - Math.random())
                                .slice(0, 4);
    renderRelated(related);

} else {
    document.querySelector('.pdp-right').innerHTML = "<h2>Product not found</h2><a href='auction.html'>Back to Auction</a>";
}

// --- HÀM RENDER ---
function renderCurrent(p, targetDate) {
    statusArea.innerHTML = `
        <div class="price-section">
            <span class="p-label">current bid:</span>
            <span class="p-value green">$${p.price}</span>
        </div>
        <div class="timer-section">
            <p class="timer-label">Time left to end auction:</p>
            <div class="countdown-box" id="countdown"></div>
            <p class="start-date">Auction ends: ${formatD(targetDate)} GMT+8</p>
        </div>
    `;
    bidArea.style.display = 'block';
    document.getElementById('bidAmount').placeholder = "Enter amount > " + p.price;
    startTimer(targetDate);
}

function renderUpcoming(p, targetDate) {
    statusArea.innerHTML = `
        <p class="upcoming-msg">This auction has not been started yet</p>
        <div class="timer-section">
            <p class="timer-label">Time left to start auction:</p>
            <div class="countdown-box" id="countdown"></div>
            <p class="start-date">Auction starts: ${formatD(targetDate)} GMT+8</p>
        </div>
    `;
    startTimer(targetDate);
}

function renderEnded(p) {
    statusArea.innerHTML = `
        <div class="price-section">
            <span class="p-label">hammer price:</span>
            <span class="p-value red">$${p.price}</span>
        </div>
        <div class="ended-line">
            <hr>
            <p style="color:red; font-style:italic; margin-top:10px;">This auction has ended</p>
        </div>
    `;
}

function renderRelated(list) {
    const grid = document.getElementById('relatedGrid');
    list.forEach(p => {
        // Xác định màu dot
        let dotClass = 'orange';
        if(p.type === 'current') dotClass = 'green';
        if(p.type === 'ended') dotClass = 'red';

        // Xác định giá hiển thị
        let priceDisplay = (p.type === 'upcoming') ? '-' : '$' + p.price;
        let labelDisplay = (p.type === 'ended') ? 'hammer price:' : 'current bid:';

        const html = `
        <div class="product-card">
            <div class="card-img">
                <a href="product-detail.html?id=${p.id}"><img src="${p.img}"></a>
            </div>
            <div class="card-content">
                <h3 class="product-title">${p.title}</h3>
                <p class="product-author">by ${p.author}</p>
                <div class="price-row"><span class="price-label">${labelDisplay}</span> <span class="price-value">${priceDisplay}</span></div>
                <div class="status-row"><span class="status-dot dot-${dotClass}"></span> <span class="status-text">${p.type}</span></div>
                <a href="product-detail.html?id=${p.id}" class="btn-card">View</a>
            </div>
        </div>`;
        grid.innerHTML += html;
    });
}

// --- TIMER ---
function startTimer(targetDate) {
    const timerEl = document.getElementById('countdown');
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
            clearInterval(interval);
            timerEl.innerHTML = "EXPIRED";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerEl.innerHTML = `
            <div class="t-box"><span class="num">${pad(days)}</span><span class="txt">days</span></div>
            <div class="t-box"><span class="num">${pad(hours)}</span><span class="txt">hours</span></div>
            <div class="t-box"><span class="num">${pad(minutes)}</span><span class="txt">minutes</span></div>
            <div class="t-box"><span class="num">${pad(seconds)}</span><span class="txt">seconds</span></div>
        `;
    }, 1000);
}
function pad(n) { return n < 10 ? '0' + n : n; }