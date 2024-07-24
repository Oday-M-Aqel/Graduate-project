function updateName(name) {
    const words = name.split(" ");
    const firstName = words[0];
    const nameSpan = document.querySelector(".header .user-name .name");
    nameSpan.textContent = firstName;
  }