// const { config } = require("dotenv");

//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".messages-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

function showMsgs(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.parentElement.classList.toggle("show-msgs");
}

//function to show message more details
function readMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.classList.toggle("more-details");
}
function closeMessagge(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.parentElement.classList.toggle("more-details");
}

let pendingOrders = document.querySelector(".orders-table .pending-orders");
let oldOrders = document.querySelector(".orders-table .history-orders");
// let ordersTable = document.querySelector(".orders-table");
function addOrder(
  userName,
  userEmail,
  orderName,
  orderPhone,
  city,
  address1,
  address2,
  orderDate,
  orderState,
  prodctsArray,
  totalPrice
) {
  const products = document.createElement("tbody");
  prodctsArray.forEach((element) => {
    products.appendChild(addProduct(element.productName, element.quantity));
  });
  const newOrder = document.createElement("div");
  newOrder.className = "message flex-row";
  newOrder.innerHTML = `
    <div class="info-container flex-row">
      <div class="icon flex-row">
        <i class="fa-solid fa-utensils"></i>
        <p class="input-style new-message">new order</p>
      </div>
      <div class="user-details">
        <input type="text" class="customer-name input-style" value="${userName}">
        <input type="email" class="customers-email input-style display-none" value="${userEmail}">
      </div>
    </div>
    <div class="order-content display-none">
      <div class="order-content input-style">
        <div class="display-none order-info">
          <h3>order information :</h3>
          <div class="name input-style">name : ${orderName}</div>
          <div class="phone input-style">phone : ${orderPhone}</div>
          <div class="city input-style">city : ${city}</div>
          <div class="address1 input-style">address : ${address1}</div>
          <div class="address2 input-style">address2 : ${address2}</div>
        </div>
        <div class="order-details">
          <h3>order details : </h3>
          <table>
            <thead>
              <tr>
                <th>product</th>
                <th>quantity</th>
              </tr>
            </thead>
            ${products.outerHTML}
            <tfoot>
              <td>total price : ${totalPrice} ₪</td>
              <td></td>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    <p class="open-order" onclick="readMessagge(event)">details</p>
    <div class="btns display-none">
      <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
    </div>
  `;
  // Add the new order to pending or old orders based on the conditions
  const currentTime = new Date();
  const orderTime = new Date(orderDate);
  const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
  const timeDifference = currentTime - orderTime;

  if (timeDifference > millisecondsIn24Hours || orderState == "completed") {
    oldOrders.appendChild(newOrder);
  } else {
    pendingOrders.appendChild(newOrder);
  }
}

//function add products
function addProduct(productName, productQuantity) {
  const row = document.createElement("tr");
  const col1 = document.createElement("td");
  col1.textContent = productName;
  const col2 = document.createElement("td");
  col2.textContent = productQuantity;
  row.appendChild(col1);
  row.appendChild(col2);
  return row;
}

window.logout = function () {
  fetch("/user/orders/logout", {
    method: "POST", // Change the method to POST
  })
    .then(() => {
      window.location.href = "/home";
    })
    .catch((err) => {
      console.log(err);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  fetch("/user/orders/api")
    .then(async (response) => {
      let data = await response.json();
      // console.log(data);
      return data;
    })
    .then((data) => {
      if (data.message) {
        const error = data.message;
        // 1 - user not found
        // 2- orders not found
        // 3- internal server error
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
      data.forEach((Order) => {
        addOrder(
          Order.userName,
          Order.userEmail,
          Order.orderName,
          Order.orderPhone,
          Order.city,
          Order.address1,
          Order.address2,
          new Date(Order.createdAt).toLocaleString(),
          Order.status,
          Order.products,
          Order.totalPrice
        );
      });
    })
    .catch((error) =>
      console.error("Error fetching orders data:", error.message)
    );
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
