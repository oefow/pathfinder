
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


/* =========================
   ELEMENTS
========================= */

const studentTable = document.getElementById("student-table");
const totalStudents = document.getElementById("total-students");
const completedStudents = document.getElementById("completed-students");
const averageScore = document.getElementById("average-score");
const studentSearch = document.getElementById("student-search");
const logoutButtons = document.querySelectorAll(".logout-btn");

let allStudents = [];


/* =========================
   CHECK ADMIN ACCESS
========================= */

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            window.location.href = "login.html";
            return;
        }

        const userData = userSnapshot.data();

        if (userData.role !== "admin") {
            alert("You do not have permission to access the admin dashboard.");
            window.location.href = "student-dashboard.html";
            return;
        }

        await loadStudents();

    } catch (error) {
        console.error("Admin dashboard error:", error);

        if (studentTable) {
            studentTable.innerHTML = `
                <tr>
                    <td colspan="6" class="table-message">
                        Unable to load student records. Please refresh the page.
                    </td>
                </tr>
            `;
        }

        alert("Unable to load admin dashboard. Check your connection and Firebase permissions.");
    }
});


/* =========================
   LOAD STUDENTS
========================= */

async function loadStudents() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    allStudents = [];

    snapshot.forEach((userDocument) => {
        const data = userDocument.data();

        if (data.role === "student") {
            allStudents.push({
                ...data,
                uid: userDocument.id
            });
        }
    });

    // Sort students alphabetically
    allStudents.sort((a, b) => {
        return String(a.name || "Unknown").localeCompare(
            String(b.name || "Unknown")
        );
    });

    updateSummary();
    renderStudents(allStudents);
}


/* =========================
   UPDATE SUMMARY CARDS
========================= */

function updateSummary() {
    const studentCount = allStudents.length;

    if (totalStudents) {
        totalStudents.textContent = studentCount;
    }

    const completedCount = allStudents.filter((student) => {
        return (
            student.level1Completed === true &&
            student.level2Completed === true &&
            student.level3Completed === true
        );
    }).length;

    if (completedStudents) {
        completedStudents.textContent = completedCount;
    }

    let scoreTotal = 0;

    allStudents.forEach((student) => {
        scoreTotal += getScore(student.level1Score);
        scoreTotal += getScore(student.level2Score);
        scoreTotal += getScore(student.level3Score);
    });

    const average = studentCount > 0
        ? Math.round(scoreTotal / studentCount)
        : 0;

    if (averageScore) {
        averageScore.textContent = average;
    }
}


/* =========================
   HELPER: VALID SCORE
========================= */

function getScore(value) {
    const score = Number(value);
    return Number.isFinite(score) ? score : 0;
}


/* =========================
   HELPER: SAFE HTML TEXT
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   RENDER STUDENT TABLE
========================= */

function renderStudents(students) {
    if (!studentTable) return;

    if (students.length === 0) {
        const isSearching = studentSearch?.value.trim();

        studentTable.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    ${
                        isSearching
                            ? "No students match your search."
                            : "No students registered yet."
                    }
                </td>
            </tr>
        `;

        return;
    }

    studentTable.innerHTML = "";

    students.forEach((student) => {
        const score1 = getScore(student.level1Score);
        const score2 = getScore(student.level2Score);
        const score3 = getScore(student.level3Score);

        const completedCount = [
            student.level1Completed,
            student.level2Completed,
            student.level3Completed
        ].filter((completed) => completed === true).length;

        const progress = Math.round((completedCount / 3) * 100);

        const name = escapeHTML(student.name || "Unknown");
        const email = escapeHTML(student.email || "No email");

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="student-name-cell">
                    <div class="student-table-avatar">
                        ${escapeHTML(getInitial(student.name))}
                    </div>
                    <span>${name}</span>
                </div>
            </td>

            <td>${email}</td>

            <td>
                <span class="score-pill">${score1}</span>
            </td>

            <td>
                <span class="score-pill">${score2}</span>
            </td>

            <td>
                <span class="score-pill">${score3}</span>
            </td>

            <td>
                <div
                    class="mini-progress"
                    role="progressbar"
                    aria-label="${name} level completion"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="${progress}"
                >
                    <div style="width: ${progress}%"></div>
                </div>

                <small class="progress-text">${progress}%</small>
            </td>
        `;

        studentTable.appendChild(row);
    });
}


/* =========================
   HELPER: STUDENT INITIAL
========================= */

function getInitial(name) {
    const cleanName = String(name || "").trim();

    return cleanName ? cleanName.charAt(0).toUpperCase() : "?";
}


/* =========================
   SEARCH STUDENTS
========================= */

if (studentSearch) {
    studentSearch.addEventListener("input", () => {
        const searchTerm = studentSearch.value.trim().toLowerCase();

        const filteredStudents = allStudents.filter((student) => {
            const name = String(student.name || "").toLowerCase();
            const email = String(student.email || "").toLowerCase();

            return (
                name.includes(searchTerm) ||
                email.includes(searchTerm)
            );
        });

        renderStudents(filteredStudents);
    });
}


/* =========================
   LOGOUT
========================= */

logoutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        button.disabled = true;

        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
            button.disabled = false;
        }
    });
});
