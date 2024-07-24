//This code written by Oday
const form = document.querySelector("form");
const error = document.querySelector(".error");

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userEmail = document.querySelector(".email-container .email").value;
    const userPassword = document.querySelector(
      ".password-container .password"
    ).value;

    fetch("/login", {
      method: "POST", // Change the method to POST
      body: JSON.stringify({ email: userEmail, password: userPassword }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        // if (!response.ok) {
        //   errorMsg();
        //   throw new Error("Network response was not ok");
        // }
        let data = await response.json();
        return data;
      })
      .then((data) => {
        if (data.state) {
          if (data.state === "admin") {
            window.location.href = "/home";
          } else if (data.state === "user") {
            window.location.href = "/home";
          }
        } else errorMsg(data.error);
      })
      .catch((err) => {
        errorMsg();
      });
  });
function addStatus(userStatus) {
  window.localStorage.setItem("status", userStatus);
}
//show error message
function errorMsg(msg) {
  error.style.display = "block";
  if (msg) error.innerHTML = msg;
  else error.innerHTML = "the email or password is not correct.";
}
