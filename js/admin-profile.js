//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".profile-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

let cancelBtn = document.querySelector(".cancel-btn");
let saveBtn = document.querySelector(".save-btn");
let editBtn = document.querySelector(".edit-btn");
let profile = document.querySelector(".user-info");
let deleteAccountBtn = document.querySelector(".delete-btn");

deleteAccountBtn.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your account has been deleted.",
        icon: "success",
      });
      //function()
      const userEmail = document.querySelector(".email-container .email").value;
      fetch("/admin/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("There is something error");
          }
          return response.text();
        })
        .then((data) => {
          // console.log("Customer deletion successful:", data);
          window.location.href = "/home";
        })
        .catch((err) => {
          console.error("Customer deletion failed:", err);
        });
    }
  });
});

let changePasswordBtn = document.querySelector(".change-pass-btn");
let passwordContainer = document.querySelectorAll(".password-container");

changePasswordBtn.addEventListener("click", () => {
  passwordContainer[0].classList.toggle("change");
  passwordContainer[1].classList.toggle("change");
  changePasswordBtn.classList.toggle("change");
  cancelBtn.style.display = "block";
  saveBtn.style.display = "block";
  changePasswordBtn.style.display = "none !important";
});

//canccel button
cancelBtn.addEventListener("click", () => {
  window.location.reload();
  profile.classList.toggle("on-edit");
});

//edit button function
editBtn.addEventListener("click", () => {
  profile.classList.toggle("on-edit");
});

fetch("/admin/profile/api")
  .then(async (response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    let data = await response.json();
    return data;
  })
  .then((data) => {
    updateInfo(data.name, data.email, data.phone);
    updateName(data.name);
    window.globalValue = data.name;
  })
  .catch((error) => console.error("Error fetching user data:", error));

//----------------------------------------\\

let nameField = document.querySelector(".nameField");
let emailField = document.querySelector(".email");
let phoneField = document.querySelector(".phone");

function updateInfo(name, email, phone) {
  nameField.value = name;
  emailField.value = email;
  phoneField.value = phone;
}

window.logout = function () {
  fetch("/admin/profile/logout", {
    method: "POST", // Change the method to POST
  })
    .then((result) => {
      window.location.href = "/home";
    })
    .catch((err) => {
      console.log(err);
    });
};

function updateData() {
  // Extract values from form fields
  const name = document.querySelector(".nameField").value;
  const email = document.querySelector(".email").value;
  const phone = document.querySelector(".phone").value;
  const oldPassword = document.querySelector(".old-password").value;
  const newPassword = document.querySelector(".new-password").value;
  // Create an object with the data to be sent in the request body
  const userData = {
    name: name,
    email: email,
    phone: phone,
    oldPassword: oldPassword,
    newPassword: newPassword
  };
  // Send a PUT request to update the user's profile
  fetch("/user/profile", {
    method: "PUT", // Specify the HTTP method as PUT for updating
    headers: {
      "Content-Type": "application/json", // Specify the content type
    },
    body: JSON.stringify(userData), // Convert userData object to JSON string
  })
    .then((response) => response.json().then(data => ({ status: response.status, body: data })))
    .then((result) => {
      if (result.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Your profile has been updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); // Reload the page after successful update
        });
      } else {
        throw new Error(result.body.error);
      }
    })
    .catch((err) => {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        showConfirmButton: true,
      });
    });
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/getUserName");
    if (!response.ok) {
      throw new Error("Failed to fetch user name");
    }
    const data = await response.json();
    updateName(data.name);
  } catch (error) {
    console.error("Error:", error);
  }
  const logoutButton = document.querySelector(".logout");
  logoutButton.addEventListener("click", logout);
});
