const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
let uppass = [];
let inpass = [];
let counter = 0;

// Global variables to track patterns
let selectedPattern = {
    signup: [],
    signin: []
};

// Modified pattern selection handler
function selectPattern(element, formType) {
    const patternId = element.id;
    const patternArray = selectedPattern[formType];
    const hiddenField = document.getElementById(`${formType}Pattern`);
    const image = element.querySelector('img');

    // Toggle selection
    const index = patternArray.indexOf(patternId);
    if (index > -1) {
        patternArray.splice(index, 1);
        element.classList.remove('selected');
        if (image) image.classList.remove('clicked');
    } else {
        patternArray.push(patternId);
        element.classList.add('selected');
        if (image) image.classList.add('clicked');
    }

    // Update hidden field
    hiddenField.value = JSON.stringify(patternArray);
    console.log(`${formType} pattern:`, patternArray);
}

// UI Toggle Functions
signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// Pattern Selection Functions
function upimg(element) {
    const Image = element.querySelector('img');
    if (!Image) return;

    if (Image.classList.contains('clicked')) {
        Image.classList.remove('clicked');
        const index = uppass.indexOf(element.id);
        if (index > -1) {
            uppass.splice(index, 1);
            counter--;
        }
    } else {
        Image.classList.add('clicked');
        uppass.push(element.id);
        counter++;
    }
}

function inimg(element) {
    const Image = element.querySelector('img');
    if (!Image) return;

    if (Image.classList.contains('clicked')) {
        Image.classList.remove('clicked');
        const index = inpass.indexOf(element.id);
        if (index > -1) {
            inpass.splice(index, 1);
        }
    } else {
        Image.classList.add('clicked');
        inpass.push(element.id);
    }
}

// Form Validation and Submission
// Signup form handler
document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("upmail").value;
    const pattern = selectedPattern.signup;
    
    if (pattern.length === 0) {
        alert("Please select a pattern");
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pattern })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Signup failed');
        
        alert("Account created successfully!");
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.message);
    }
});

// Similar update for signin form
// API Functions
async function signup() {
    const email = document.getElementById('upmail').value;
    const pattern = uppass;

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                pattern 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        alert("Account created successfully!");
        console.log("User created:", data.user);
        // Reset form after successful signup
        uppass = [];
        counter = 0;
        document.getElementById("myForm").reset();
        document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
    } catch (error) {
        console.error("Signup Error:", error);
        alert(error.message || "Signup failed. Please try again.");
    }
}

async function signin() {
    const email = document.getElementById('inmail').value;
    const pattern = selectedPattern.signin; // Use the new pattern storage
    
    if (!email) {
        alert("Please enter your email");
        return;
    }

    if (pattern.length === 0) {
        alert("Please select your pattern");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/signin', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                pattern 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        alert("Login successful!");
        sessionStorage.setItem('userEmail', email);
        window.location.href = "home.html";
        NewTab();
    } catch (error) {
        console.error("Login Error:", error);
        alert(error.message || "Login failed. Please try again.");
        sendMail3();
    }
}

// Email and Navigation Functions
const templateParams = {
    to_name: 'User',
    from_name: 'Rahul',
    message: 'Please try again!'
};

function sendMail3() {
    emailjs.send('service_ktz39ao', 'template_m1h3m8f', templateParams)
        .then(function(res) {
            alert("Wrong pattern entered. Check your email for assistance.");
        })
        .catch(error => {
            console.error("Email Error:", error);
            alert("Failed to send email notification.");
        });
}

function sendMail2() {
    emailjs.send('service_ktz39ao', 'template_m1h3m8f', templateParams)
        .then(function(res) {
            alert("Password reset email sent successfully");
        })
        .catch(error => {
            console.error("Email Error:", error);
            alert("Failed to send password reset email.");
        });
}

function NewTab() {
    window.open("home.html", "_blank");
}