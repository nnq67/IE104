async function handleAuth(event, type) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`/api/auth/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      if (type === "login") {
        localStorage.setItem("token", result.token);
        alert("Đăng nhập thành công!");
        window.location.href = "/";
      } else {
        alert("Đăng ký thành công! Hãy đăng nhập.");
        window.location.href = "/login.html";
      }
    } else {
      alert(result.error);
    }
  } catch (err) {
    console.error("Lỗi kết nối:", err);
  }
}
