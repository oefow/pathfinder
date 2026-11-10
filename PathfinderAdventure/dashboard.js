import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ========================================
// HTML ELEMENTS
// ========================================

const studentName = document.getElementById("student-name");

const level1Score = document.getElementById("level1-score");
const level1Status = document.getElementById("level1-status");

const level2Score = document.getElementById("level2-score");
const level2Status = document.getElementById("level2-status");

const level3Score = document.getElementById("level3-score");
const level3Status = document.getElementById("level3-status");

const overallProgress = document.getElementById("overall-progress");
const progressFill = document.getElementById("progress-fill");

const completedLevels = document.getElementById("completed-levels");
const totalScore = document.getElementById("total-score");
const mistakeCount = document.getElementById("mistake-count");

const logoutButton = document.querySelector(".logout-btn");

// ========================================
// DISPLAY LEVEL PROGRESS
// ========================================

function displayLevel(scoreElement, statusElement, score, completed, total) {
    scoreElement.textContent = `${score}/${total}`;

    statusElement.textContent = completed
        ? "Completed ✓"
        : "Not Completed";

    statusElement.classList.toggle("completed", completed);
}

// ========================================
// LOAD STUDENT DATA
// ========================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            console.log("No student data found for:", user.uid);
            studentName.textContent = user.displayName || "Pathfinder";
            return;
        }

        const data = userSnapshot.data();

        console.log("Dashboard user UID:", user.uid);
        console.log("Dashboard Firestore data:", data);

        // STUDENT NAME
        studentName.textContent =
            data.name || user.displayName || "Pathfinder";

        // SCORES AND COMPLETION
        const score1 = Number(data.level1Score) || 0;
        const score2 = Number(data.level2Score) || 0;
        const score3 = Number(data.level3Score) || 0;

        const level1Completed = data.level1Completed === true;
        const level2Completed = data.level2Completed === true;
        const level3Completed = data.level3Completed === true;

        displayLevel(
            level1Score, level1Status,
            score1, level1Completed, 10
        );

        displayLevel(
            level2Score, level2Status,
            score2, level2Completed, 12
        );

        displayLevel(
            level3Score, level3Status,
            score3, level3Completed, 10
        );

        // COMPLETED LEVELS
        const completed =
            Number(level1Completed) +
            Number(level2Completed) +
            Number(level3Completed);

        completedLevels.textContent = completed;

        // OVERALL PROGRESS
        const progress = Math.round((completed / 3) * 100);

        overallProgress.textContent = `${progress}%`;
progressFill.style.width = `${progress}%`;

const secondaryProgress = document.getElementById(
    "progress-fill-secondary"
);
const secondaryLabel = document.getElementById(
    "progress-label-secondary"
);

if (secondaryProgress) {
    secondaryProgress.style.width = `${progress}%`;
}

if (secondaryLabel) {
    secondaryLabel.textContent = `${progress}% Complete`;
}

        // TOTAL SCORE
        totalScore.textContent = score1 + score2 + score3;

        // MISTAKES TO REVIEW
        const mistakes1 = Number(data.level1MistakeCount) || 0;
        const mistakes2 = Number(data.level2MistakeCount) || 0;
        const mistakes3 = Number(data.level3MistakeCount) || 0;

        mistakeCount.textContent = mistakes1 + mistakes2 + mistakes3;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
});

// ========================================
// LOGOUT
// ========================================

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
        }
    });
}