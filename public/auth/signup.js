document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng ký thành công và đã lưu vào Neo4j!");

        window.location.href = "login.html";
      } else {
        alert("Lỗi đăng ký: " + data.error);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
      alert("Không thể kết nối tới server. Hãy chắc chắn server.js đang chạy!");
    }
  });
