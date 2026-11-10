
const classButtons = document.querySelectorAll(".select-class");

const classQuizPages = {
    Friend: "class-dashboard.html?class=Friend",
    Companion: "class-dashboard.html?class=Companion",
    Explorer: "class-dashboard.html?class=Explorer",
    Ranger: "class-dashboard.html?class=Ranger",
    Voyager: "class-dashboard.html?class=Voyager",
    Guide: "class-dashboard.html?class=Guide"
};

let selectedClass = "";

function createClassModal() {
    if (document.getElementById("classConfirmModal")) return;

    const modal = document.createElement("div");
    modal.id = "classConfirmModal";
    modal.className = "class-modal";

    modal.innerHTML = `
        <div class="class-modal-card" role="dialog"
             aria-modal="true" aria-labelledby="classModalTitle">

            <button class="class-modal-close" id="classModalClose"
                    aria-label="Close popup">&times;</button>

            <div class="class-modal-emblem">⚑</div>

            <p class="class-modal-label">PATHFINDER ADVENTURE</p>

            <h2 id="classModalTitle">Ready for the challenge?</h2>

            <p class="class-modal-description">
                You selected the
                <strong id="classModalName">Friend</strong> Class.
                Are you ready to test your Pathfinder knowledge?
            </p>

            <div class="class-modal-divider">
                <span>★</span>
            </div>

            <button id="classModalYes" class="class-modal-yes">
                YES, LET'S GO! <span>➜</span>
            </button>

            <button id="classModalNo" class="class-modal-no">
                NO, CHOOSE AGAIN
            </button>

            <p class="class-modal-footer">
                LEARN • EXPLORE • GROW
            </p>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("classModalYes").addEventListener("click", () => {
        if (!selectedClass) return;

        try {
            localStorage.setItem("selectedPathfinderClass", selectedClass);
        } catch (error) {
            console.error("Unable to save selected class:", error);
        }

        const quizPage = classQuizPages[selectedClass];
        if (quizPage) window.location.href = quizPage;
    });

    document.getElementById("classModalNo").addEventListener("click", closeClassModal);
    document.getElementById("classModalClose").addEventListener("click", closeClassModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeClassModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeClassModal();
    });
}

function openClassModal(className) {
    selectedClass = className;

    document.getElementById("classModalName").textContent = className;
    document.getElementById("classConfirmModal").classList.add("show");
    document.body.classList.add("modal-open");

    document.getElementById("classModalYes").focus();
}

function closeClassModal() {
    const modal = document.getElementById("classConfirmModal");
    if (modal) modal.classList.remove("show");

    document.body.classList.remove("modal-open");
    selectedClass = "";
}

classButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const className = button.dataset.class;

        if (!classQuizPages[className]) {
            alert("Quiz page not found for this class.");
            return;
        }

        openClassModal(className);
    });
});

createClassModal();

// Restore the previously selected class indicator.
try {
    const savedClass = localStorage.getItem("selectedPathfinderClass");

    if (savedClass) {
        const savedButton = document.querySelector(
            `.select-class[data-class="${savedClass}"]`
        );

        if (savedButton) {
            savedButton.setAttribute("aria-pressed", "true");
        }
    }
} catch (error) {
    console.error("Unable to restore selected class:", error);
}
