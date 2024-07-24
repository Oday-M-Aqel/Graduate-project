document.addEventListener("DOMContentLoaded", function () {
  redirect();
});

function redirect() {
  fetch("/home/api")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      let data = await response.json();
      var users;
      data.users.forEach((user) => {
        users = user;
      });
      document.getElementById("loginIc").removeAttribute("href");
      const loginIcon = document.getElementById("loginIc");
      if (users.status === "admin") {
        document.getElementById("loginIc").removeAttribute("href");
        loginIcon.href = "admin/dashboard";
      } else if (users.status === "user") {
        document.getElementById("loginIc").removeAttribute("href");
        loginIcon.href = "user/dashboard";
      }
    })
    .catch((error) => console.error("Error fetching user data:", error));
}
