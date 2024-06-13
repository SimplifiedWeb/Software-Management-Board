// LOGIN AND REGISTER TARGETS.
if (document.getElementById("register-btn")) {
	document.getElementById("register-btn").addEventListener("click", register);
}
if (document.getElementById("login-btn")) {
	document.getElementById("login-btn").addEventListener("click", login);
}

// TOGGLING FORMS STARTS ----
document.addEventListener("DOMContentLoaded", function () {
	let forms = document.querySelector(".forms");
	let signupLink = document.querySelector(".signup-link");
	let loginLink = document.querySelector(".login-link");

	// CHECKING SIGNUP EXIST
	if (signupLink) {
		signupLink.addEventListener("click", function (e) {
			e.preventDefault();
			forms.classList.add("show-signup");
		});
	}

	// CHECKING LOGIN EXIST
	if (loginLink) {
		loginLink.addEventListener("click", function (e) {
			e.preventDefault();
			forms.classList.remove("show-signup");
		});
	}
});
// TOGGLING FORMS ENDS ----

// SETTING SESSION FOR VALIDITY OF USER AUTHENTICATION.
function setSession(user) {
	// ADDING USERNAME FOR COMPARING AND USING FOR FUTURE PROFILE SECTION USE CASES.
	let { username } = user;

	// ADDING A 1 HOUR VALIDITY TIME LINE AND STORING INSIDE LS FOR FUTURE USE CASES.
	let expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour
	localStorage.setItem("auth", JSON.stringify({ expirationTime, username }));
}

// CHECKING SESSION VALIDITY, IF NOT REDIRECTING TO LOGIN PAGE.
function checkSession() {
	let authData = JSON.parse(localStorage.getItem("auth"));

	// CHECKING THE CURRENT TIME FROM USER LOGGED IN TIME.
	if (!authData || new Date().getTime() >= authData.expirationTime) {
		console.log("Session is expired or not found");
		localStorage.removeItem("auth");
		window.location.href = "/group%20project/src/Sign.html";
	} else {
		console.log("Session is valid");
	}
}

// REGISTER HANDLING STARTS -----
function register(e) {
	e.preventDefault();

	// TAKING ALL THE INPUT FIELDS VALUES FROM THE REGISTER FORMS
	let username = document.getElementById("signup-username").value;
	let email = document.getElementById("signup-email").value;
	let password = document.getElementById("signup-password").value;
	let confirmPassword = document.getElementById("signup-c-password").value;

	// CHECKING FOR USERNAME AND EMAIL
	if (!username.length > 3 || !email.includes("@")) {
		return alert("fill the fields properly!!");
	}

	// CHECKING FOR PASSWORD LENGTH
	if (password.length < 3) return alert("Short Password length");

	// CHECKING FOR CONFIRM PASSWORD
	if (password !== confirmPassword) {
		alert("Passwords do not match");
		return;
	}

	// USES CRYPTO_JS CHECKOUT THE SIGN.HTML PAGE FOR CDN LINK
	let hash = CryptoJS.SHA256(password).toString();

	// ADDING INSIDE DB
	let transaction = db.transaction(["users"], "readwrite");
	let usersObjectStore = transaction.objectStore("users");

	// ADD METHOD ADDS DATA INSIDE DB.
	let request = usersObjectStore.add({ username, email, password: hash });

	request.onsuccess = () => {
		console.log("User registered successfully");
		alert("User registration success!!");
		window.location.href = "/group%20project/src/Sign.html";
	};

	request.onerror = () => {
		console.error("Error registering user:", request.error);
	};
}
// REGISTER HANDLING ENDS -----

// LOGIN HANDLING STARTS ----
function login(e) {
	e.preventDefault();

	// TAKING OUT VALUES FROM LOGIN FORM
	let username = document.getElementById("login-username").value;
	let password = document.getElementById("login-password").value;

	if (username.length === 0 || password.length === 0) {
		return alert("Fill the fields");
	}

	// CHECKING USERNAME LENGTH
	if (!username.length > 3) {
		return alert("Incorrect username!!");
	}

	// CHECKING PASSWORD LENGTH
	if (password.length < 3) return alert("Incorrect Password length");

	// THIS FUNCTION AUTHENTICATE FROM DB.
	authenticateUsers(username, password);

	checkSession();
}

function authenticateUsers(username, password) {
	// CHECKING EXISTENCE OF A USERNAME AND PASSWORD INSIDE DB.
	let transaction = db.transaction(["users"], "readonly");
	let storeUsers = transaction.objectStore("users");
	let request = storeUsers.getAll();

	// FOR COMPARING PASSWORD WE HASHED AGAIN THE SAME PASSWORD TO MATCH IT THEY ARE EQUAL OR NOT.
	let hash = CryptoJS.SHA256(password).toString();

	request.onsuccess = (e) => {
		// TAKING OUT ALL THE USERS INSIDE DB
		let users = e.target.result;

		// FINDING THE USER
		let user = users.find(
			(u) =>
				(u.username === username || u.email === username) && u.password === hash
		);

		if (user) {
			console.log("User authenticated successfully");

			// ADD A SESSION WHEN USER AUTHENTICATED AND ADD INSIDE OF THE LS
			setSession(user);

			// REDIRECT TO THE DASHBOARD
			window.location.href = "/group%20project/src/index.html";
		} else {
			console.error("Invalid username or password");
			alert("Password Incorrect");
		}
	};

	request.onerror = (e) => {
		console.log("Error fetching users:", e.target.error);
	};
}
// LOGIN HANDLING ENDS ----

// HANDLING LOGOUT
function logout() {
	// REMOVING THE LS WILL TRIGGER A DOMCONTENTLOAD EVENT AND CHECKS FOR LS IF NOT FOUND REDIRECT TO THE LOGIN PAGE.
	localStorage.removeItem("auth");
	window.location.href = "/group%20project/src/Sign.html";
}

// FORGOT PASSWORD FUNCTIONALITY
function forgotPassword() {
	// Show the forgot password modal
	document.getElementById("forgotPasswordModal").style.display = "block";
}

// THIS STATE IS USE FOR RESET_PASSWORD PURPOSES.
let correctEmailForResetPass = null;

function resetPassword(data) {
	// TAKING OUT VALUE AND GETTING ALL THE DATA OF A USERS FROM DB.
	const email = document.getElementById("forgotPasswordEmail").value;
	let transaction = db.transaction(["users"], "readwrite");
	let storeUsers = transaction.objectStore("users");
	let request = storeUsers.getAll();

	request.onsuccess = (e) => {
		let allUsers = e.target.result;

		// COMPARING THAT EMAIL
		let user = allUsers.find((user) => user.email === email);

		if (user) {
			// ADDING NEW PASSWORD
			if (data !== undefined && data !== "") {
				user.password = data;

				// PUT METHOD WILL UPDATE THE EXISTING DATA.
				storeUsers.put(user);
				correctEmailForResetPass = null;
				return;
			}
			// Hide the forgot password modal
			document.getElementById("forgotPasswordModal").style.display = "none";
			correctEmailForResetPass = email;
			// Show the password reset section
			if (document.getElementById("passwordResetSection")) {
				document.getElementById("passwordResetSection").style.display = "block";
			}
		} else {
			// Display an error message if the email doesn't exist
			alert("Email address not found. Please enter a valid email address.");
		}
	};

	request.onerror = (e) => {
		console.error("Email checking error: ", e.target.error);
	};
}

function updatePassword() {
	console.log(correctEmailForResetPass);
	// Retrieve the new password and confirm password
	const newPassword = document.getElementById("newPassword").value;
	const confirmPassword = document.getElementById("confirmPassword").value;

	// Validate if the passwords match
	if (newPassword !== confirmPassword) {
		alert("Passwords do not match. Please try again.");
		return;
	}

	// Hash the new password
	const hashedPassword = CryptoJS.SHA256(newPassword).toString();

	// Update the password in the database
	resetPassword(hashedPassword);

	// Show a success message
	alert("Password updated successfully!");

	// Redirect the user to the login page
	window.location.href = "/group%20project/src/Sign.html";
}

function handleUpdateProfile(e) {
	e.preventDefault();
	let profile_update_username = document.querySelector(
		"#profileForm #username"
	).value; // Get the value of the input
	let profile_update_email = document.querySelector(
		"#profileForm #email"
	).value; // Get the value of the input

	if (profile_update_email !== "" || profile_update_username !== "") {
		updateUser(profile_update_username, profile_update_email);
	}

	document.getElementById("profileForm").submit(); // Submit the form
}

function updateUser(updatedUsername, updatedEmail) {
	let transaction = db.transaction(["users"], "readwrite");
	let store = transaction.objectStore("users");

	let { email } = JSON.parse(localStorage.getItem("user-profile"));

	let request = store.index("email").get(email);

	request.onsuccess = (e) => {
		let user = e.target.result;

		if (user) {
			// Update the user's properties
			user.username = updatedUsername;
			user.email = updatedEmail;

			// Put the updated user back into the database
			let updateRequest = store.put(user);

			updateRequest.onsuccess = () => {
				alert("User updated successfully!");
				console.log("User updated successfully!");
			};

			updateRequest.onerror = (e) => {
				console.log("Error updating user: ", e.target.error);
			};
		} else {
			console.log("User not found!");
		}
	};

	request.onerror = (e) => {
		console.log("Error fetching user: ", e.target.error);
	};
}

document
	.getElementById("profileForm")
	.addEventListener("submit", function (event) {
		event.preventDefault();
		document.getElementById("confirmationModal").style.display = "block";
	});

document.getElementById("confirmButton").addEventListener("click", function () {
	document.getElementById("confirmationModal").style.display = "none";
	handleUpdateProfile(event);
});

document.getElementById("cancelButton").addEventListener("click", function () {
	document.getElementById("confirmationModal").style.display = "none";
});
