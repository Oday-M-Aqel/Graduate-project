// Function to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".messages-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

// Function to show message more details
function readMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.classList.toggle("more-details");
}

function closeMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.parentElement.classList.toggle("more-details");
}
let reason;
// Function to reject reservation
function rejectReservation(event) {
  event.preventDefault(); // Prevent default button behavior
  const clickedElement = event.target;
  const parent = clickedElement.closest(".message");
  const reservationID = parent.querySelector(".reservation-id").value;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    input: "text",
    inputAttributes: {
      placeholder: "Reasons of reject",
      required: true,
    },
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Reject it!",
    preConfirm: (inputValue) => {
      if (!inputValue) {
        Swal.showValidationMessage("Input is required");
      }
      reason = inputValue;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Rejected!",
        text: "The reservation request has been rejected.",
        icon: "success",
      });

      fetch("/admin/messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reservationID,
          status: "rejected",
          message: reason,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("There is something wrong");
          }
          return response.json();
        })
        .then((data) => {
          // console.log("Reservation update successful:", data);
          // Handle the success response here
          parent.remove();
        })
        .catch((err) => {
          // console.error("Reservation update failed:", err);
        });
    }
  });
}

// Function to accept reservation
function acceptReservation(event) {
  event.preventDefault(); // Prevent default button behavior
  const clickedElement = event.target;
  const parent = clickedElement.closest(".message");
  const reservationID = parent.querySelector(".reservation-id").value;
  fetch("/admin/messages", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: reservationID, status: "accepted" }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("There is something error");
      }
      return response.json();
    })
    .then((data) => {
      // console.log("Reservation accepted successfully:", data);
      Swal.fire({
        title: "Accepted!",
        text: "The reservation request has been accepted.",
        icon: "success",
      });
      // Optionally, you can update the UI to reflect the change
      parent.remove();
    })
    .catch((err) => {
      // console.error("Reservation acceptance failed:", err);
      Swal.fire({
        title: "Error!",
        text: "There was an error accepting the reservation.",
        icon: "error",
      });
    });
}

// Function to add a new reservation message to the messages table
let messagesTable = document.querySelector(".messages-table");
function addMessage(
  userName,
  userEmail,
  reservationId,
  reservationName,
  reservationPhone,
  reservationDate,
  numOfPersons,
  moreDetails = "none"
) {
  const newMessage = document.createElement("div");
  newMessage.innerHTML = `
    <form action="" class="message flex-row" method="">
      <div class="info-container flex-row">
        <div class="icon flex-row">
          <i class="fa-regular fa-envelope"></i>
          <p class="input-style .new-message">new message</p>
        </div>
        <div>
          <input type="text" class="customer-name input-style" value="${userName}">
          <input type="email" class="customers-email input-style display-none" value="${userEmail}">
          <input type="text" class="reservation-id" value="${reservationId}">
        </div>
      </div>
      <div class="message-content display-none">
        <textarea name="" id="" class="message-content input-style">
subject: reservation request
I want to make a reservation at your esteemed cafe.                          
Please find the reservation details below:                           
Contact Name: [${reservationName}]
Contact Phone: [${reservationPhone}]
Date: [${reservationDate}]
Number of persons: [${numOfPersons}]
We would appreciate it if you could confirm our reservation at your earliest convenience. 
here more details : [${moreDetails}]
        </textarea>
      </div>
      <p class="open-msg" onclick="readMessagge(event)">read</p>
      <div class="btns display-none">
        <button class="accept-btn btn-style" onclick="acceptReservation(event)">Accept</button>
        <input type="button" class="reject-btn btn-style" onclick="rejectReservation(event)" value="reject">
        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
      </div>
    </form>
  `;
  messagesTable.appendChild(newMessage.firstElementChild);
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("/admin/messages/api")
    .then(async (response) => {
      let data = await response.json();
      return data;
    })
    .then((data) => {
      if (data.message) {
        const error = data.message;
        // 1- No User found login
        // 2- no reservation
        // 3- No users data found in reservation
        // 4- Internal server error
        if (error == "2") {
          document.querySelector(".no-items").style.display = "block";
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `There is an error ${error}, please try reloading the page`,
          });
        }
      }
      data.forEach((reservation) => {
        addMessage(
          reservation.userName,
          reservation.userEmail,
          reservation.reservationId,
          reservation.resName,
          reservation.phone,
          new Date(reservation.reserveDate).toLocaleString(), // Format date
          reservation.numPerson,
          reservation.details
        );
      });
    })
    .catch((error) => console.error("Error fetching user data:", error));
});

window.logout = function () {
  fetch("/admin/messages/logout", {
    method: "POST",
  })
    .then((result) => {
      window.location.href = "/home";
    })
    .catch((err) => {
      // console.log(err);
    });
};

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
