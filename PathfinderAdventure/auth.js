
import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// =====================================
// REGISTER
// =====================================

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = registerForm.querySelector("#name").value.trim();
        const email = registerForm.querySelector("#register-email").value.trim();
        const password = registerForm.querySelector("#register-password").value;
        const confirmPassword =
            registerForm.querySelector("#confirm-password").value;

        if (!name) {
            alert("Please enter your full name.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const submitButton =
            registerForm.querySelector('button[type="submit"]');

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Creating account...";
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name
            });

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: "student",

                level1Score: 0,
                level2Score: 0,
                level3Score: 0,

                level1Completed: false,
                level2Completed: false,
                level3Completed: false,

                progress: 0,
                createdAt: serverTimestamp()
            });

            alert("Registration successful!");

            window.location.href = "student-dashboard.html";

        } catch (error) {
            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                alert("This email is already registered.");
            } else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");
            } else if (error.code === "auth/weak-password") {
                alert("Please choose a stronger password.");
            } else {
                alert("Registration failed: " + error.message);
            }

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'CREATE ACCOUNT <span>→</span>';
            }
        }
    });
}


// =====================================
// LOGIN
// =====================================

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("#email").value.trim();
        const password = loginForm.querySelector("#password").value;

        const submitButton =
            loginForm.querySelector('button[type="submit"]');

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = "Signing in...";
            }

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            const userDoc = await getDoc(
                doc(db, "users", user.uid)
            );

            if (!userDoc.exists()) {
                await signOut(auth);

                alert(
                    "Your user record was not found. Please contact the administrator."
                );

                return;
            }

            const userData = userDoc.data();

            if (userData.role === "admin") {
                window.location.href = "admin-dashboard.html";

            } else if (userData.role === "student") {
                window.location.href = "student-dashboard.html";

            } else {
                await signOut(auth);
                alert("Your account role is not recognized.");
            }

        } catch (error) {
            console.error("Login error:", error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                alert("Incorrect email or password.");

            } else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");

            } else {
                alert("Login failed: " + error.message);
            }

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'SIGN IN <span>→</span>';
            }
        }
    });
}


// =====================================
// LOGOUT
// =====================================

const logoutButtons = document.querySelectorAll(".logout-btn");

logoutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
        }
    });
});
