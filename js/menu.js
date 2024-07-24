let cartIcon = document.querySelector(".cart-icon");
let cartCloseBtn = document.querySelector(".cart-tap .close");
let body = document.querySelector("body");
const elem = document.querySelector("product-img123");
cartIcon.addEventListener("click", () => {
  body.classList.toggle("activeTabCart");
});
cartCloseBtn.addEventListener("click", () => {
  body.classList.toggle("activeTabCart");
});

// //function to add product to cart when click addtocart
let cartList = document.querySelector(".list-cart");

function addToCart(event) {
  const clickedElement = event.target;
  const productContainer = clickedElement.parentElement.parentElement;
  const productId = productContainer.querySelector(".product-id").textContent;
  const productName =
    productContainer.querySelector(".product-title").textContent;
  const productPrice = productContainer.querySelector(".price-x").textContent;

  // Check if the product is already in the cart
  let productInCart = Array.from(cartList.querySelectorAll(".product")).find(
    (product) => product.querySelector(".product-id").textContent === productId
  );

  if (productInCart) {
    // Increase the quantity of the existing product in the cart
    let quantityElement = productInCart.querySelector(".quantity .quan");
    quantityElement.textContent = parseInt(quantityElement.textContent) + 1;
  } else {
    // Add the new product to the cart
    const newProduct = document.createElement("div");
    newProduct.innerHTML = `
      <div class="product">
        <div class="product-id">${productId}</div>
        <h4>${productName}</h4>
        <div class="quantity">
          <i class="fa-solid fa-circle-minus" onclick="decreaseQuantity(event)"></i>
          <span class="quan">1</span>
          <i class="fa-solid fa-circle-plus" onclick="increaseQuantity(event)"></i>
        </div>
        <p><span>${productPrice}</span>₪</p>
        <i class="fa-solid fa-trash-can remove" onclick="deleteProduct(event)"></i>
      </div>
    `;
    cartList.appendChild(newProduct.firstElementChild);
  }

  // Add the product to the array in session storage
  addObject(productId, productName, productPrice, 1);
}

//function to add proudct from database to menu page
let hotDrinksContainer = document.querySelector(".hot-drinks .products");
let coldDrinksContainer = document.querySelector(".cold-drinks .products");
let foodContainer = document.querySelector(".food .products");
let dessertContainer = document.querySelector(".dessert .products");
function addProduct(
  productId,
  productImg,
  productName,
  productPrice,
  productDescription,
  productType
) {
  const newProduct = document.createElement("div");
  newProduct.innerHTML = `
  <div class="product">
       <div class="product-id">${productId}</div>
       <div class="product-img"><img src="${productImg}" alt="">
       </div>
       <div class="product-info">
           <p class="product-title">${productName}</p>
           <p class="product-description">${productDescription}.</p>
       </div>
       <div class="price">
           <p><span class="price-x">${productPrice}</span> ₪</p>
           <button class="atc" onclick="addToCart(event)">Add To Cart</button>
       </div>
   </div>
  `;
  if (productType == "hot-drinks") {
    hotDrinksContainer.appendChild(newProduct.firstElementChild);
  } else if (productType == "cold-drinks") {
    coldDrinksContainer.appendChild(newProduct.firstElementChild);
  } else if (productType == "food") {
    foodContainer.appendChild(newProduct.firstElementChild);
  } else {
    dessertContainer.appendChild(newProduct.firstElementChild);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Initialize products
  initializeProducts();
  // Step 1: Fetch product data and user data from the backend
  await fetch("/menu/api")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    })
    .then((data) => {
      // Step 2: Process products data
      data.products.forEach((product) => {
        let base64Image = arrayBufferToBase64(product.image.data.data);
        let imgSrc = base64Image;
        if (product.status == "Available") {
          addProduct(
            product._id,
            imgSrc,
            product.name,
            product.price,
            product.description,
            product.type
          );
        }
      });
      // Step 3: Check user login status if user data is available
      if (data.user) {
        const user = data.user;
        const loginIcon = document.getElementById("loginIc");
        loginIcon.removeAttribute("href");
        if (user.status === "admin") {
          loginIcon.href = "admin/dashboard";
        } else if (user.status === "user") {
          loginIcon.href = "user/dashboard";
        }
      }
    })
    .catch((error) => console.error("Error fetching data:", error));

  // Function to convert ArrayBuffer to Base64-encoded string
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return "data:image/jpeg;base64," + window.btoa(binary);
  }

  const loadingScreen = document.querySelector(".loader");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 700);
});

// Function to run on page load to initialize products
function initializeProducts(
  productId,
  productName,
  productQuantity,
  productPrice
) {
  const array = JSON.parse(sessionStorage.getItem("productsArray"));
  if (array) {
    array.forEach((product) => {
      const newProduct = document.createElement("div");
      newProduct.innerHTML = `
  <div class="product">
    <div class="product-id">${product.Id}</div>
    <h4>${product.name}</h4>
    <div class="quantity">
      <i class="fa-solid fa-circle-minus" onclick="decreaseQuantity(event)"></i>
      <span class="quan">${product.quan}</span>
      <i class="fa-solid fa-circle-plus" onclick="increaseQuantity(event)"></i>
    </div>
      <p><span>${product.price}</span>₪</p>
      <i class="fa-solid fa-trash-can remove" onclick="deleteProduct(event)"></i>
  </div>
`;
      cartList.appendChild(newProduct.firstElementChild);
    });
  }
  updateCartCounter();
}

//function to create array Products
function createArray() {
  if (!sessionStorage.getItem("productsArray")) {
    const array = [];
    sessionStorage.setItem("productsArray", JSON.stringify(array));
  }
}

// Call this function to initialize the array in local storage only if it doesn't already exist
createArray();

//function add object to array in session storage

// Function to add an object to the array or increase the quantity if it already exists
function addObject(productId, productName, productPrice, productQuantity = 1) {
  let array = JSON.parse(sessionStorage.getItem("productsArray"));
  let productExists = false;

  array = array.map((item) => {
    if (item.id === productId) {
      item.quan += productQuantity;
      productExists = true;
    }
    return item;
  });

  if (!productExists) {
    const newProduct = {
      id: productId,
      name: productName,
      price: productPrice,
      quan: productQuantity,
    };
    array.push(newProduct);
  }

  sessionStorage.setItem("productsArray", JSON.stringify(array));
}

// Function to add a product to the cart when the 'Add to Cart' button is clicked
function addToCart(event) {
  const clickedElement = event.target;
  const productContainer = clickedElement.parentElement.parentElement;
  const productId = productContainer.querySelector(".product-id").textContent;
  const productName =
    productContainer.querySelector(".product-title").textContent;
  const productPrice = productContainer.querySelector(".price-x").textContent;

  // Retrieve the array from session storage
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray")) || [];
  let productInArray = productsArray.find(
    (product) => product.id === productId
  );

  if (productInArray) {
    // Increase the quantity of the existing product in the session storage
    productInArray.quan += 1;
  } else {
    // Add the new product to the session storage
    const newProduct = {
      id: productId,
      name: productName,
      price: productPrice,
      quan: 1,
    };
    productsArray.push(newProduct);
  }

  // Update session storage
  sessionStorage.setItem("productsArray", JSON.stringify(productsArray));

  // Update the cart list in the DOM
  updateCartList();
  updateCartCounter();
}

// Function to update the cart list in the DOM based on session storage
function updateCartList() {
  cartList.innerHTML = ""; // Clear the current cart list
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray")) || [];
  productsArray.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.innerHTML = `
      <div class="product">
        <div class="product-id">${product.id}</div>
        <h4>${product.name}</h4>
        <div class="quantity">
          <i class="fa-solid fa-circle-minus" onclick="decreaseQuantity(event)"></i>
          <span class="quan">${product.quan}</span>
          <i class="fa-solid fa-circle-plus" onclick="increaseQuantity(event)"></i>
        </div>
        <p><span>${product.price}</span>₪</p>
        <i class="fa-solid fa-trash-can remove" onclick="deleteProduct(event)"></i>
      </div>
    `;
    cartList.appendChild(productElement.firstElementChild);
  });
  updateCartCounter();
}

// Call the updateCartList function on page load to initialize the cart
window.addEventListener("load", updateCartList);

// Example increase and decrease quantity functions
function increaseQuantity(event) {
  const productElement = event.target.closest(".product");
  const productId = productElement.querySelector(".product-id").textContent;
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray"));
  let product = productsArray.find((item) => item.id === productId);
  product.quan += 1;
  sessionStorage.setItem("productsArray", JSON.stringify(productsArray));
  updateCartList();
  updateCartCounter();
}

function decreaseQuantity(event) {
  const productElement = event.target.closest(".product");
  const productId = productElement.querySelector(".product-id").textContent;
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray"));
  let product = productsArray.find((item) => item.id === productId);
  if (product.quan > 1) {
    product.quan -= 1;
  } else {
    productsArray = productsArray.filter((item) => item.id !== productId);
  }
  sessionStorage.setItem("productsArray", JSON.stringify(productsArray));
  updateCartList();
  updateCartCounter();
}

function deleteProduct(event) {
  const productElement = event.target.closest(".product");
  const productId = productElement.querySelector(".product-id").textContent;
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray"));
  productsArray = productsArray.filter((item) => item.id !== productId);
  sessionStorage.setItem("productsArray", JSON.stringify(productsArray));
  updateCartList();
}

// Ensure the addToCart function is called when the 'Add to Cart' button is clicked
document.querySelectorAll(".add-to-cart-button").forEach((button) => {
  button.addEventListener("click", addToCart);
});

async function redirectToCheckout() {
  let productsArray = JSON.parse(sessionStorage.getItem("productsArray"));
  if (!productsArray || productsArray.length === 0) {
    Swal.fire({
      title: "",
      text: "Please add at least one product",
      icon: "warning",
    });
  } else if (!checkLoggedIn()) {
    Swal.fire({
      title: "",
      text: "Please login",
      icon: "warning",
    });
  } else {
    try {
      const response = await fetch("/checkout", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      } else {
        window.location.href = "/checkout";
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
      });
    }
  }
}

function checkLoggedIn() {
  let token = null;
  const value = document.cookie.split("jwt=");
  if (value.length >= 2) token = value.pop().split(";");
  return !!token;
}

// Add event listener to the "Check out" button
document
  .querySelector(".checkout")
  .addEventListener("click", redirectToCheckout);

//functiion to update cart counter number
function updateCartCounter() {
  const cartCounter = document.querySelector(".cart-counter");
  cartCounter.textContent = JSON.parse(
    sessionStorage.getItem("productsArray")
  ).length;
}
