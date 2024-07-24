//function to check the values of inputs filed
let emailValidate = false;
let phoneValidate = false;
let passwordValidate = false;
//function to check email
async function checkEmail(event) {
  const Email = event.target.value;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(Email)) {
    try {
      const emailExists = await checkDB(Email);
      if (emailExists) {
        showEmailError();
        event.target.classList.add("notValid");
        emailValidate = false;
      } else {
        // Email does not exist
        event.target.classList.remove("notValid");
        event.target.classList.add("valid");
        removeEmailError();
        emailValidate = true;
      }
    } catch (err) {
      console.error("Error checking email:", err);
    }
  } else {
    event.target.classList.add("notValid");
    emailValidate = false;
  }
}

async function checkDB(email) {
  try {
    const response = await fetch("/signup/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      throw new Error("Server responded with error status: " + response.status);
    }
    const data = await response.json();
    if (data.message === "exist") {
      return true; // Email exists
    } else {
      return false; // Email does not exist
    }
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
}

//function to show error message when user use already used email
function showEmailError() {
  const emailMsg = document.querySelector(".emailExist");
  emailMsg.classList.remove("disaper");
}
//function to remove error message when user use already used email
function removeEmailError() {
  const emailMsg = document.querySelector(".emailExist");
  emailMsg.classList.add("disaper");
}

//function to check phone number
function checkPhone(event) {
  const phone = event.target.value;
  const phoneRegex = /^(059|056)\d{7}$/;
  if (phoneRegex.test(phone)) {
    phoneValidate = true;
    event.target.classList.remove("notValid");
    event.target.classList.add("valid");
  } else {
    event.target.classList.add("notValid");
    phoneValidate = false;
  }
}
//function to check password
function checkPassword(event) {
  const password = event.target.value;
  const passwordRegex =
    /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)(?=.*[A-Z]).{8,}$/;
  if (passwordRegex.test(password)) {
    passwordValidate = true;
    event.target.classList.remove("notValid");
    event.target.classList.add("valid");
  } else {
    passwordValidate = false;
    event.target.classList.add("notValid");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const password = form.password.value;

    if (phoneValidate && passwordValidate && emailValidate) {
      try {
        const response = await fetch("/signup", {
          method: "POST",
          body: JSON.stringify({
            name: name,
            phone: phone,
            email: email,
            password: password,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 409) {
          const data = await response.json();
          Swal.fire({
            position: "center",
            icon: "error",
            title: data.message,
            showConfirmButton: false,
            timer: 1500,
          });
        } else if (response.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Thank you for signing up! Your account is ready.",
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => {
            window.location.href = "home";
          }, 1500);
        } else {
          throw new Error("Unexpected error");
        }
      } catch (err) {
        // console.log(err);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Something went wrong. Please try again.",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Please ensure all fields are valid.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
});
