//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".messages-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

//function to show message more details
function readMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.classList.toggle("more-details");
}
function closeMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.parentElement.classList.toggle("more-details");
}

function showMsgs(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.parentElement.classList.toggle("show-msgs");
}

let reservationID;
function rejectReservation(event) {
  const clickedElement = event.target;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, cancel it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "canceled!",
        text: "the reservation has been canceled.",
        icon: "success",
      });
      const parent = clickedElement.parentElement.parentElement;
      const reservationID = parent.querySelector(".reservation-id").value;
      //function to send this reservation info to rejected reservation database
      //
      //function here
      //
      parent.remove();
    }
  });
}
let rejectedContainer = document.querySelector(
  ".rejected-reservation .content-section"
);
let acceptedContainer = document.querySelector(
  ".accepted-reservation .content-section"
);
let pendingContainer = document.querySelector(
  ".pending-reservation .content-section"
);

function addMessagePending(
  Name,
  Email,
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

                        <div class="user-info">
                            <input type="text" class="customer-name input-style" value="${Name}">
                            <input type="email" class="customers-email input-style display-none" value="${Email}">
                            <!-- <input type="text" class="customer-info input-style display-none" value="0569912325"> -->
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
                    <div class="btns display-none ">
                        <input type="button" class="reject-btn btn-style" onclick="rejectReservation(event)"
                            value="cancel">
                        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
                    </div>
                </form>
  `;
  pendingContainer.appendChild(newMessage.firstElementChild);
}

function addMessageAccepted(
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
                            <input type="text" class="customer-name input-style" value="YKPO Cafe">
                            <input type="email" class="customers-email input-style display-none" value="Admin@YKPO.com">
                            <!-- <input type="text" class="customer-info input-style display-none" value="0569912325"> -->
                            <input type="text" class="reservation-id" value="${reservationId}">
                        </div>
                    </div>
                    <div class="message-content display-none">
                        <textarea name="" id="" class="message-content input-style">

subject: reservation request

We are pleased to inform you that your request to book a reservation in our café has been accepted,                         
the reservation details below:                           
Contact Name: [${reservationName}]
Contact Phone: [${reservationPhone}]
Date: [${reservationDate}]
Number of persons: [${numOfPersons}]


here more details : [${moreDetails}]

                        </textarea>
                    </div>
                    <p class="open-msg" onclick="readMessagge(event)">read</p>
                    <div class="btns display-none ">
                        <input type="button" class="reject-btn btn-style" onclick="rejectReservation(event)"
                            value="cancel">
                        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
                    </div>
                </form>
  `;
  acceptedContainer.appendChild(newMessage.firstElementChild);
}

function addMessageRejected(
  reservationId,
  reservationName,
  reservationPhone,
  reservationDate,
  numOfPersons,
  moreDetails = "none",
  rejectedMessage
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
                            <input type="text" class="customer-name input-style" value="YKPO Cafe">
                            <input type="email" class="customers-email input-style display-none" value="Admin@YKPO.com">
                            <!-- <input type="text" class="customer-info input-style display-none" value="0569912325"> -->
                            <input type="text" class="reservation-id" value="${reservationId}">
                        </div>
                    </div>
                    <div class="message-content display-none">
                        <textarea name="" id="" class="message-content input-style">

subject: reservation request

We are sorry, but we have to make a decision to reject the reservation you made for our cafe,                         
the reservation details below:                           
Contact Name: [${reservationName}]
Contact Phone: [${reservationPhone}]
Date: [${reservationDate}]
Number of persons: [${numOfPersons}]
here more details : [${moreDetails}]



reasons of reject : [ ${rejectedMessage}]
                        </textarea>
                    </div>
                    <p class="open-msg" onclick="readMessagge(event)">read</p>
                    <div class="btns display-none ">
                        
                        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
                    </div>
                </form>
  `;
  rejectedContainer.appendChild(newMessage.firstElementChild);
}

window.logout = function () {
  fetch("/user/reservation/logout", {
    method: "POST", // Change the method to POST
  })
    .then((result) => {
      window.location.href = "/home";
    })
    .catch((err) => {
      console.log(err);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  fetch("/user/messages/api")
    .then(async (response) => {
      let data = await response.json();
      // console.log(data);
      return data;
    })
    .then((data) => {
      if (data.message) {
        const error = data.message;
        // 1- No user
        // 2- No Reservation
        // 3- internal server Error
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
        if (reservation.status === "pending") {
          addMessagePending(
            reservation.userName,
            reservation.userEmail,
            reservation.reservationId,
            reservation.resName,
            reservation.phone,
            new Date(reservation.reserveDate).toLocaleString(), // Format date
            reservation.numPerson,
            reservation.details
          );
        } else if (reservation.status === "accepted") {
          addMessageAccepted(
            reservation.reservationId,
            reservation.resName,
            reservation.phone,
            new Date(reservation.reserveDate).toLocaleString(), // Format date
            reservation.numPerson,
            reservation.details
          );
        } else if (reservation.status === "rejected") {
          addMessageRejected(
            reservation.reservationId,
            reservation.resName,
            reservation.phone,
            new Date(reservation.reserveDate).toLocaleString(), // Format date
            reservation.numPerson,
            reservation.details,
            reservation.RejMessage
          );
        }
      });
    })
    .catch((error) => console.error("Error fetching user data:", error));
});

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
