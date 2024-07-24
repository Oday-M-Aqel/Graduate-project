//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".orders-container");
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
function doneMessagge(event) {
  const clickedElement = event.target;
  const parent = clickedElement.parentElement.parentElement;
  const orderId = parent.querySelector(".order-id").textContent;

  fetch("/admin/orders", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", // Specify the content type
    },
    body: JSON.stringify({ orderId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Response Was Not Ok!!");
      }
      return response.text();
    })
    .then((data) => {
      Swal.fire({
        title: "Finished!",
        text: "The Order is completed.",
        icon: "success",
      });
      parent.remove();
    })
    .catch((err) => {
      Swal.fire({
        title: "Failed!",
        text: "There is something error." + err,
        icon: "failed",
      });
    });
}

let ordersTable = document.querySelector(".orders-table");
function addOrder(
  orderId,
  userName,
  userEmail,
  orderName,
  orderPhone,
  city,
  address1,
  address2,
  productsArray,
  totalPrice
) {
  const products = document.createElement("tbody");
  productsArray.forEach((element) => {
    products.appendChild(addProduct(element.name, element.quantity));
  });
  const newOrder = document.createElement("div");
  newOrder.innerHTML = `
   <div class="message flex-row">
                    <div class="info-container flex-row">
                        <div class="icon flex-row">
                            <i class="fa-solid fa-utensils"></i>
                            <p class="input-style .new-message">new order</p>
                            <div style="display:none" class="order-id">${orderId}</div>
                        </div>

                        <div class="user-details">
                            <input type="text" class="customer-name input-style" value="${userName}">
                            <input type="email" class="customers-email input-style display-none" value="${userEmail}">
                            <!-- <input type="text" class="customer-info input-style display-none" value="0569912325"> -->
                        </div>
                    </div>
                    <div class="order-content display-none">
                        <div class="order-content input-style">
                            <div class=" display-none order-info ">
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
                                    ${products.innerHTML}
                                    <tfoot>
                                        <td>total price :${totalPrice}₪</td>
                                        <td></td>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                    <p class="open-order" onclick="readMessagge(event)">details</p>
                    <div class="btns display-none ">
                        <input type="button" class="close-msg btn-style" value="close" onclick="closeMessagge(event)">
                        <input type="button" class="done-msg btn-style" value="finished" onclick="doneMessagge(event)">
                    </div>
                </div>
  `;
  ordersTable.appendChild(newOrder.firstElementChild);
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

document.addEventListener("DOMContentLoaded", () => {
  fetch("/admin/orders/api")
    .then(async (response) => {
      let data = await response.json();
      return data;
    })
    .then((data) => {
      if (data.message) {
        const error = data.message;
        // 1- Order not found
        // 2- user not found
        // 3- product not found
        // 4- internal server error
        if (error == "1") {
          document.querySelector(".no-items").style.display = "block";
        } else if (error == "3") {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "The Product that has been ordered is not availabel",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "There is an error , please try reloading the page",
          });
        }

        //
        //
      }
      data.orders.forEach((order) => {
        // Extract user data
        const userName = order.userName;
        const userEmail = order.userEmail;
        // Extract delivery data
        const orderName = order.customer.name;
        const orderPhone = order.customer.phone;
        const city = order.customer.City;
        const address1 = order.customer.address1;
        const address2 = order.customer.address2 || "";

        // Extract product data
        const productsArray = order.products.map((product) => ({
          name: product.productName,
          quantity: product.quantity,
        }));

        // Extract total price
        const totalPrice = order.totalPrice;

        // Add the order data to the HTML
        addOrder(
          order.orderId,
          userName,
          userEmail,
          orderName,
          orderPhone,
          city,
          address1,
          address2,
          productsArray,
          totalPrice
        );
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
