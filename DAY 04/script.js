/* =========================================================
   GADA TOURS & TRAVELS
   JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    const bookingTabs = document.querySelectorAll(".booking-tab");

    const flightBox = document.getElementById("flightBox");
    const serviceMessage = document.getElementById("serviceMessage");

    const serviceIcon = document.getElementById("serviceIcon");
    const serviceTitle = document.getElementById("serviceTitle");
    const serviceText = document.getElementById("serviceText");

    const swapBtn = document.getElementById("swapBtn");

    const fromCity = document.getElementById("fromCity");
    const toCity = document.getElementById("toCity");

    const departureDate = document.getElementById("departureDate");
    const returnDate = document.getElementById("returnDate");

    const flightSearch = document.getElementById("flightSearch");

    const destinationFilters =
        document.querySelectorAll(".destination-filter");

    const destinationCards =
        document.querySelectorAll(".destination-card");

    const faqQuestions =
        document.querySelectorAll(".faq-question");

    const contactForm =
        document.getElementById("contactForm");

    const formSuccess =
        document.getElementById("formSuccess");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const year =
        document.getElementById("year");

    const loginBtn =
        document.getElementById("loginBtn");


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    year.textContent = new Date().getFullYear();


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("open");

        menuToggle.textContent =
            navMenu.classList.contains("open")
                ? "✕"
                : "☰";

    });


    document.querySelectorAll(".nav-menu a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("open");

            menuToggle.textContent = "☰";

        });

    });


    /* =====================================================
       BOOKING TABS
    ===================================================== */

    const serviceData = {

        hotels: {
            icon: "🏨",
            title: "Find your perfect stay",
            text: "Search and discover hotels, resorts and stays for your next trip."
        },

        holidays: {
            icon: "🏖️",
            title: "Plan your dream holiday",
            text: "Explore domestic and international holiday packages."
        },

        trains: {
            icon: "🚆",
            title: "Travel by train",
            text: "Plan comfortable train journeys across popular routes."
        },

        buses: {
            icon: "🚌",
            title: "Book your bus journey",
            text: "Discover convenient intercity and interstate bus travel."
        },

        cabs: {
            icon: "🚕",
            title: "Book a cab",
            text: "Arrange airport transfers and local travel with ease."
        }

    };


    bookingTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            bookingTabs.forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            const selectedTab =
                tab.dataset.tab;

            if (selectedTab === "flights") {

                flightBox.style.display = "block";
                serviceMessage.classList.remove("active");

                return;
            }

            const data =
                serviceData[selectedTab];

            serviceIcon.textContent =
                data.icon;

            serviceTitle.textContent =
                data.title;

            serviceText.textContent =
                data.text;

            flightBox.style.display = "none";

            serviceMessage.classList.add("active");

        });

    });


    /* =====================================================
       SWAP CITIES
    ===================================================== */

    swapBtn.addEventListener("click", () => {

        const temporary =
            fromCity.value;

        fromCity.value =
            toCity.value;

        toCity.value =
            temporary;

    });


    /* =====================================================
       DATE SETUP
    ===================================================== */

    const today =
        new Date().toISOString().split("T")[0];

    departureDate.min = today;
    returnDate.min = today;


    departureDate.addEventListener("change", () => {

        returnDate.min =
            departureDate.value;

        if (
            returnDate.value &&
            returnDate.value < departureDate.value
        ) {

            returnDate.value = "";

        }

    });


    /* =====================================================
       FLIGHT SEARCH
    ===================================================== */

    flightSearch.addEventListener("click", () => {

        const from =
            fromCity.value.trim();

        const to =
            toCity.value.trim();

        const departure =
            departureDate.value;


        if (!from) {

            showToast(
                "Please enter your departure city."
            );

            fromCity.focus();

            return;
        }


        if (!to) {

            showToast(
                "Please enter your destination."
            );

            toCity.focus();

            return;
        }


        if (!departure) {

            showToast(
                "Please select a departure date."
            );

            departureDate.focus();

            return;
        }


        if (
            from.toLowerCase() ===
            to.toLowerCase()
        ) {

            showToast(
                "Departure and destination cannot be the same."
            );

            return;
        }


        showToast(
            `Searching flights from ${from} to ${to}...`
        );

    });


    /* =====================================================
       DESTINATION FILTER
    ===================================================== */

    destinationFilters.forEach(filter => {

        filter.addEventListener("click", () => {

            destinationFilters.forEach(button => {
                button.classList.remove("active");
            });

            filter.classList.add("active");

            const category =
                filter.dataset.filter;


            destinationCards.forEach(card => {

                const cardCategory =
                    card.dataset.category;

                if (
                    category === "all" ||
                    cardCategory === category
                ) {

                    card.style.display = "block";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });


    /* =====================================================
       FAQ ACCORDION
    ===================================================== */

    faqQuestions.forEach(question => {

        question.addEventListener("click", () => {

            const currentItem =
                question.parentElement;


            document
                .querySelectorAll(".faq-item")
                .forEach(item => {

                    if (item !== currentItem) {
                        item.classList.remove("open");
                    }

                });


            currentItem.classList.toggle("open");

        });

    });


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    contactForm.addEventListener("submit", event => {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const destination =
            document.getElementById("destination").value.trim();


        if (
            !name ||
            !email ||
            !destination
        ) {

            showToast(
                "Please complete all required fields."
            );

            return;
        }


        formSuccess.classList.add("show");


        contactForm.reset();


        showToast(
            "Travel request submitted successfully!"
        );


        setTimeout(() => {

            formSuccess.classList.remove("show");

        }, 5000);

    });


    /* =====================================================
       LOGIN BUTTON
    ===================================================== */

    loginBtn.addEventListener("click", () => {

        showToast(
            "Login functionality can be connected to a backend later."
        );

    });


    /* =====================================================
       SERVICE SEARCH
    ===================================================== */

    const serviceSearch =
        document.getElementById("serviceSearch");

    serviceSearch.addEventListener("click", () => {

        showToast(
            "This service search is ready for API integration."
        );

    });


    /* =====================================================
       TOAST FUNCTION
    ===================================================== */

    function showToast(message) {

        toastMessage.textContent =
            message;

        toast.classList.add("show");


        clearTimeout(
            window.toastTimeout
        );


        window.toastTimeout =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 3500);

    }


    /* =====================================================
       ACTIVE NAV ON SCROLL
    ===================================================== */

    const sections =
        document.querySelectorAll("main section[id]");

    const navLinks =
        document.querySelectorAll(".nav-menu > a");


    window.addEventListener("scroll", () => {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 120;

            if (
                window.scrollY >=
                sectionTop
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (
                href === `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    });


});