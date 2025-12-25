document.getElementById('registerForm').addEventListener('submit', async function(event) {
    // 1. Ngăn trang web load lại
    event.preventDefault();

    // 2. Lấy giá trị từ các input
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    // (Các trường khác như firstName, lastName, address có thể thêm vào sau nếu muốn)

    // 3. Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // 4. Gửi dữ liệu lên Server Node.js (Neo4j)
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đăng ký thành công và đã lưu vào Neo4j!");
            // Chuyển hướng sang trang login
            window.location.href = "login.html";
        } else {
            // Hiển thị lỗi từ server (Ví dụ: Email đã tồn tại)
            alert("Lỗi đăng ký: " + data.error);
        }

    } catch (error) {
        console.error("Lỗi kết nối server:", error);
        alert("Không thể kết nối tới server. Hãy chắc chắn server.js đang chạy!");
    }
});