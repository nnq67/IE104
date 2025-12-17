const categoryModal = document.getElementById('categoryModal');
const categoryList = document.getElementById('categoryList');
const categoryIdInput = document.getElementById('categoryId');

// Biến để lưu trữ Category đã tải
let categories = []; 

// --- HÀM MỚI: TẢI CATEGORY TỪ SERVER (Neo4j API Endpoint) ---
async function fetchCategories() {
    // Thay thế '/categories' bằng API endpoint thực tế của bạn
    const endpoint = '/api/categories'; 

    try {
        const res = await fetch(endpoint);
        
        if (!res.ok) {
            throw new Error(`Server returned status: ${res.status}`);
        }
        
        // Giả định API trả về mảng các đối tượng { id: 'C01', name: 'Electronics' }
        categories = await res.json(); 
        
        // Kiểm tra xem dữ liệu có hợp lệ không
        if (!Array.isArray(categories) || categories.length === 0) {
            console.warn("Không tìm thấy Category nào từ server.");
            categories = []; // Đảm bảo là mảng rỗng
        }
    } catch (error) {
        console.error('Lỗi khi tải Category từ server:', error);
        alert('Không thể tải danh sách Category. Vui lòng thử lại sau.');
        categories = [];
    }
}

// Gọi hàm tải Category ngay khi trang được tải
fetchCategories(); 


// --- LOGIC QUẢN LÝ MODAL (Đã sửa đổi để sử dụng biến 'categories' động) ---

// 1. Hiển thị Modal
window.showCategoryModal = function() {
    if (categories.length === 0) {
        alert('Danh sách Category chưa được tải hoặc trống. Đang thử tải lại...');
        fetchCategories().then(() => {
            if (categories.length > 0) {
                renderCategoryList();
                categoryModal.style.display = 'block';
            }
        });
        return;
    }
    
    renderCategoryList();
    categoryModal.style.display = 'block';
}

function renderCategoryList() {
    categoryList.innerHTML = ''; 
    categories.forEach(category => {
        // Giả định cấu trúc đối tượng là { id: category_id, name: category_name }
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${category.id}</strong> - ${category.name}`;
        listItem.onclick = () => selectCategory(category.id);
        categoryList.appendChild(listItem);
    });
}

// 2. Đóng Modal
window.closeCategoryModal = function() {
    categoryModal.style.display = 'none';
}

// 3. Chọn Category
window.selectCategory = function(id) {
    categoryIdInput.value = id; 
    closeCategoryModal();        
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    if (event.target == categoryModal) {
        closeCategoryModal();
    }
}


// --- HÀM ADD ITEM ĐÃ CẬP NHẬT ---

async function addItem() {
    // 1. Lấy dữ liệu từ các trường nhập liệu
    const name = document.getElementById('name').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const baseBid = Number(document.getElementById('baseBid').value);
    const timeStart = document.getElementById('timeStart').value;
    const timeEnd = document.getElementById('timeEnd').value;
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const descriptionDetail = document.getElementById('descriptionDetail').value.trim();
    const categoryId = document.getElementById('categoryId').value.trim();

    // 2. Kiểm tra các trường bắt buộc
    if (!name || !owner || !baseBid || baseBid <= 0 || !categoryId) {
        alert('Vui lòng điền đầy đủ và chính xác các trường: Item Name, Item Owner, Base Bid (> 0) và Category ID.');
        return;
    }

    // 3. Chuẩn bị đối tượng dữ liệu gửi lên Server
    const data = {
        description: name, 
        sellerId: owner, 
        startPrice: baseBid, 
        startTime: timeStart ? new Date(timeStart).toISOString() : null,
        endTime: timeEnd ? new Date(timeEnd).toISOString() : null,
        imageUrl: imageUrl || null, 
        descriptionDetail: descriptionDetail || null, 
        categoryId: categoryId 
    };

    try {
        const res = await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Sản phẩm đã được thêm thành công!');
            window.location.href = 'items.html';
        } else {
            const errorText = await res.text();
            alert(`Lỗi khi thêm sản phẩm. Mã lỗi: ${res.status}. Chi tiết: ${errorText || 'Không rõ.'}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Đã xảy ra lỗi mạng khi gửi yêu cầu.');
    }
}