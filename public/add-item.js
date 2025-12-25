// Cấu hình URL cơ sở (Sửa port 3000 nếu server của bạn chạy port khác)
const BASE_URL = 'http://localhost:3000'; 

let categories = []; 

/**
 * 1. TẢI DANH MỤC
 */
async function loadCategories() {
    try {
        // Dùng URL tuyệt đối để tránh lỗi kết nối khi dùng Live Server
        const res = await fetch(`${BASE_URL}/api/categories`); 
        if (!res.ok) throw new Error("Server trả về lỗi");

        const rawCategories = await res.json();
        
        categories = rawCategories.sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
        console.log("Categories loaded:", categories);
    } catch (error) {
        console.error("Lỗi kết nối API categories:", error);
    }
}

/**
 * 2. HIỂN THỊ MODAL (Giữ nguyên logic của bạn)
 */
window.showCategoryModal = function() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    categoryList.innerHTML = ''; 
    categoryList.style.display = "grid";
    categoryList.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
    categoryList.style.gap = "10px";

    categories.forEach(cat => {
        const li = document.createElement('li');
        li.style = `list-style:none; padding:10px; border:1px solid #ddd; border-radius:6px; cursor:pointer; background:#fff;`;
        li.innerHTML = `<b style="color:#007bff">${cat.id}</b> - ${cat.name}`;
        li.onclick = function() {
            document.getElementById('categoryId').value = cat.id;
            closeCategoryModal();
        };
        categoryList.appendChild(li);
    });
    document.getElementById('categoryModal').style.display = 'block';
}

window.closeCategoryModal = function() {
    document.getElementById('categoryModal').style.display = 'none';
}

/**
 * 3. HÀM THÊM SẢN PHẨM (Sửa lỗi kết nối và xử lý dữ liệu)
 */
async function addItem() {
    console.log("Đang gửi yêu cầu thêm sản phẩm...");

    // Hàm phụ để lấy giá trị an toàn
    const getVal = (id) => document.getElementById(id)?.value?.trim() || "";

    const name = getVal('name');
    const owner = getVal('owner');
    const descriptionDetail = getVal('descriptionDetail');
    const baseBid = getVal('baseBid');
    const timeStart = getVal('timeStart');
    const timeEnd = getVal('timeEnd');
    const imageUrl = getVal('imageUrl');
    const categoryId = getVal('categoryId');

    if (!name || !owner || !baseBid || !categoryId || !timeStart || !timeEnd) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
        return;
    }

    const data = {
        description: name,
        sellerId: owner,
        startPrice: parseFloat(baseBid),
        startTime: new Date(timeStart).toISOString(),
        endTime: new Date(timeEnd).toISOString(),
        imageUrl: imageUrl || "images/placeholder.jpg",
        descriptionDetail: descriptionDetail,
        categoryId: categoryId
    };

    try {
        // Gửi đến URL tuyệt đối của Server
        const res = await fetch(`${BASE_URL}/api/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert(`Thành công! Trạng thái: ${result.type?.toUpperCase()}`);
            window.location.href = 'database.html'; 
        } else {
            alert('Lỗi từ Server: ' + (result.error || "Không xác định"));
        }
    } catch (error) {
        // Lỗi này xảy ra khi Fetch không tới được Server (Sai URL, Server chưa chạy, chặn CORS)
        console.error('Lỗi kết nối Fetch:', error);
        alert('KHÔNG THỂ KẾT NỐI ĐẾN SERVER! Hãy kiểm tra:\n1. Server Node.js đã chạy chưa?\n2. Port có phải là 3000 không?\n3. Kiểm tra tab Network trong F12.');
    }
}

document.addEventListener("DOMContentLoaded", loadCategories);