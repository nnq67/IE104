// 1. CẤU HÌNH PHÂN TRANG
const ITEMS_PER_PAGE = 8;
let currentPage = 1;

// CÁC BIẾN TRẠNG THÁI
let currentTab = "all";
let productsFromDB = []; 

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const gridContainer = document.getElementById("auctionGrid");
const paginationContainer = document.querySelector(".pagination");

// --- HÀM LẤY DỮ LIỆU TỪ SERVER ---
async function fetchProducts() {
  try {
    gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading auctions...</p>';
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error("Failed to fetch");
    
    productsFromDB = await response.json();
    console.log("Dữ liệu sạch từ Server:", productsFromDB); 
    handleSortAndFilter(); 
  } catch (error) {
    console.error("Fetch error:", error);
    gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error: ${error.message}</p>`;
  }
}

// 2. HÀM HELPER: Format ngày tháng (Đã sửa lỗi N/A)
function getStatusInfo(product) {
    let color = "green";
    let labelText = "";

    const formatD = (dateStr) => {
        if (!dateStr) return "Not available";
        // Chấp nhận cả chuỗi ISO từ backend mới
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Invalid Date"; 
        
        return d.toLocaleString("en-GB", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(",", "");
    };

    const type = (product.type || "current").toLowerCase();

    if (type === "current") {
        color = "green";
        labelText = `auction ends in: ${formatD(product.endTime)} GMT+8`;
    } else if (type === "upcoming") {
        color = "orange";
        labelText = `auction start in: ${formatD(product.startTime)} GMT+8`;
    } else {
        color = "red";
        labelText = "This auction has ended";
    }

    return { color, labelText };
}

// 3. HÀM RENDER SẢN PHẨM
function renderProducts(productsToRender) {
    gridContainer.innerHTML = "";

    if (!productsToRender || productsToRender.length === 0) {
        gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
        return;
    }

    productsToRender.forEach((product) => {
        // Định dạng giá chuẩn: 100000000 -> $100.000.000
        // Đảm bảo dùng Number() để tránh lỗi chuỗi
        const priceValue = Number(product.price || 0);
        const displayPrice = priceValue > 0 
            ? "$" + priceValue.toLocaleString('de-DE') 
            : "No Bid Yet";

        const { color, labelText } = getStatusInfo(product);
        const priceLabel = product.type === "ended" ? "hammer price:" : "current bid:";

        const cardHTML = `
            <div class="product-card type-${product.type}">
                <div class="card-img">
                    <a href="./product-detail.html?id=${product.id}">
                        <img src="${product.imageUrl}" alt="${product.title}" onerror="this.src='./images/placeholder.jpg'">
                    </a>
                </div>
                <div class="card-content">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-author">by ${product.author}</p>
                    <div class="price-row">
                        <span class="price-label">${priceLabel}</span>
                        <span class="price-value" style="font-weight: bold; color: #d4a373;">${displayPrice}</span>
                    </div>
                    <div class="status-row">
                        <span class="status-dot dot-${color}"></span>
                        <span class="status-text">${labelText}</span>
                    </div>
                    <a href="./product-detail.html?id=${product.id}" class="btn-card">Bid now</a>
                </div>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
}

// --- 4 & 5. PHÂN TRANG ---
function renderPagination(totalItems) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    paginationContainer.innerHTML += `<a href="javascript:void(0)" class="page-link ${activeClass}" onclick="changePage(${i})">${i}</a>`;
  }
}

function changePage(page) {
  currentPage = page;
  handleSortAndFilter();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 6. HÀM LỌC & SẮP XẾP (Sửa lỗi logic sắp xếp)
function handleSortAndFilter() {
  const searchText = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;

  let filteredProducts = productsFromDB.filter((product) => {
    const type = (product.type || "current").toLowerCase();
    const matchTab = currentTab === "all" || type === currentTab;
    const matchSearch =
      (product.title && product.title.toLowerCase().includes(searchText)) ||
      (product.author && product.author.toLowerCase().includes(searchText));
    return matchTab && matchSearch;
  });

  // Sắp xếp
  if (sortValue === "az") {
    filteredProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortValue === "za") {
    filteredProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  } else if (sortValue === "low") {
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortValue === "high") {
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  const totalItems = filteredProducts.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  renderProducts(paginatedProducts);
  renderPagination(totalItems);
}

// 7. TAB & PHÂN QUYỀN
function filterAuction(type, element) {
  document.querySelectorAll(".tab-item").forEach((tab) => tab.classList.remove("active"));
  element.classList.add("active");
  currentTab = type.toLowerCase();
  currentPage = 1;
  handleSortAndFilter();
}

function showShit(Auth) {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  
  const hideAll = () => {
      [userViews, guestViews, adminViews].forEach(nodes => nodes.forEach(el => el.style.display = "none"));
  };
  hideAll();
  
  if (Auth == -1) adminViews.forEach(el => el.style.display = "block");
  else if (Auth == 1) userViews.forEach(el => el.style.display = "block");
  else guestViews.forEach(el => el.style.display = "block");
}

document.addEventListener("DOMContentLoaded", () => {
  showShit(localStorage.getItem("auth"));
  fetchProducts(); 
});

searchInput.addEventListener("input", () => { currentPage = 1; handleSortAndFilter(); });
sortSelect.addEventListener("change", () => { currentPage = 1; handleSortAndFilter(); });