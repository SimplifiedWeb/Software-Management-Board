let openConnections = indexedDB.open("storage", 5);
let db;

document.addEventListener("DOMContentLoaded", function () {
	//  THIS DETAIL TASK IS BEEN USED FOR EDITING OUR TASKS, BY DEFAULT DETAIL TASK SECTION WILL BE NONE, ONCE WE HAVE AN OPERATIONS THAT WE WANT US TO EDIT THEN WE'LL MAKE IT BLOCK.
	document.getElementById("detailTaskSection").style.display = "none";

	// THIS FUNCTION WILL SET OUR PROFILE DATA TO THE PROFILE SECTION, FETCHES DATA FROM THE LOCAL STORAGE.
	getProfileData();

	// THIS FUNCTION IS BEEN USED TO CHECK FOR THE VALIDITY OF A USER IT'S BEEN AUTHENTICATED OR NOT.
	checkAuthentication();

	// THIS CHECKS IS USED FOR CONDITIONAL FETCHING OF DATA.
	if (localStorage.getItem("profile_visibility")) {
		// THIS WILL SHOW THE PROFILE PAGE AND HIDE THE MAIN DASHBOARD PAGE IF THE PROFILE VISIBILITY IS TRUE.
		showProfile();

		// THIS WILL CHECK IF THE USER PROFILE DATA ALREADY HAS BEEN FETCHED AND STORED INSIDE THE LOCAL STORAGE SO IT WONT CALL THE DB FUNCTION OFTEN TO GET DATA. T
		if (JSON.parse(localStorage.getItem("checkForProfileStatus"))) {
			// THIS FUNCTION WILL SET OUR CURRENT PROFILE DATA TO THE PROFILE SECTION, FETCHES DATA FROM THE LOCAL STORAGE.
			getProfileData();
		} else {
			// THIS FUNCTION WILL RUN IF THE USER PROFILE DATA WILL NOT BEEN FOUND INSIDE OF THE LOCAL STORAGE IT FETCHED THE CURRENT USER DATA THAT CURRENTLY BE USING AND THEN STORED INSIDE OF THE LOCAL STORAGE.
			populateProfileDetails();
		}
	} else {
		// THIS FUNCTION WILL BE RUN IF THE PROFILE SECTION IS NOT BEEN OPEN.
		showDashBoard();
	}
});

// CHECKING FOR AUTHENTICATED OR NOT
function checkAuthentication() {
	let authData = JSON.parse(localStorage.getItem("auth"));

	// CHECKING THE VALIDITY OF A USER, ADDED THIS FEATURE INSIDE THE AUTH.JS INTO SESSION FUNCTION VALIDITY IS FOR 1 HOUR.
	if (!authData || new Date().getTime() >= authData.expirationTime) {
		console.log("Session is expired or not found");
		alert("Session is expired or not found");

		// IF THE USER VALIDITY IS BEEN EXCEEDS THEN IT REMOVE THE AUTH KEY FROM LOCAL STORAGE AND ADD A NEW ONE, ONCE HE LOGGED IN.
		localStorage.removeItem("auth");

		// REDIRECT TO THE LOGIN PAGE
		window.location.href = "/group%20project/src/Sign.html";
	} else {
		console.log("Session is valid");
	}
}

// MODAL FUNCTIONALITY
function openModal(operation) {
	//  I PASSED A STRING TO COMPARE WHICH OF THE MODAL HAS BEEN CLICKED BASED ON THAT WE PERFORM HIDE AND SHOW

	if (operation === "task-creation") {
		// THIS BOX IS A FUNCTION WHERE WE ADD OUR ITEMS INSIDE THE DASHBOARD THA MODAL CLASS NAME IS .box.
		document.querySelector(".search_issues_box").style.display = "none";

		document.querySelector(".modal-overlay").style.display = "none";

		document.querySelector(".box").style.display = "block";

		document.querySelector(".modal-overlay").style.display = "block";
	} else {
		document.querySelector(".box").style.display = "none";

		document.querySelector(".modal-overlay").style.display = "none";

		document.querySelector(".search_issues_box").style.display = "block";

		document.querySelector(".modal-overlay").style.display = "block";

		// THIS FUNCTION FETCHES ALL THE IN-PROGRESS DATA, AND SHOW US THE ALL THE LIST OF DATA ALONG WITH THE PRIORITIES
		inProgressData();
	}
}

function closeModal(operation) {
	//  I PASSED A STRING TO COMPARE WHICH OF THE MODAL HAS BEEN CLICKED BASED ON THAT WE PERFORM HIDE AND SHOW

	if (operation === "task-creation") {
		// THIS BOX IS A FUNCTION WHERE WE ADD OUR ITEMS INSIDE THE DASHBOARD THA MODAL CLASS NAME IS .box.
		document.querySelector(".box").style.display = "none";
		document.querySelector(".modal-overlay").style.display = "none";
	} else {
		// THIS IS A SEARCH ISSUES MODAL.
		document.querySelector(".search_issues_box").style.display = "none";

		document.querySelector(".modal-overlay").style.display = "none";
	}

	// FORCE TO CLOSE IF CONFLICTING HAPPENS
	document.querySelector(".search_issues_box").style.display = "none";
}

// MODAL ENDS

// INDEXED-DB CONFIGURATIONS AND TASK CONNECTIONS COMPLETED
function database_config() {
	openConnections.onupgradeneeded = (e) => {
		db = openConnections.result;

		// CREATED TO OBJECT STORE TASKS FOR ADDING ALL THE WORK RELATED STUFFS AND USERS FOR THEIR CREDENTIALS

		if (!db.objectStoreNames.contains("tasks")) {
			db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
		}

		if (!db.objectStoreNames.contains("users")) {
			db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
		}
	};

	openConnections.onsuccess = () => {
		console.log("Database successFully Connected");
		db = openConnections.result;

		// IF WE'RE AT THE HOME PAGE THEN WE CALL THIS FUNCTION FETCH DATA FOR US.
		if (
			window.location.pathname === "/group%20project/src/index.html" ||
			window.location.pathname === "/"
		) {
			fetchTask();
		}
	};

	openConnections.onerror = (e) => {
		console.log(" Database Error : ", e.target.error);
	};
}
database_config();

// TASKS FETCHING
function fetchTask() {
	let transaction = db.transaction(["tasks"], "readwrite");

	let store = transaction.objectStore("tasks");

	// GETTING ALL THE DATA FROM THE DB
	let request = store.getAll();

	request.onsuccess = (e) => {
		const tasks = e.target.result;
		if (tasks.length === 0) {
			const dummyDataAdded = localStorage.getItem("dummyDataAdded");

			if (!dummyDataAdded) {
				const dummyData = [
					// Backlog (4 items)
					{
						category: "backlog",
						id: 1,
						title: "Implement user authentication",
						summary:
							"Add functionality to allow users to sign in and manage their accounts",
						description:
							"Implement user authentication using JSON Web Tokens (JWT) and bcrypt for password hashing.",
						tags: "JavaScript, Authentication, Security",
					},
					{
						category: "backlog",
						id: 2,
						title: "Integrate payment gateway",
						summary:
							"Allow users to make payments through a secure payment gateway",
						description:
							"Integrate a popular payment gateway like Stripe or PayPal to enable users to make purchases within the application.",
						tags: "E-commerce, Payments",
					},

					// Development (4 items)
					{
						category: "development",
						id: 5,
						title: "Refactor user dashboard",
						summary:
							"Improve the user dashboard for better usability and performance",
						description:
							"Refactor the user dashboard component to improve performance, enhance responsiveness, and provide a more intuitive user experience.",
						tags: "React, Performance, UX",
					},
					{
						category: "development",
						id: 6,
						title: "Implement search functionality",
						summary:
							"Allow users to search for specific content within the application",
						description:
							"Implement a search feature that enables users to search for content based on keywords, categories, or other relevant criteria.",
						tags: "Search, Indexing, Elasticsearch",
					},

					// Progress (5 items)
					{
						category: "progress",
						id: 9,
						title: "Implement file upload",
						summary: "Allow users to upload files to the application",
						description:
							"Implement a secure and reliable file upload feature that supports various file types and sizes.",
						tags: "File Upload, Security",
						priority: "High",
					},
					{
						category: "progress",
						id: 10,
						title: "Optimize database queries",
						summary:
							"Improve application performance by optimizing database queries",
						description:
							"Analyze and optimize database queries to reduce unnecessary data fetching and improve overall application performance.",
						tags: "Database, Performance, Optimization",
						priority: "Medium",
					},
					{
						category: "progress",
						id: 11,
						title: "Enhance error handling",
						summary: "Improve error handling and logging mechanisms",
						description:
							"Implement better error handling strategies, including proper logging and user-friendly error messages, to improve application stability and debugging.",
						tags: "Error Handling, Logging, Debugging",
						priority: "Low",
					},

					// Done (5 items)
					{
						category: "done",
						id: 14,
						title: "Implement responsive design",
						summary:
							"Ensure the application is responsive across different devices",
						description:
							"Implement responsive design principles to ensure the application adapts and provides an optimal user experience across various devices and screen sizes.",
						tags: "Responsive Design, Mobile, Desktop",
					},
					{
						category: "done",
						id: 15,
						title: "Improve load times",
						summary:
							"Optimize application load times for better user experience",
						description:
							"Implement various performance optimization techniques, such as code splitting, lazy loading, and caching, to improve application load times.",
						tags: "Performance, Load Times, Optimization",
					},
				];
				// Add each dummy task individually to IndexedDB
				dummyData.forEach((task) => {
					let addRequest = store.add(task);

					addRequest.onsuccess = () => {
						console.log("Dummy task added:", task);
					};

					addRequest.onerror = (error) => {
						console.error("Error adding dummy task:", error);
					};
				});

				// Set flag in localStorage indicating dummy data has been added
				localStorage.setItem("dummyDataAdded", "true");

				// Render tasks
				renderTasks(dummyData);
			}
		} else {
			renderTasks(tasks);
		}
	};

	request.onerror = (e) => {
		console.log("Fetch Task : ", e.target.error);
	};
}

// USERS FETCHING
function fetchUser() {
	let transaction = db.transaction(["users"], "readonly");

	let storeUser = transaction.objectStore("users");

	// FETCHING ALL THE USERS DATA
	let request = storeUser.getAll();

	request.onsuccess = (e) => {
		let users = e.target.result;
		console.log(users);

		// RENDER USERS RENDERS ALL THE USERS THAT ARE PRESENT INSIDE OF DB.
		renderUsers(users);
	};

	request.onerror = (e) => {
		console.log("Fetch Users : ", e.target.error);
	};
}

// ADD TASKS TO DB
function addTask(task) {
	let transaction = db.transaction(["tasks"], "readwrite");

	let store = transaction.objectStore("tasks");

	let request = store.add(task);

	request.onsuccess = () => {
		alert("Added SuccessFully!!");
		console.log("Added SuccessFully!!");

		// THIS FETCH TASK FUNCTION FETCH ALL THE TASK FROM THE DB AND PASSED TO THE RENDER TASK FUNCTION TO RENDER DATA.
		fetchTask();
	};
	request.onerror = (e) => {
		console.log("Add Task To DB : ", e.target.error);
	};
}

// UPDATE TASKS TO DB
function updateTask(task) {
	let transaction = db.transaction(["tasks"], "readwrite");

	let storeUpdatedTask = transaction.objectStore("tasks");

	// THIS PUT METHOD WILL UPDATE THE DATA INSIDE OF DB
	let request = storeUpdatedTask.put(task);

	request.onsuccess = () => {
		alert("Updated SuccessFully!!");
		console.log("Updated SuccessFully!!");

		// THIS FETCH TASK FUNCTION FETCH ALL THE TASK FROM THE DB AND PASSED TO THE RENDER TASK FUNCTION TO RENDER DATA.
		fetchTask();
	};
	request.onerror = (e) => {
		console.log("Update Task To DB : ", e.target.error);
	};
}

// UPDATE USER LOGIN AND PASSWORD

// // DELETE TASKS TO DB
function deleteTask(id) {
	let transaction = db.transaction(["tasks"], "readwrite");

	let deleteTaskFromStore = transaction.objectStore("tasks");

	let request = deleteTaskFromStore.delete(id);

	request.onsuccess = () => {
		console.log("Deleted SuccessFully!!");

		// THIS FETCH TASK FUNCTION FETCH ALL THE TASK FROM THE DB AND PASSED TO THE RENDER TASK FUNCTION TO RENDER DATA.
		fetchTask();
	};
	request.onerror = (e) => {
		console.log("Delete Task To DB : ", e.target.error);
	};
}

// RENDER TASK
// THIS RENDER TASK FUNCTION WILL RENDER ALL OUR DATA,
// - ADD, UPDATE, DELETE FOR EACH OF THIS OPERATION THIS RENDER FUNCTION WILL GET CALLED AND REMOVE ALL THE EXISTING DATA AND RENDER THE NEWLY INCOMING DATA FROM THE ADD, UPDATE AND DELETE FUNCTIONS.

function renderTasks(tasks) {
	// THIS ARE THE FOUR CATEGORIES WE HAVE IN OUR DASHBOARD.
	if (tasks === []) {
		return;
	} else {
		const categories = ["backlog", "development", "progress", "done"];

		// LOOPING THROUGH EACH CATEGORY AND FINDING OUT WHICH TYPE OF CATEGORY DATA THE INCOMING DATA IS.
		categories.forEach((category) => {
			// DATA-CATEGORY IS AN ATTRIBUTE IT LOOK LIKE THIS IN HTML -> (data-category="backlog")
			// FOR EACH CATEGORY I USED THIS ATTRIBUTE TO DIFFERENTIATE WHERE TO PUT THIS INCOMING DATA IN ORGANIZED WAY, THROUGH THEIR RESPECTIVE CATEGORIES.

			const container = document.querySelector(
				`.board-banners[data-category="${category}"] .createdCard`
			);

			// USED THIS CHECK TO INSURE THAT IF THE CONTAINER IS NOT AVAILABLE FOR SOME REASON WE CAN SHOW THE NULL.
			container ? (container.innerHTML = "") : null;

			// THIS TASKS IS INCOMING FROM FETCH TASK FUNCTIONS WHEN WE DO OPERATION AND CHANGE SOMETHING IT WILL CALL THIS RENDER TASK FUNCTION AND PASS THE UPDATED VALUES AS AN ARGUMENT TO THIS RENDER TASK FUNCTION.

			// ADDING, UPDATING AND DELETING DATA WILL CALL THE FETCH TASK FUNCTION TO RE-GET ALL THE DATA FROM THE DB AND THEN FETCH TASK DATA PASS ALL THE DATA INSIDE THE RENDER TASK FUNCTION AS AN ARGUMENT.

			// THIS "tasks" CONTAINS ALL THE TASK THAT WE CREATED. AND BASED ON THE CATEGORY WHERE TO PUT WE USE FILTER.
			tasks
				.filter((task) => task.category === category)

				.forEach((task) => {
					let chips = document.createElement("div");
					chips.className = "chips";
					chips.dataset.id = task.id;

					// WHEN WE CLICK ANY ONE OF IT YOU WANT TO EDIT OR DELETE OPEN TASK DETAIL WILL SHOW US THE CLEAR DETAIL OF OUR TASKS WITH EDITING STUFFS.
					chips.onclick = () => openTaskDetail(task);

					chips.innerHTML = `
						<div class="top-bar">
							<span class="dot red"></span>
							<span class="dot yellow"></span>
							<span class="dot green"></span>
						</div>
						<div class="middle-bar">
							<h3>${task.title}</h3>
							<p class="summary">${task.summary}</p>
							<p class="description">${task.description}</p>
							<div class="tags">
							<span class="tag">${task.tags}</span>
							<span class="tag">${task.priority || ""}</span>
							</div>
						</div>
					`;

					container?.appendChild(chips);
				});
		});
	}
}
// RENDER USERS ON ADMIN UI
// function renderUsers(users) {
// 	let userList = document.querySelector(".user-lists");

// 	userList.innerHTML = "";

// 	users.forEach((user) => {
// 		let userItem = document.createElement("div");

// 		userItem.className = "user-item";
// 		userItem.dataset = user.id;

// 		userItem.innerHTML = `
// 		<span>${user.name}</span>
// 		<button onclick="editUser(${user.id})">Edit</button>
// 		<button onclick="deleteUser(${user.id})">Delete</button>
// 	  `;

// 		userList.appendChild(userItem);
// 	});
// }

// SEARCH ISSUES START

// THIS FUNCTION WILL FILTER ALL THE FIXES AND BUGS REPORTS FROM THE PROGRESS TABS.
function inProgressData() {
	// GETTING ALL THE DATA FROM THE DB
	let transaction = db.transaction(["tasks"], "readonly");
	let store = transaction.objectStore("tasks");
	let request = store.getAll();

	request.onsuccess = (e) => {
		// FILTERING OUT DATA BY PROGRESS CATEGORY
		const tasks = e.target.result;
		const progressTasks = tasks.filter((task) => task.category === "progress");

		// SEARCH ISSUES INPUT VALUES FROM INPUT.
		const search_query = document
			.getElementById("search_issues")
			.value.toLowerCase();

		// FOR SHOWING TOTAL SEARCH ISSUES
		const total = document.getElementById("search_issues_total");

		// THIS IS WHERE WE PUT ALL OF OUR SEARCH ISSUES AS A LIST.
		const searchResultsContainer = document.getElementById("searchResults");
		searchResultsContainer.innerHTML = "";

		total.innerText = progressTasks.length;

		// THIS IS WHERE WE SHOW THE PROGRESS LIST.
		if (search_query === "") {
			progressTasks.forEach((task, index) => {
				let resultItem = document.createElement("div");

				resultItem.className = "search-results-item";

				// GET PRIORITY BADGE FUNCTION WILL DYNAMICALLY ADD CLASS NAMES TO THE RESPECTIVE PRIORITIES CHECK DOWNWARD BASED ON THE PRIORITIES IT WILL ADD CLASS NAMES.
				resultItem.innerHTML = `Issue #${index + 1}: ${
					task.title
				} ${getPriorityBadge(task.priority)}`;

				// THIS OPEN_TASK_DETAIL FUNCTION WILL PUSH OUR CURRENT CLICKED DATA INSIDE THE DETAIL INFORMATION FORM THAT SHOWS ALL THE DETAILS OF THE SELECTED DATA.
				resultItem.onclick = () => openTaskDetail(task);

				searchResultsContainer.appendChild(resultItem);
			});
		} else {
			progressTasks.forEach((task, index) => {
				if (task.title.toLowerCase().includes(search_query)) {
					let resultItem = document.createElement("div");

					resultItem.className = "search-results-item";

					resultItem.innerHTML = `Issue #${index + 1}: ${
						task.title
					} ${getPriorityBadge(task.priority)}`;

					// THIS OPEN_TASK_DETAIL FUNCTION WILL PUSH OUR CURRENT CLICKED DATA INSIDE THE DETAIL INFORMATION FORM THAT SHOWS ALL THE DETAILS OF THE SELECTED DATA.
					resultItem.onclick = () => openTaskDetail(task);

					searchResultsContainer.appendChild(resultItem);
				}
			});
		}
	};

	request.onerror = (e) => {
		console.log("Fetch Backlog Tasks : ", e.target.error);
	};
}
function filterSearchResults() {
	inProgressData();
}

// THIS FUNCTION WILL DYNAMICALLY ADD THE CLASSES TO THE RESPECTIVE PRIORITIES.
function getPriorityBadge(priority) {
	let badgeClass;
	switch (priority) {
		case "High":
			badgeClass = "badge-high";
			break;
		case "Medium":
			badgeClass = "badge-medium";
			break;
		case "Low":
			badgeClass = "badge-low";
			break;
		default:
			badgeClass = "badge-default";
	}
	return `<span class="badge ${badgeClass}">${priority}</span>`;
}

if (document.getElementById("search_issues")) {
	document
		.getElementById("search_issues")
		.addEventListener("input", filterSearchResults);
}
// SEARCH ISSUES END

// SCROLLING AND SHOWING DETAIL CONTAINER
function moveToTheBottom() {
	let detailTask = document.getElementById("detailTaskSection");
	detailTask.style.display = "block";
	window.scrollTo({
		top: detailTask.offsetTop - 50,
		behavior: "smooth",
	});
}

// TASK DETAILS VIEW
function openTaskDetail(task) {
	moveToTheBottom();
	document.getElementById("footer").style.display = "block";
	// THIS WILL ADD THE VALUES INSIDE THE INPUT FIELD OF AN CURRENT SELECTED DATA TO BE EDITED AND VIEWED
	document.querySelector(".modal-overlay").style.display = "none";
	document.querySelector(".box").style.display = "none";
	document.querySelector(".search_issues_box").style.display = "none";
	console.log(task);
	document.getElementById("detailTaskSection").style.display = "block";
	document.querySelector(".detailContainer .category-title").innerText =
		task?.category;
	document.querySelector(".detailContainer .DetailShow .row .title").innerText =
		task?.title;
	document.querySelector(
		".detailContainer .DetailShow .row .summary"
	).innerText = task?.summary;
	document.querySelector(
		".detailContainer .DetailShow .row .description"
	).innerText = task.description;
	document.querySelector(".detailContainer .DetailShow .row .tag").innerText =
		task.tags;

	// THIS IS WHERE WE CAN SET OUR CURRENT DATA VALUES INSIDE THE EDITING INPUT FIELDS.
	document.querySelector(".form-group #category").value = task?.category;
	document.querySelector(".form-group #edit-title").value = task?.title;
	document.querySelector(".form-group #edit-summary").value = task?.summary;
	document.querySelector(".form-group #edit-description").value =
		task?.description;
	document.querySelector(".form-group #tag").value = task?.tags;
	document.querySelector("#taskId").value = task?.id;
	document.querySelector(".form-group #edit-priority").value = task.priority;

	// HERE WE CHECK FOR THE DATA IF IT FROM THE PROGRESS CATEGORY THEN WE CAN SHOW THE PRIORITY OPTIONS INSIDE OF THE DETAIL TASK EDITING FORM.
	if (
		document.querySelector(".form-group #prioritySection").value !== "" &&
		document.querySelector(".form-group #category").value === "progress"
	) {
		document.querySelector(".form-group #prioritySection").style.display =
			"block";
	}
}

// ADD
// THIS IS WHERE WE COLLECT OUR WHOLE DATA TO BE GET ADDED INSIDE THE CATEGORIES SECTIONS, WE WILL COLLECT DATA FROM CREATE TASK FORM AND THEN WE PUSH THIS DATA INSIDE THE ADD TASK FUNCTION AND THERE WE ADD DATA INSIDE THE DB AND CALL THE FETCH TASK FUNCTION TO FETCH AGAIN THE WHOLE NEW DATA.
if (document.querySelector(".submit-btn")) {
	document.querySelector(".submit-btn").addEventListener("click", function (e) {
		e.preventDefault();

		let task = {
			category: document.getElementById("toggle-category").value,
			title: document.getElementById("title").value,
			summary: document.getElementById("summary").value,
			description: document.getElementById("description").value,
			tags: document.getElementById("tags").value,
			priority: document.getElementById("priority").value,
		};
		if (task.category !== "" && task.title !== "") {
			addTask(task);
		} else {
			alert("Please Fill The Form ");
		}
		// ONCE WE ADD THE DATA HIDE THE CREATE TASK MODAL.
		document.querySelector(".box").style.display = "none";
		document.querySelector(".modal-overlay").style.display = "none";
	});
}

// THIS FUNCTION IS USED TO TOGGLE PRIORITY DROPDOWN, WE USED THIS INSIDE THE CREATE TASK FORM WHERE WE ADD OUR DATA, IF WE SELECT THE CATEGORY PROGRESS THEN WE WILL SHOW THIS DATA OTHERWISE HIDEEN.
function togglePriorityDropdown() {
	var category = document.getElementById("toggle-category").value;
	var prioritySection = document.getElementById("prioritySection");

	if (category === "progress") {
		prioritySection.style.display = "block";
	} else {
		prioritySection.style.display = "none";
	}
}

// UPDATE
// THIS FUNCTION IS FROM THE DETAIL TASK EDITING FORM CONTAINER WHERE WE EDIT OUR SELECTED TASK AND PUSH TO THE UPDATED TASK AND FROM THERE WE PUSH TO THE FETCH TASK.
if (document.querySelector(".detailContainer .submit-btn")) {
	document
		.querySelector(".detailContainer .submit-btn")
		.addEventListener("click", function (e) {
			e.preventDefault();

			// COLLECTING DATA FROM THE EDITING FORM.
			let task = {
				category: document.querySelector(".form-group #category").value,
				title: document.querySelector(".form-group #edit-title").value,
				summary: document.querySelector(".form-group #edit-summary").value,
				description: document.querySelector(".form-group #edit-description")
					.value,
				description: document.querySelector(".form-group #edit-description")
					.value,

				tags: document.querySelector(".form-group #tag").value,
				priority: document.getElementById("edit-priority").value,
				id: parseInt(document.querySelector("#taskId").value),
			};

			// TASK.ID WE TAKEN A HIDDEN INPUT FIELD AND THERE WE ASSIGN THE CURRENT SELECTED TASK ID JUST FOR TARGETING THAT SPECIFIC UPDATE TASK, BCZ IF THE TASK DON'T CONTAIN AN ID THEN THERE IS UPDATIONG WILL BE GOING TO WORK.
			if (task.id) {
				updateTask(task);
				window.scrollTo({ top: 0, behavior: "smooth" });
				document.getElementById("detailTaskSection").style.display = "none";
				document.getElementById("footer").style.display = "none";
			}
		});
}

// DELETE
// THIS DELETE FUNCTIONALITY WAS INSIDE THE DETAIL TASK CONTAINER WHERE WE SEE OUR DETAIL INFORMATION, SO WHEN WE CLICK ON THE PARTICULAR TASK FROM THE DASHBOARD MENU IT WILL REDIRECT TO DETAIL TASK AND WE CAN HAVE ACCESS TO THAT SELECTED TASK, SO TAKING THAT TASK ID WE PERFORMED A DELETE OPERATIONS.
if (document.querySelector(".detailContainer #delete")) {
	document
		.querySelector(".detailContainer #delete")
		.addEventListener("click", function (e) {
			e.preventDefault();

			// THIS TASK_ID IS A HIDDEN INPUT JUST FOR TAKING OUT THE CURRENT ID OF A TASK.
			let id = parseInt(document.querySelector("#taskId").value);

			if (id) {
				deleteTask(id);
			}

			// ONCE WE PERFORM OUR DELETE OPERATIONS WE REMOVE OR CEAR OUR VALUES FROM THE INPUT FIELDS AND MOVE AT THE TOP OF THE DASHBOARD MENU
			document.querySelector(".form-group #category").value = "";
			document.querySelector(".form-group #edit-title").value = "";
			document.querySelector(".form-group #edit-summary").value = "";
			document.querySelector(".form-group #edit-description").value = "";
			document.querySelector(".form-group #tag").value = "";
			document.querySelector(".form-group #edit-priority").value = "";
			document.querySelector("#taskId").value = null;

			document.querySelector(".detailContainer .category-title").innerText = "";
			document.querySelector(
				".detailContainer .DetailShow .row .title"
			).innerText = "";
			document.querySelector(
				".detailContainer .DetailShow .row .summary"
			).innerText = "";
			document.querySelector(
				".detailContainer .DetailShow .row .description"
			).innerText = "";
			document.querySelector(
				".detailContainer .DetailShow .row .tag"
			).innerText = "";

			// THIS IS THE CODE WHERE WE MOVE AT THE TOP AFTER WE PERFORM OUR DELETE OPERATIONS.
			window.scrollTo({ top: 0, behavior: "smooth" });
			document.getElementById("detailTaskSection").style.display = "none";
			document.getElementById("footer").style.display = "none";
		});
}

// SEARCH FUNCTIONALITY

if (document.getElementById("search")) {
	document.getElementById("search").addEventListener("input", function (e) {
		let search_query = e.target.value.toLowerCase();
		let transaction = db.transaction(["tasks"], "readonly");
		let store = transaction.objectStore("tasks");
		let request = store.getAll();

		request.onsuccess = (e) => {
			let allTasks = e.target.result;

			if (allTasks === []) return;

			let filteredTasks = allTasks.filter((task) =>
				task.title.toLowerCase().includes(search_query)
			);
			renderTasks(filteredTasks);
		};

		request.onerror = (e) => {
			console.error("Search tasks error: ", e.target.error);
		};
	});
}
function calculateMovingForm(data, currentScrolled) {
	data.style.top =
		currentScrolled +
		window.innerHeight / 2 -
		data.offsetHeight / 2 +
		200 +
		"px";
}

if (document.getElementById("search_issues_icon")) {
	document
		.getElementById("search_issues_icon")
		.addEventListener("click", function (e) {
			let data = document.getElementById("searchIssuesModal");

			let currentScrolled = window.scrollY;

			calculateMovingForm(data, currentScrolled);
		});
}

if (document.getElementById("create_task_icon")) {
	document
		.getElementById("create_task_icon")
		.addEventListener("click", function (e) {
			let data = document.querySelector(".box");

			let currentScrolled = window.scrollY;
			if (currentScrolled <= 50) {
				currentScrolled = 100;
			}

			calculateMovingForm(data, currentScrolled);
		});
}

// SHOW PROFILE SECTION AND HIDE DASHBOARD SECTION
function showProfile() {
	// WHEN WE ARE AT THE PROFILE SECTION THEN WE HIDE THE SIDEBAR CREATING TASK AND SEARCHING ISSUES FUNCTIONALITIES.
	document.querySelector(".main").style.display = "none";
	document.querySelector("#profileSection").style.display = "block";
	document.getElementById("search_issues_icon").style.display = "none";
	document.getElementById("create_task_icon").style.display = "none";
	document.getElementById("dashboard_icon").style.display = "block";
	document.getElementById("detailTaskSection").style.display = "none";

	let img = document.getElementById("slider-logo");
	img.style.marginLeft = "26px";

	// WE ADD A CHECK TO ENSURE WE RUN OUR PROFILE FUNCTIONALITY MULTIPLE TIMES.
	localStorage.setItem("profile_visibility", true);
}

// SHOWING DASHBOARD SECTION AND HIDE PROFILE SECTION
function showDashBoard() {
	// WHEN WE ARE AT THE DASHBOARD SECTION THEN WE HIDE THE SIDEBAR DASHBOARD FUNCTIONALITY AND PROFILE SECTION.
	document.querySelector(".main").style.display = "block";
	document.querySelector("#profileSection").style.display = "none";
	document.getElementById("search_issues_icon").style.display = "block";
	document.getElementById("create_task_icon").style.display = "block";
	document.getElementById("dashboard_icon").style.display = "none";

	let img = document.getElementById("slider-logo");
	console.log(img);
	img.style.marginLeft = "0px";

	// REMOVE THE CHECK ENSURING WE NOW AT THE DASHBOARD AND RUN ALL THE DASHBOARD FUNCTIONALITIES.
	localStorage.removeItem("profile_visibility");
}

// ADDING PROFILE PICTURES IN USERS CREDENTIALS
function populateProfileDetails(imgData) {
	// GETTING THE CURRENT USER BY USERNAME.
	let authData = JSON.parse(localStorage.getItem("auth"));
	if (authData) {
		let transaction = db?.transaction(["users"], "readwrite");
		let storeUsers = transaction?.objectStore("users");
		let request = storeUsers.getAll();
		request.onsuccess = (e) => {
			let data = e.target.result;
			// COMPARING THE USERNAME FROM LS AND DB
			let findUser = data.find((user) => user.username === authData.username);

			// CHECKING FOR EXISTENCE OF A USER INSIDE DB.
			if (findUser) {
				if (imgData !== undefined) {
					// THIS IMGDATA IS A 64BIT CODE GENERATED FROM FILE READER.
					let request = storeUsers.put({ ...findUser, image: imgData });
					request.onsuccess = () => {
						console.log("User Image updated successfully");
						alert("User Image updated succesfully");

						// ADDING INSIDE LS FOR FASTER ACCESSING USER PROFILE.
						localStorage.setItem(
							"user-profile",
							JSON.stringify({
								...findUser,
								image: imgData,
							})
						);

						// USED THIS CHECK FOR RUNNING THIS FUNCTION AND PERFORMING DB ACTIONS ONCE.
						localStorage.setItem("checkForProfileStatus", JSON.stringify(true));

						// SETTING UP OUR PROFILE DATA FROM LS TO THE PROFILE FIELDS.
						getProfileData();
					};

					request.onerror = (e) => {
						alert("Updation issues!!");
						console.log("Updation issues : ", e.target.error);
					};
				}
			}
		};
		request.onerror = (e) => {
			console.log("Getting all issues : ", e.target.error);
		};
	} else {
		console.error("No auth data found in local storage.");
	}
}

// THIS FUNCTION WHERE WE SET UP OUR PROFILE DATA INTO THE PROFILE FORM FIELD AND SETUP THE USER SELECTED IMAGE.
function getProfileData() {
	let user_profile_data = JSON.parse(localStorage.getItem("user-profile"));
	if (!user_profile_data) {
		console.error("No user profile data found in session storage.");
		return;
	}

	const profileUpload = document.querySelector(".profile-picture img");
	let { username, email, image } = user_profile_data;
	document.querySelector(".profile-details #username").value = username;
	document.querySelector(".profile-details #email").value = email;
	profileUpload.src = image;
}

// ADDING PHOTOS BY LOCAL SYSTEM
function handleLocalSystemImage() {
	const fileInput = document.getElementById("profilePictureInput");
	const profileUpload = document.querySelector(".profile-picture img");
	if (fileInput.files && fileInput.files[0]) {
		const reader = new FileReader();
		reader.onload = function (e) {
			const imgData = e.target.result;
			profileUpload.src = imgData;

			// HERE WE SEND OUR IMGDATA IN THE 64BIT FORM
			populateProfileDetails(imgData);
		};
		reader.readAsDataURL(fileInput.files[0]);
	}
}

// HANDLING EXTERNAL LINKS FOR IMAGES
function handleImageUpload() {
	const urlInput = document.getElementById("imageURLInput");
	const profileImage = document.getElementById("profileImage");
	if (urlInput.value) {
		profileImage.src = urlInput.value;

		// HERE WE SEND OUR IMGDATA IN THE LINK FORM
		populateProfileDetails(urlInput.value);
	}
}

if (document.getElementById("profilePictureInput")) {
	document
		.getElementById("profilePictureInput")
		.addEventListener("change", handleLocalSystemImage);
}

if (document.getElementById("imageURLInput")) {
	document
		.getElementById("imageURLInput")
		.addEventListener("change", handleImageUpload);
}

// Get the modal element
const modal = document.getElementById("modal");

// Get the close button element
const closeBtn = document.getElementsByClassName("close")[0];

// Check if the modal has been shown before
const modalShown = sessionStorage.getItem("modalShown");

// If the modal hasn't been shown before, show it
if (!modalShown) {
	modal.style.display = "block";

	// When the user clicks the close button, hide the modal and set sessionStorage
	closeBtn.onclick = function () {
		modal.style.display = "none";
		sessionStorage.setItem("modalShown", true);
	};

	// When the user clicks anywhere outside the modal, hide the modal and set sessionStorage
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
			sessionStorage.setItem("modalShown", true);
		}
	};
}

function openGuidePage() {
	window.open("/group%20project/src/Guide.html", "_blank");
}
