document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Ngăn trang web load lại
    event.preventDefault();

    // 1. Lấy dữ liệu từ ô nhập
    const emailInput = document.getElementById('loginEmail').value;
    const passwordInput = document.getElementById('loginPassword').value;

    // 2. Lấy danh sách users từ localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // 3. Tìm user khớp với cả Email và Mật khẩu
    const userFound = users.find(user => 
        user.email === emailInput && user.password === passwordInput
    );

    if (userFound) {
        alert("Đăng nhập thành công! Chào mừng " + (userFound.firstName || "bạn"));
        
        // Lưu thông tin người dùng hiện tại vào sessionStorage để dùng ở trang chủ
        sessionStorage.setItem('currentUser', JSON.stringify(userFound));

        localStorage.setItem('auth', '1');

        // 4. Chuyển hướng về trang chủ
        window.location.href = "../home.html";
    } else {
        // Nếu không khớp
        alert("Email hoặc mật khẩu không chính xác!");
    }
});