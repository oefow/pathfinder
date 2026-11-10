
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


const questionsRef = collection(db, "quiz1Questions");

const form = document.getElementById("quiz-question-form");
const questionIdInput = document.getElementById("quiz-question-id");
const categoryInput = document.getElementById("quiz-category");
const typeInput = document.getElementById("quiz-type");
const questionInput = document.getElementById("quiz-question");

const choiceFields = document.getElementById("quiz-choice-fields");
const identificationFields =
    document.getElementById("quiz-identification-fields");

const identificationAnswerInput =
    document.getElementById("quiz-identification-answer");

const correctAnswerInput =
    document.getElementById("quiz-correct-answer");

const listElement = document.getElementById("quiz-question-list");
const countElement = document.getElementById("quiz-question-count");
const messageElement = document.getElementById("quiz-form-message");
const formTitle = document.getElementById("quiz-form-title");
const cancelButton = document.getElementById("quiz-cancel-edit");

let isAuthorizedAdmin = false;
let savedQuestions = [];


/* CHECK ADMIN ACCESS */

onAuthStateChanged(auth, async (user) => {
    isAuthorizedAdmin = false;

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));

        if (!userSnapshot.exists() ||
            userSnapshot.data().role !== "admin") {
            alert("Only administrators can manage quiz questions.");
            window.location.href = "student-dashboard.html";
            return;
        }

        isAuthorizedAdmin = true;
        await loadQuestions();

    } catch (error) {
        console.error("Quiz manager access error:", error);
        listElement.textContent =
            "Unable to load questions. Check your Firebase permissions.";
    }
});


/* SWITCH QUESTION TYPE */

function updateQuestionType() {
    const isMultipleChoice = typeInput.value === "multiple-choice";

    choiceFields.hidden = !isMultipleChoice;
    identificationFields.hidden = isMultipleChoice;

    for (let index = 0; index < 4; index++) {
        const input = document.getElementById(`quiz-option-${index}`);
        input.required = isMultipleChoice;
    }

    correctAnswerInput.required = isMultipleChoice;
    identificationAnswerInput.required = !isMultipleChoice;
}

typeInput.addEventListener("change", updateQuestionType);
updateQuestionType();


/* LOAD QUESTIONS */

async function loadQuestions() {
    listElement.textContent = "Loading questions...";

    try {
        const snapshot = await getDocs(questionsRef);

        savedQuestions = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));

        savedQuestions.sort((a, b) =>
            Number(a.createdOrder || 0) - Number(b.createdOrder || 0)
        );

        renderQuestions();

    } catch (error) {
        console.error("Error loading quiz questions:", error);
        listElement.textContent =
            "Unable to load questions. Check your Firestore rules.";
    }
}


/* DISPLAY QUESTIONS */

function renderQuestions() {
    countElement.textContent =
        `${savedQuestions.length} Question${savedQuestions.length === 1 ? "" : "s"}`;

    if (savedQuestions.length === 0) {
        listElement.textContent =
            "No questions saved yet. Add your first question above.";
        return;
    }

    listElement.innerHTML = "";

    savedQuestions.forEach((question, index) => {
        const card = document.createElement("article");
        card.className = "quiz-question-item";

        const meta = document.createElement("div");
        meta.className = "quiz-question-meta";

        const number = document.createElement("span");
        number.className = "quiz-type-badge";
        number.textContent = `Question ${index + 1}`;

        const typeBadge = document.createElement("span");
        typeBadge.className = "quiz-type-badge";
        typeBadge.textContent =
            question.type === "identification"
                ? "Identification"
                : "Multiple Choice";

        meta.append(number, typeBadge);

        const category = document.createElement("p");
        category.textContent = question.category || "Uncategorized";

        const title = document.createElement("h4");
        title.textContent = question.question || "";

        card.append(meta, category, title);

        if (question.type === "multiple-choice") {
            const choices = document.createElement("ol");

            (question.options || []).forEach((option, optionIndex) => {
                const item = document.createElement("li");
                item.textContent =
                    `${String.fromCharCode(65 + optionIndex)}. ${option}`;

                if (optionIndex === Number(question.answer)) {
                    item.textContent += " (Correct answer)";
                }

                choices.appendChild(item);
            });

            card.appendChild(choices);

        } else {
            const answer = document.createElement("p");
            answer.textContent =
                `Expected answer: ${question.correctAnswer || ""}`;
            card.appendChild(answer);
        }

        const actions = document.createElement("div");
        actions.className = "quiz-question-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "quiz-edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editQuestion(question));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "quiz-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () =>
            removeQuestion(question.id)
        );

        actions.append(editButton, deleteButton);
        card.appendChild(actions);
        listElement.appendChild(card);
    });
}


/* SAVE NEW QUESTION OR EDIT EXISTING QUESTION */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAuthorizedAdmin) {
        messageElement.textContent = "Admin access is required.";
        return;
    }

    const questionText = questionInput.value.trim();
    const category = categoryInput.value;
    const type = typeInput.value;

    if (!questionText) {
        messageElement.textContent = "Please enter a question.";
        return;
    }

    const questionData = {
        category,
        type,
        question: questionText,
        updatedAt: serverTimestamp()
    };

    if (type === "multiple-choice") {
        const options = [0, 1, 2, 3].map((index) =>
            document.getElementById(`quiz-option-${index}`).value.trim()
        );

        if (options.some((option) => !option)) {
            messageElement.textContent =
                "Please fill in all four answer choices.";
            return;
        }

        questionData.options = options;
        questionData.answer = Number(correctAnswerInput.value);
        questionData.correctAnswer = options[questionData.answer];

    } else {
        const answer = identificationAnswerInput.value.trim();

        if (!answer) {
            messageElement.textContent =
                "Please enter the correct identification answer.";
            return;
        }

        questionData.correctAnswer = answer;
        questionData.options = [];
        questionData.answer = null;
    }

    const existingId = questionIdInput.value;
    const saveButton = form.querySelector('[type="submit"]');

    saveButton.disabled = true;
    messageElement.textContent = "Saving question...";

    try {
        if (existingId) {
            await updateDoc(doc(db, "quiz1Questions", existingId), questionData);
            messageElement.textContent = "Question updated successfully.";
        } else {
            questionData.createdAt = serverTimestamp();
            questionData.createdOrder = Date.now();

            await addDoc(questionsRef, questionData);
            messageElement.textContent = "Question saved successfully.";
        }

        resetForm();
        await loadQuestions();

    } catch (error) {
        console.error("Error saving question:", error);
        messageElement.textContent =
            "Unable to save. Check your Firestore security rules.";
    } finally {
        saveButton.disabled = false;
    }
});


/* EDIT QUESTION */

function editQuestion(question) {
    questionIdInput.value = question.id;
    categoryInput.value = question.category || "Quick Quiz";
    typeInput.value = question.type || "multiple-choice";
    questionInput.value = question.question || "";

    if (question.type === "identification") {
        identificationAnswerInput.value = question.correctAnswer || "";
    } else {
        [0, 1, 2, 3].forEach((index) => {
            document.getElementById(`quiz-option-${index}`).value =
                question.options?.[index] || "";
        });

        correctAnswerInput.value = String(question.answer ?? 0);
    }

    updateQuestionType();
    formTitle.textContent = "Edit Question";
    form.querySelector('[type="submit"]').textContent = "Update Question";
    cancelButton.hidden = false;

    form.scrollIntoView({ behavior: "smooth", block: "start" });
}


/* DELETE QUESTION */

async function removeQuestion(id) {
    if (!isAuthorizedAdmin) return;

    const confirmed = confirm(
        "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "quiz1Questions", id));
        messageElement.textContent = "Question deleted.";
        await loadQuestions();

        if (questionIdInput.value === id) {
            resetForm();
        }

    } catch (error) {
        console.error("Error deleting question:", error);
        messageElement.textContent =
            "Unable to delete. Check your Firestore security rules.";
    }
}


/* RESET FORM */s

function resetForm() {
    form.reset();
    questionIdInput.value = "";
    formTitle.textContent = "Add New Question";
    form.querySelector('[type="submit"]').textContent = "Save Question";
    cancelButton.hidden = true;
    updateQuestionType();
}

cancelButton.addEventListener("click", resetForm);
