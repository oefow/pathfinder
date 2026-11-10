
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const mistakesList = document.getElementById("mistakes-list");

onAuthStateChanged(auth, async (user) => {
    if (!mistakesList) return;

    if (!user) {
        mistakesList.innerHTML =
            "<p>Please log in to view your mistakes.</p>";
        return;
    }

    mistakesList.innerHTML = "<p>Loading your mistakes...</p>";

    try {
        const mistakesQuery = query(
            collection(db, "mistakes"),
            where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(mistakesQuery);

        if (snapshot.empty) {
            mistakesList.innerHTML = `
                <div class="review-panel">
                    <div>
                        <h3>No mistakes to review yet!</h3>
                        <p>
                            When you answer a quiz incorrectly,
                            your saved mistakes will appear here.
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        const mistakes = [];

        snapshot.forEach((document) => {
            mistakes.push(document.data());
        });

        mistakes.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() ?? 0;
            const dateB = b.createdAt?.toMillis?.() ?? 0;
            return dateB - dateA;
        });

        mistakesList.innerHTML = mistakes.map((mistake, index) => {
            const question = escapeHTML(mistake.question || "Question unavailable");
            const selected = escapeHTML(mistake.selectedAnswer || "Not recorded");
            const correct = escapeHTML(mistake.correctAnswer || "Not recorded");
            const level = escapeHTML(mistake.level || "Pathfinder Quiz");
            const category = escapeHTML(mistake.category || "General");

            return `
                <article class="mistake-card">
                    <div class="mistake-card-top">
                        <span class="mistake-number">Mistake ${index + 1}</span>
                        <span class="mistake-level">${level}</span>
                    </div>

                    <p class="mistake-category">${category}</p>
                    <h3>${question}</h3>

                    <div class="mistake-answer wrong-answer">
                        <strong>Your answer</strong>
                        <p>${selected}</p>
                    </div>

                    <div class="mistake-answer correct-answer">
                        <strong>Correct answer</strong>
                        <p>${correct}</p>
                    </div>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Could not load mistakes:", error);

        mistakesList.innerHTML = `
            <div class="review-panel">
                <div>
                    <h3>Unable to load your mistakes</h3>
                    <p>
                        Please check your internet connection and
                        Firebase permissions, then refresh the page.
                    </p>
                </div>
            </div>
        `;
    }
});

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}
