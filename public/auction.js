// 1. CẤU HÌNH PHÂN TRANG
const ITEMS_PER_PAGE = 8;
let currentPage = 1;

// CÁC BIẾN TRẠNG THÁI
let currentTab = "all";
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const gridContainer = document.getElementById("auctionGrid");
const paginationContainer = document.querySelector(".pagination");

// 2. HÀM HELPER: Format ngày tháng cho thẻ sản phẩm
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

// 3. HÀM RENDER SẢN PHẨM
function renderProducts(productsToRender) {
  gridContainer.innerHTML = "";

  if (productsToRender.length === 0) {
    gridContainer.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
    return;
  }

  productsToRender.forEach((product) => {
    // Xử lý hiển thị giá và nhãn giá
    let displayPrice = product.price !== "-" ? `$${product.price}` : "-";
    let priceLabel =
      product.type === "ended" ? "hammer price:" : "current bid:";

    // Lấy thông tin trạng thái
    const { color, labelText } = getStatusInfo(product);

    const cardHTML = `
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
    gridContainer.innerHTML += cardHTML;
  });
}

// 4. HÀM VẼ THANH PHÂN TRANG (1, 2, 3...)
function renderPagination(totalItems) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    paginationContainer.innerHTML += `
            <a href="javascript:void(0)" class="page-link ${activeClass}" onclick="changePage(${i})">${i}</a>
        `;
  }

  if (currentPage < totalPages) {
    paginationContainer.innerHTML += `
            <a href="javascript:void(0)" class="page-link" onclick="changePage(${
              currentPage + 1
            })"><i class="fas fa-arrow-right"></i></a>
        `;
  }
}

// 5. HÀM CHUYỂN TRANG
function changePage(page) {
  currentPage = page;
  handleSortAndFilter();
  document
    .querySelector(".auction-controls")
    .scrollIntoView({ behavior: "smooth" });
}

// 6. HÀM XỬ LÝ LỌC & SẮP XẾP & CẮT TRANG
function handleSortAndFilter() {
  // Sử dụng mảng 'products' từ file products.js
  const searchText = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;

  //FILTER
  let filteredProducts = products.filter((product) => {
    const matchTab = currentTab === "all" || product.type === currentTab;
    const matchSearch =
      product.title.toLowerCase().includes(searchText) ||
      product.author.toLowerCase().includes(searchText);
    return matchTab && matchSearch;
  });

  //SORT
  filteredProducts.sort((a, b) => {
    if (sortValue === "az") return a.title.localeCompare(b.title);
    if (sortValue === "za") return b.title.localeCompare(a.title);
    return 0;
  });

  //PHÂN TRANG
  const totalItems = filteredProducts.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Cắt mảng sản phẩm theo trang hiện tại
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  //HIỂN THỊ
  renderProducts(paginatedProducts);
  renderPagination(totalItems);
}

// 7. SỰ KIỆN CLICK TAB
function filterAuction(type, element) {
  document
    .querySelectorAll(".tab-item")
    .forEach((tab) => tab.classList.remove("active"));
  element.classList.add("active");
  currentTab = type;
  currentPage = 1;
  handleSortAndFilter();
}

// 8. SỰ KIỆN TÌM KIẾM & SORT (Reset về trang 1)
searchInput.addEventListener("input", () => {
  currentPage = 1;
  handleSortAndFilter();
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  handleSortAndFilter();
});

// KHI LOAD TRANG
if (typeof products !== "undefined") {
  handleSortAndFilter();
} else {
  gridContainer.innerHTML = "<p>Error: Could not load products.js</p>";
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
  if (Auth === -1) {
    showAdminHome();
  } else if (Auth === 1) {
    showUserHome();
  } else {
    showGuestHome();
  }
}

document.addEventListener("DOMContentLoaded", (Auth) => {
  Auth = 1;
  showShit(Auth);
});
