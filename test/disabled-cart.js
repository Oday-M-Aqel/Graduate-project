let linkIcon = document.querySelector(".burger-icon");
let linkList = document.querySelector("ul");
linkIcon.addEventListener("click", function () {
  if (linkIcon.classList.contains("clicked")) {
    linkList.style.display = "none";
    linkIcon.classList.remove("clicked");
  } else {
    linkList.style.display = "block";
    linkIcon.classList.add("clicked");
  }
});

/* home links list */
let link = document.querySelectorAll(".links li");
link.forEach((element) => {
  if (window.innerWidth <= 800) {
    element.addEventListener("click", function () {
      if (linkIcon.classList.contains("clicked")) {
        linkList.style.display = "none";
        linkIcon.classList.remove("clicked");
      } else {
        linkList.style.display = "block";
        linkIcon.classList.add("clicked");
      }
    });
  }
});

/* remove product button start*/

let removeBtn = document.querySelectorAll(".cart .products button");
removeBtn.forEach((element) => {
  element.addEventListener("click", function () {
    element.parentElement.parentElement.style.opacity = "0";
    setTimeout(() => {
      element.parentElement.parentElement.remove();
    }, 300);
  });
});
/* remove product button end */

/* loading */
let loading = document.querySelector(".loader");
window.addEventListener("load", function () {
  loading.style.display = "none";
});
/* loading end */
