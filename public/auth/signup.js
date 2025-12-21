document.getElementById('registerForm').addEventListener('submit', function(event) {
    // 1. Ngăn trang web load lại khi bấm submit
    event.preventDefault();

    // 2. Lấy giá trị từ các input
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    // 3. Kiểm tra mật khẩu khớp nhau không
    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // 4. Tạo đối tượng user mới
    const newUser = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password, // Lưu ý: thực tế cần mã hóa
        address: address,
        phone: phone
    };

    // 5. Kiểm tra và Lưu vào localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Kiểm tra username hoặc email đã tồn tại chưa
    const isExisted = users.some(u => u.username === username || u.email === email);
    if (isExisted) {
        alert("Tên đăng nhập hoặc email đã được sử dụng!");
        return;
    }

    // Thêm user vào mảng và lưu lại
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Đăng ký thành công!");
    
    // 6. Chuyển hướng sang trang login
    window.location.href = "login.html";
});