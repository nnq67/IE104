/**
 * 1. XỬ LÝ TAB USERS
 */
async function showUsers() {
    // Cập nhật giao diện tab active
    document.getElementById('users-page').classList.add('active');
    document.getElementById('items-page').classList.remove('active');
    document.getElementById('tab-users').classList.add('active');
    document.getElementById('tab-items').classList.remove('active');
    
    // GỌI HÀM LẤY DỮ LIỆU (Trước đó bạn thiếu dòng này)
    await loadUsersFromServer();
}

async function loadUsersFromServer() {
    const usersPage = document.getElementById('users-page');
    const toolbar = usersPage.querySelector('.toolbar');
    
    try {
        // Gọi API lấy User (Đảm bảo backend có route /api/auth/all)
        const res = await fetch('/api/auth/all'); 
        if (!res.ok) throw new Error("Không thể tải danh sách người dùng");

        const users = await res.json();

        // Xóa nội dung cũ, giữ lại toolbar
        usersPage.innerHTML = '';
        usersPage.appendChild(toolbar);

        if (users.length === 0) {
            usersPage.innerHTML += `<p style="padding: 20px; text-align: center;">Chưa có người dùng nào trong hệ thống.</p>`;
            return;
        }

        // Render từng User Card
        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-info">
                    <div class="title">${user.username || 'Nặc danh'}</div>
                    <div class="subtitle">ID: ${user.userId} | Email: ${user.email || 'N/A'}</div>
                    <div style="font-size: 0.85rem; color: #28a745; margin-top: 5px;">
                        Vai trò: <strong>${user.role || 'User'}</strong>
                    </div>
                </div>
                <div class="actions">
                    <a href="user-detail.html?id=${user.userId}">
                        <button class="view-btn">View details</button>
                    </a>
                    <button class="delete-btn" onclick="deleteUser('${user.userId}')">Delete</button>
                </div>
            `;
            usersPage.appendChild(card);
        });
    } catch (error) {
        console.error("Lỗi load users:", error);
    }
}

/**
 * 2. XỬ LÝ TAB ITEMS
 */
async function showItems() {
    document.getElementById('items-page').classList.add('active');
    document.getElementById('users-page').classList.remove('active');
    document.getElementById('tab-items').classList.add('active');
    document.getElementById('tab-users').classList.remove('active');

    await loadItemsFromServer();
}

async function loadItemsFromServer() {
    const itemsPage = document.getElementById('items-page');
    const toolbar = itemsPage.querySelector('.toolbar');
    
    try {
        const res = await fetch('/api/items');
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");

        const items = await res.json();

        itemsPage.innerHTML = '';
        itemsPage.appendChild(toolbar);

        if (items.length === 0) {
            itemsPage.innerHTML += `<p style="padding: 20px; text-align: center;">Chưa có sản phẩm nào.</p>`;
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-info">
                    <div class="title">${item.title}</div>
                    <div class="subtitle">by ${item.author} | ID: ${item.id}</div>
                    <div style="font-size: 0.85rem; color: #007bff; margin-top: 5px;">
                        Giá: ${item.price.toLocaleString()} VND | Trạng thái: <b>${(item.type || 'current').toUpperCase()}</b>
                    </div>
                </div>
                <div class="actions">
                    <a href="item-detail.html?id=${item.id}">
                        <button class="view-btn">View details</button>
                    </a>
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            `;
            itemsPage.appendChild(card);
        });
    } catch (error) {
        console.error("Lỗi load items:", error);
    }
}

/**
 * 3. HÀM XÓA (DELETE)
 */
async function deleteItem(itemId) {
    if (!confirm(`Xóa sản phẩm ${itemId}?`)) return;
    try {
        const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
        if (res.ok) { alert("Đã xóa sản phẩm!"); loadItemsFromServer(); }
    } catch (error) { console.error("Lỗi xóa item:", error); }
}

async function deleteUser(userId) {
    if (!confirm(`Xóa người dùng ${userId}?`)) return;
    try {
        const res = await fetch(`/api/auth/users/${userId}`, { method: 'DELETE' });
        if (res.ok) { alert("Đã xóa người dùng!"); loadUsersFromServer(); }
    } catch (error) { console.error("Lỗi xóa user:", error); }
}

/**
 * 4. KHỞI CHẠY KHI LOAD TRANG
 */
document.addEventListener("DOMContentLoaded", () => {
    // Mặc định load Items trước
    showItems();
});