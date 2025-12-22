// Dữ liệu mẫu dựa trên danh sách bạn gửi (Nếu API chưa chạy, nó sẽ dùng tạm danh sách này)
let categories = [
    { id: "C01", name: "Electronics" }, { id: "C02", name: "Collectibles" },
    { id: "C03", name: "Books" }, { id: "C04", name: "Art" },
    { id: "C05", name: "Jewelry" }, { id: "C06", name: "Sports Memorabilia" },
    { id: "C07", name: "Antiques" }, { id: "C08", name: "Furniture" },
    { id: "C09", name: "Rare Items" }, { id: "C10", name: "Fashion" },
    { id: "C11", name: "Photography" }, { id: "C12", name: "Comics" },
    { id: "C13", name: "Toys" }, { id: "C14", name: "Musical Instruments" },
    { id: "C15", name: "Home & Garden" }, { id: "C16", name: "Watches" },
    { id: "C17", name: "Historical Documents" }, { id: "C18", name: "Wine & Spirits" },
    { id: "C19", name: "Coins & Stamps" }, { id: "C20", name: "Movies & TV" },
    { id: "C21", name: "Pet Supplies" }, { id: "C22", name: "Health & Beauty" },
    { id: "C23", name: "Crafts" }, { id: "C24", name: "Video Games" },
    { id: "C25", name: "Automotive" }, { id: "C26", name: "Industrial" },
    { id: "C27", name: "Home Decor" }, { id: "C28", name: "Outdoor Gear" },
    { id: "C29", name: "Science Equipment" }, { id: "C30", name: "Food & Beverage" }
];

// Hàm hiển thị danh sách lên Modal
window.showCategoryModal = function() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = ''; // Xóa trắng danh sách cũ

    // Hiển thị danh sách categories
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.cursor = "pointer";
        li.innerHTML = `<strong>${cat.id}</strong> - ${cat.name}`;
        
        // Khi click vào một dòng
        li.onclick = function() {
            document.getElementById('categoryId').value = cat.id; // Điền ID vào input
            closeCategoryModal(); // Đóng modal
        };
        
        categoryList.appendChild(li);
    });

    document.getElementById('categoryModal').style.display = 'block';
}

window.closeCategoryModal = function() {
    document.getElementById('categoryModal').style.display = 'none';
}

async function addItem() {
    console.log("Nút Add đã được bấm!"); // Để kiểm tra xem hàm có chạy không

    // 1. Lấy dữ liệu từ đúng các ID trong HTML của bạn
    const name = document.getElementById('name').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const descriptionDetail = document.getElementById('descriptionDetail').value.trim(); // Phải đúng ID này
    const baseBid = Number(document.getElementById('baseBid').value);
    const timeStart = document.getElementById('timeStart').value;
    const timeEnd = document.getElementById('timeEnd').value;
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const categoryId = document.getElementById('categoryId').value.trim();

    // 2. Kiểm tra các trường bắt buộc
    if (!name || !owner || !baseBid || !categoryId) {
        alert('Vui lòng điering đầy đủ: Tên, Người bán, Giá gốc và Danh mục!');
        return;
    }

    // 3. Chuẩn bị dữ liệu gửi đi (Mapping khớp với Model của bạn)
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
        // Gửi yêu cầu đến API (Lưu ý: /api/items hay /items tùy theo server.js của bạn)
        const res = await fetch('/api/items', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Sản phẩm đã được thêm thành công!');
            window.location.href = 'database.html'; // Chuyển về trang database như bạn đặt ở nút Cancel
        } else {
            const errorText = await res.text();
            alert(`Lỗi từ Server: ${res.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Lỗi Fetch:', error);
        alert('Không thể kết nối đến Server. Vui lòng kiểm tra lại!');
    }
}