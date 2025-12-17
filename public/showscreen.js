function showUserHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  userViews.forEach((el) => (el.style.display = "block"));
  guestViews.forEach((el) => (el.style.display = "none"));
  adminViews.forEach((el) => (el.style.display = "none"));
}

function showGuestHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  guestViews.forEach((el) => (el.style.display = "block"));
  userViews.forEach((el) => (el.style.display = "none"));
  adminViews.forEach((el) => (el.style.display = "none"));
}

function showAdminHome() {
  const userViews = document.querySelectorAll(".user-view");
  const guestViews = document.querySelectorAll(".guest-view");
  const adminViews = document.querySelectorAll(".admin-view");
  adminViews.forEach((el) => (el.style.display = "block"));
  userViews.forEach((el) => (el.style.display = "none"));
  guestViews.forEach((el) => (el.style.display = "none"));
}

export function showShit(Auth) {
  if (Auth === -1) {
    showAdminHome();
  } else if (Auth === 1) {
    showUserHome();
  } else {
    showGuestHome();
  }
}
