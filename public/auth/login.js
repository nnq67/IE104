document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('loginEmail').value;
    const passwordInput = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đăng nhập thành công!");
            
            // 1. Lưu thông tin phiên làm việc
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // 2. LƯU userId VÀO localStorage (QUAN TRỌNG ĐỂ BID)
            // Đảm bảo Backend trả về field userId (ví dụ: "U1", "U2")
            if (data.user.userId) {
                localStorage.setItem("userId", data.user.userId);
            } else if (data.user.id) {
                localStorage.setItem("userId", data.user.id);
            }

            // 3. LOGIC LƯU BIẾN AUTH THEO ROLE
            if (data.user.role === 'admin') {
                localStorage.setItem("auth", "-1"); 
            } else {
                localStorage.setItem("auth", "1"); 
            }

            // 4. Chuyển hướng
            window.location.href = "../home.html";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối server!");
    }
});