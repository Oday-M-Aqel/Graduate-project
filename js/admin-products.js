//to show the links list in medium and small screens
let listIcon = document.querySelector("#menu-icon");
let dashboard = document.querySelector(".product-container");
listIcon.addEventListener("click", () => {
  dashboard.classList.toggle("activeList");
});

//function to add product
let productTable = document.querySelector(".products-table");
function addProduct(
  imgSrc,
  productName,
  productPrice,
  productDesc,
  productType,
  productId,
  productState
) {
  let newProduct;
  if (productState.toLocaleLowerCase() == "not available") {
    newProduct = ` 
                    <div class="product">
                    <div class="product-id">${productId}</div>
                    <div class="product-state" onclick="changeState(event)">${productState}</div>
                    <div class="product-img"><img src="${imgSrc}" alt="">
                    </div>
                    <div class="product-info">
                        <p class="product-title">${productName}</p>
                        <p class="product-description">${productDesc}</p>
                    </div>
                    <div class="price">
                        <p><span class="price-x">${productPrice}</span> ₪</p>
                        <button class="atc" onclick="activeMoreDetailsPage(event)">More Details</button>
                    </div>
                    <div class="type">${productType}</div>
                </div>
  `;
  } else {
    newProduct = ` 
                    <div class="product">
                    <div class="product-id">${productId}</div>
                    <div class="product-state product-availabel" onclick="changeState(event)">${productState}</div>
                    <div class="product-img"><img src="${imgSrc}" alt="">
                    </div>
                    <div class="product-info">
                        <p class="product-title">${productName}</p>
                        <p class="product-description">${productDesc}</p>
                    </div>
                    <div class="price">
                        <p><span class="price-x">${productPrice}</span> ₪</p>
                        <button class="atc" onclick="activeMoreDetailsPage(event)">More Details</button>
                    </div>
                    <div class="type">${productType}</div>
                </div>
  `;
  }
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = newProduct;
  // tempDiv.classList = "product-item";
  // tempDiv.innerHTML = newProduct;
  // const newProductElement = tempDiv;

  // Append the new product element to the product table
  productTable.appendChild(tempDiv.firstElementChild);
}
//adding proudct from data base to page
document.addEventListener("DOMContentLoaded", async function () {
  // Fetch product data from the backend and populate the table
  await fetch("/admin/products/api")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    })
    .then((data) => {
      data.products.forEach((product) => {
        // Assuming product.image contains ArrayBuffer image data
        let imgSrc =
          "data:image/jpeg;base64," +
          arrayBufferToBase64(product.image.data.data);
        // Now imgSrc contains the Base64-encoded image data, which you can use as the src attribute of an <img> tag
        // Example usage:
        addProduct(
          imgSrc,
          product.name,
          product.price,
          product.description,
          product.type,
          product._id,
          product.status
        );
      });
    })
    .catch((error) => console.error("Error fetching product data:", error));

  // Function to convert ArrayBuffer to Base64-encoded string
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  const loadingScreen = document.querySelector(".loader");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 700);
});

//function to show more details page
function activeMoreDetailsPage(event) {
  const clickedElement = event.target;
  const product = clickedElement.parentElement.parentElement;
  dashboard.classList.toggle("hide-content");
  const detailsPage = document.querySelector(".details-page");
  detailsPage.classList.toggle("more-details-active");
  detailsPage.querySelector(".product-id").textContent =
    product.querySelector(".product-id").textContent;

  detailsPage.querySelector("img").src = product.querySelector("img").src;

  detailsPage.querySelector(".product-title").value =
    product.querySelector(".product-title").textContent;

  detailsPage.querySelector(".product-desc").textContent =
    product.querySelector(".product-description").textContent;

  detailsPage.querySelector(".product-price").value =
    product.querySelector(".price-x").textContent;

  detailsPage.querySelector(".type-show").textContent =
    product.querySelector(".type").textContent;

  detailsPage.querySelector("#type").value = detailsPage
    .querySelector(".type-show")
    .textContent.toLocaleLowerCase();
}
//function to close more details page
function closeMoreDetailsPage() {
  dashboard.classList.toggle("hide-content");
  const detailsPage = document.querySelector(".details-page");
  detailsPage.classList.toggle("more-details-active");
}

let addProductBtn = document.querySelector(".new-product-btn");
let productFormDiv = document.querySelector(".new-product");
let productForm = document.querySelector(".product-form");
let content = document.querySelector(".content");

//delete product
function deleteProduct(event) {
  const clickedElement = event.target;
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
      closeMoreDetailsPage();
      Swal.fire({
        title: "Deleted!",
        text: "the product has been deleted.",
        icon: "success",
      });

      //Start delete event
      const productId =
        clickedElement.parentElement.parentElement.firstElementChild.innerHTML;
      fetch("/admin/products", {
        method: "DELETE", // Specify the HTTP method as DELETE
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify({ id: productId }), // Send the product ID to delete
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("There is something error");
          }
          // Check if the response body contains the success message
          return response.text();
        })
        .then((data) => {
          // console.log("Product deletion successful:", data);
          // Handle the success response here
          // For example, remove the deleted product from the DOM
          clickedElement.parentElement.parentElement.parentElement.remove();
        })
        .catch((err) => {
          console.error("Product deletion failed:", err);
          // Handle the error here
        });
      //finish delete event
    }
  });
}

//edit product btn
function eidtProductBtnFunction(event) {
  const ele = event.target;
  ele.parentElement.parentElement.classList.toggle("on-edit");
}

//cancel edit on product
function cancelBtnFunction(event) {
  // window.location.reload();
  document.querySelector(".more-details").classList.toggle("on-edit");
  closeMoreDetailsPage();
}

//active and disable add product page
function activeAddProductPage() {
  productFormDiv.classList.toggle("active-page");
  content.classList.toggle("hide-content");
}

//show more details of product
function showDetails(event) {
  const clickedElement = event.target;
  clickedElement.parentElement.classList.toggle("more-details");
  const type =
    clickedElement.previousElementSibling.firstElementChild.textContent.toLowerCase();
  clickedElement.previousElementSibling.lastElementChild.value = type;
}

window.logout = function () {
  fetch("/admin/dashboard/logout", {
    method: "POST", // Change the method to POST
  })
    .then((result) => {
      // console.log("logout success");
      window.location.href = "/home";
    })
    .catch((err) => {
      console.log(err);
    });
};

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");
  logoutButton.addEventListener("click", logout);
});

//function to update btn
function updateProduct(event) {
  const id = document.querySelector(".details-page .product-id").textContent;
  const imgInput = document.querySelector("#choose-file");
  const name = document.querySelector(".details-page .product-title").value;
  const price = document.querySelector(" .details-page .product-price").value;
  const description = document.querySelector(
    ".details-page .product-desc"
  ).value;
  const type = document.querySelector("#type").value;
  // Create a FormData object to handle the file upload
  const formData = new FormData();
  formData.append("id", id);
  formData.append("product-name", name);
  formData.append("product-price", price);
  formData.append("product-type", type);
  formData.append("product-desc", description);

  if (imgInput.files.length > 0) {
    formData.append("choose-file", imgInput.files[0]);
  }
  fetch("/admin/products", {
    // Ensure the URL matches the endpoint in your Node.js route
    method: "PUT", // Specify the HTTP method as PUT for updating
    body: formData, // Send the FormData object
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("There is something error");
      }
      return response.json(); // Expecting JSON response
    })
    .then((data) => {
      // console.log("Update Successful:", data);
      window.location.reload(); // Reload the page after successful update
    })
    .catch((err) => {
      console.error("Update Failed:", err);
    });
}

//function to update btn
function changeState(event) {
  const clickedElement = event.target;
  const product = clickedElement.closest('.product');
  const id = product.querySelector(".product-id").textContent; // Assuming product-id is a class
  let status;
  
  if (product.querySelector(".product-state").textContent.toLowerCase() === "available") {
    status = "Not Available";
  } else {
    status = "Available";
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You will change the state of this product!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, change it",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/admin/products", {
        method: "PUT",
        body: JSON.stringify({ id: id, status: status }), // Stringify the body for JSON
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Something went wrong!");
          }
          return response.json(); // Return the JSON data
        })
        .then((data) => {
          // Update the product state in the DOM
          product.querySelector(".product-state").textContent = status;
          product.querySelector(".product-state").classList.toggle("product-availabel");
          Swal.fire({
            title: "Changed status!",
            text: "The state changed successfully.",
            icon: "success",
          });
        })
        .catch((err) => {
          console.error("Update Failed:", err);
          Swal.fire({
            title: "Error!",
            text: "There was an error changing the status.",
            icon: "error",
          });
        });
    }
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
});
