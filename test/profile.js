let cancelBtn = document.querySelector(".cancel-btn");
let editBtn = document.querySelector(".edit-btn");
let profile = document.querySelector(".user-info");

editBtn.addEventListener("click", () => {
  profile.classList.toggle("on-edit");
});

cancelBtn.addEventListener("click", () => {
  window.location.reload();
  profile.classList.toggle("on-edit");
});



