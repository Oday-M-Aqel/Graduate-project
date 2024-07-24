//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".dashboard-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

window.logout = function () {
  fetch("/admin/dashboard/logout", {
    method: "POST", // Change the method to POST
  })
    .then((result) => {
      // console.log("logout success");
      window.location.href = "/home";
    })
    .catch((err) => {
      // console.log(err);
    });
};

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");
  logoutButton.addEventListener("click", logout);
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

//functoin to delete the resrvatoin request
function rejectReservation(event) {
  const clickedElement = event.target;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Reject it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Extract reservation ID from the DOM
      const parent = clickedElement.parentElement.parentElement;
      const reservationID = parent.querySelector(".reservation-id").value;

      // Send the reservation ID and state to the server
      fetch(`/admin/dashboard/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reservationID }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          if (data.message === "Reservation deleted successfully") {
            // If successful, show success message and remove the reservation from the DOM
            Swal.fire({
              title: "Rejected!",
              text: "The reservation has been rejected.",
              icon: "success",
            });
            parent.remove();
          } else {
            // If there's an error, show error message
            Swal.fire({
              title: "Error!",
              text: "There was a problem rejecting the reservation.",
              icon: "error",
            });
          }
        })
        .catch((error) => {
          console.error("Error deleting reservation:", error);
          Swal.fire({
            title: "Error!",
            text: "There was a problem rejecting the reservation.",
            icon: "error",
          });
        });
    }
  });
}

//functoin to delete the resrvatoin request
function doneReservation(event) {
  const clickedElement = event.target;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Done",
        text: "The reservation done.",
        icon: "success",
      });
      // Extract reservation ID from the DOM
      const parent = clickedElement.parentElement.parentElement;
      const reservationID = parent.querySelector(".reservation-id").value;
      // Send the reservation ID and state to the server side
      fetch("/admin/dashboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: reservationID, status: "completed" }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "There was an error updating the reservation state."
            );
          }
          return response.json();
        })
        .then((data) => {
          // console.log("Reservation marked as completed:", data);
          parent.remove(); // Remove the reservation element from the DOM
        })
        .catch((error) => {
          console.error("Error updating reservation state:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "There was an error updating the reservation state.",
          });
        });
    }
  });
}

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
                            <i class="fa-solid fa-receipt"></i>
                            <p class="input-style .new-message">reservation</p>
                        </div>
                        <div>
                            <input type="text" class="customer-name input-style" value="${userName}">
                            <input type="email" class="customers-email input-style display-none" value="${userEmail}">
                            <!-- <input type="text" class="customer-info input-style display-none" value="0569912325"> -->
                            <input type="text" class="reservation-id" value="${reservationId}">
                        </div>
                    </div>
                    <div class="message-content display-none">
                        <textarea name="" id="" class="message-content input-style">


reservation details :                           
Contact Name: [${reservationName}]
Contact Phone: [${reservationPhone}]
Date: [${reservationDate}]
Number of persons: [${numOfPersons}]

here more details : [${moreDetails}]
                        </textarea>
                    </div>
                    <p class="open-msg" onclick="readMessagge(event)">details</p>
                    <div class="btns display-none ">
                       <input type="button" class="accept-btn btn-style" onclick="doneReservation(event)" value="done">
                        <input type="button" class="reject-btn btn-style" onclick="rejectReservation(event)"
                            value="delete"> 
                        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
                    </div>
                </form>
  `;
  messagesTable.appendChild(newMessage.firstElementChild);
}

window.logout = function () {
  fetch("/admin/messages/logout", {
    method: "POST", // Change the method to POST
  })
    .then((result) => {
      window.location.href = "/home";
    })
    .catch((err) => {
      // console.log(err);
    });
};
function updateStatics(totalSalesN, totalOrdersN, totalUsersN) {
  const totalSales = document.querySelector(".sales .num span");
  totalSales.innerHTML = totalSalesN;
  const totalOrders = document.querySelector(".total-orders .num span");
  totalOrders.innerHTML = totalOrdersN;
  const totalUsers = document.querySelector(".total-users .num span");
  totalUsers.innerHTML = totalUsersN;
}
// updateStatics(350, 5, 10);
// function to update statics in page
document.addEventListener("DOMContentLoaded", () => {
  fetch("/admin/dashboard/api")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      data.reserve.forEach((r) => {
        console.log(r);
        addMessage(
          r.userName,
          r.userEmail,
          r._id,
          r.resName,
          r.resPhone,
          new Date(r.newDate).toLocaleString(), // Format date
          r.numOfPersons,
          r.details
        );
      });
      updateStatics(data.totalSales, data.recentOrders, data.recentUsers);
    })
    .catch((error) => console.error("Error fetching dashboard data:", error));
});

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('/getUserName');
    if (!response.ok) {
      throw new Error('Failed to fetch user name');
    }
    const data = await response.json();
    updateName(data.name);
  } catch (error) {
    console.error('Error:', error);
  }
  const logoutButton = document.querySelector(".logout");
  logoutButton.addEventListener("click", logout);
});