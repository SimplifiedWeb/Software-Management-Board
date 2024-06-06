document.addEventListener("DOMContentLoaded", function () {
	const forms = document.querySelector(".forms");
	const links = document.querySelectorAll(".link");

	links.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			forms.classList.toggle("show-signup");
		});
	});
});
