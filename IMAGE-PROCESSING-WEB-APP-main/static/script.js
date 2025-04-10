document.addEventListener("DOMContentLoaded", function () {
    // Register Form
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent page reload

            let email = document.getElementById("signupEmail").value.trim();
            let password = document.getElementById("signupPassword").value.trim();
            let confirmPassword = document.getElementById("confirmPassword").value.trim();
            let signupButton = signupForm.querySelector(".button");

            if (!email || !password || !confirmPassword) {
                alert("All fields are required!");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            signupButton.disabled = true; // Disable button to prevent multiple clicks
            signupButton.value = "Registering...";

            try {
                let response = await fetch("/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                let data = await response.json();
                alert(data.message);

                if (data.status === "success") {
                    window.location.href = "/"; // Redirect to login page
                }
            } catch (error) {
                alert("Error connecting to the server. Please try again.");
            }

            signupButton.disabled = false; // Re-enable button
            signupButton.value = "Signup";
        });
    }

    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent page reload

            let email = document.getElementById("loginEmail").value.trim();
            let password = document.getElementById("loginPassword").value.trim();
            let loginButton = loginForm.querySelector(".button");

            if (!email || !password) {
                alert("Please enter email and password!");
                return;
            }

            loginButton.disabled = true; // Disable button to prevent multiple clicks
            loginButton.value = "Logging in...";

            try {
                let response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                let data = await response.json();
                alert(data.message);

                if (data.status === "success") {
                    window.location.href = data.redirect; // Redirect to index.html
                }
            } catch (error) {
                alert("Error connecting to the server. Please try again.");
            }

            loginButton.disabled = false; // Re-enable button
            loginButton.value = "Login";
        });
    }
    // ==========================
    // LOGOUT FUNCTIONALITY
    // ==========================
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            window.location.href = "/logout";
        });
    }

    const fileInput = document.querySelector(".file-input"),
filterOptions = document.querySelectorAll(".filter button"),
filterName = document.querySelector(".filter-info .name"),
filterValue = document.querySelector(".filter-info .value"),
filterSlider = document.querySelector(".slider input"),
rotateOptions = document.querySelectorAll(".rotate button"),
previewImg = document.querySelector(".preview-img img"),
resetFilterBtn = document.querySelector(".reset-filter"),
chooseImgBtn = document.querySelector(".choose-img"),
saveImgBtn = document.querySelector(".save-img");

let brightness = "100", saturation = "100", inversion = "0", grayscale = "0";
let rotate = 0, flipHorizontal = 1, flipVertical = 1;

const loadImage = () => {
    let file = fileInput.files[0];
    if(!file) return;
    previewImg.src = URL.createObjectURL(file);
    previewImg.onload = () => {
        resetFilterBtn.click();
        document.querySelector(".container").classList.remove("disable");
    };
}

const applyFilter = () => {
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
}

filterOptions.forEach(option => {
    option.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  // Optional chaining
        option.classList.add("active");
        filterName.innerText = option.innerText;

        if(option.id === "brightness") {
            filterSlider.max = "200";
            filterSlider.value = brightness;
            filterValue.innerText = `${brightness}%`;
        } else if(option.id === "saturation") {
            filterSlider.max = "200";
            filterSlider.value = saturation;
            filterValue.innerText = `${saturation}%`;
        } else if(option.id === "inversion") {
            filterSlider.max = "100";
            filterSlider.value = inversion;
            filterValue.innerText = `${inversion}%`;
        } else {
            filterSlider.max = "100";
            filterSlider.value = grayscale;
            filterValue.innerText = `${grayscale}%`;
        }
    });
});

const updateFilter = () => {
    filterValue.innerText = `${filterSlider.value}%`;
    const selectedFilter = document.querySelector(".filter .active");

    if(selectedFilter.id === "brightness") {
        brightness = filterSlider.value;
    } else if(selectedFilter.id === "saturation") {
        saturation = filterSlider.value;
    } else if(selectedFilter.id === "inversion") {
        inversion = filterSlider.value;
    } else {
        grayscale = filterSlider.value;
    }
    applyFilter();
}

rotateOptions.forEach(option => {
    option.addEventListener("click", () => {
        if(option.id === "left") {
            rotate -= 90;
        } else if(option.id === "right") {
            rotate += 90;
        } else if(option.id === "horizontal") {
            flipHorizontal = flipHorizontal === 1 ? -1 : 1;
        } else {
            flipVertical = flipVertical === 1 ? -1 : 1;
        }
        applyFilter();
    });
});

const resetFilter = () => {
    brightness = "100"; saturation = "100"; inversion = "0"; grayscale = "0";
    rotate = 0; flipHorizontal = 1; flipVertical = 1;
    filterOptions[0]?.click();
    applyFilter();
}

const saveImage = () => {
    if (!previewImg.complete || previewImg.naturalWidth === 0) {
        alert("Please select an image first!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;
    
    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if(rotate !== 0) {
        ctx.rotate(rotate * Math.PI / 180);
    }
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    
    const link = document.createElement("a");
    link.download = "image.jpg";
    link.href = canvas.toDataURL();
    link.click();
}

filterSlider.addEventListener("input", updateFilter);
resetFilterBtn.addEventListener("click", resetFilter);
saveImgBtn.addEventListener("click", saveImage);
fileInput.addEventListener("change", loadImage);
chooseImgBtn.addEventListener("click", () => fileInput.click());
});


// Edites wale hau

let originalImageData = null; // Store original image

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.querySelector(".file-input");
    const previewImg = document.getElementById("previewImg");
    const chooseImgBtn = document.querySelector(".choose-img");

    chooseImgBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function (event) {
        let file = event.target.files[0];
        let reader = new FileReader();

        reader.onload = function (e) {
            previewImg.src = e.target.result;
            originalImageData = e.target.result; // Store original image
        };

        reader.readAsDataURL(file);
    });
});

function applyEffects() {
    let selectedEffects = [];
    document.querySelectorAll(".options input:checked").forEach((checkbox) => {
        selectedEffects.push(checkbox.value);
    });

    if (selectedEffects.length === 0) {
        alert("Please select at least one effect.");
        return;
    }

    let imageData = previewImg.src;

    fetch("/process_image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, effects: selectedEffects })
    })
    .then(response => response.json())
    .then(data => {
        previewImg.src = data.processed_image;
    })
    .catch(error => alert("Error processing image!"));
}

function resetImage() {
    if (originalImageData) {
        previewImg.src = originalImageData;
    } else {
        alert("No image uploaded yet.");
    }
}

function downloadImage() {
    let link = document.createElement("a");
    link.download = "processed_image.png";
    link.href = previewImg.src;
    link.click();
}
