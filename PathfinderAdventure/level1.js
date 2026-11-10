import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    setDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// ========================================
// QUESTIONS
// ========================================

const questions = [

    {
        category: "Guess the Pathfinder Flag",
        question:
            "What symbol is featured on the official Pathfinder flag?",
        options: [
            "The Pathfinder Club emblem",
            "A national flag",
            "A mountain only",
            "A compass only"
        ],
        answer: 0
    },

    {
        category: "Guess the Pathfinder Flag",
        question:
            "What colors alternate in the background of the Pathfinder flag?",
        options: [
            "Red and yellow",
            "Blue and white",
            "Green and black",
            "Orange and blue"
        ],
        answer: 1
    },

    {
        category: "Pledge Challenge",
        question:
            "The Pathfinder Pledge says a Pathfinder will be pure, kind, and ______.",
        options: [
            "strong",
            "famous",
            "true",
            "perfect"
        ],
        answer: 2
    },

    {
        category: "Pledge Challenge",
        question:
            "Which of these is part of the Pathfinder Pledge?",
        options: [
            "I will be a servant of God",
            "I will always win",
            "I will never make mistakes",
            "I will become a leader"
        ],
        answer: 0
    },

    {
        category: "Pledge Challenge",
        question:
            "The Pathfinder Pledge includes being a friend to ______.",
        options: [
            "leaders",
            "man",
            "teachers only",
            "Pathfinders only"
        ],
        answer: 1
    },

    {
        category: "Law Challenge",
        question:
            "Which is the FIRST Pathfinder Law?",
        options: [
            "Care for your body",
            "Keep a song in your heart",
            "Keep the morning watch",
            "Do your honest part"
        ],
        answer: 2
    },

    {
        category: "Law Challenge",
        question:
            "Which Pathfinder Law teaches members to take care of their health?",
        options: [
            "Care for your body",
            "Keep a level eye",
            "Go on God's errands",
            "Do your honest part"
        ],
        answer: 0
    },

    {
        category: "Law Challenge",
        question:
            "Which Pathfinder Law is about being cheerful and positive?",
        options: [
            "Walk softly in the sanctuary",
            "Keep a song in your heart",
            "Keep the morning watch",
            "Care for your body"
        ],
        answer: 1
    },

    {
        category: "Quick Quiz",
        question:
            "What is the Pathfinder Motto?",
        options: [
            "Learn, Work, Win",
            "The love of Christ compels us",
            "Always be the best",
            "Serve, Camp, Explore"
        ],
        answer: 1
    },

    {
        category: "Quick Quiz",
        question:
            "What is the Pathfinder Aim?",
        options: [
            "The Advent Message to all the world in my generation",
            "To become the best camper",
            "To win every Pathfinder game",
            "To learn outdoor skills"
        ],
        answer: 0
    }

];


// ========================================
// VARIABLES
// ========================================

let currentQuestion = 0;

let score = 0;

let mistakes = [];

let currentUser = null;


// ========================================
// HTML ELEMENTS
// ========================================

const questionNumber =
    document.getElementById("question-number");

const totalQuestions =
    document.getElementById("total-questions");

const currentScore =
    document.getElementById("current-score");

const questionCategory =
    document.getElementById("question-category");

const questionText =
    document.getElementById("question-text");

const answersContainer =
    document.getElementById("answers");

const feedback =
    document.getElementById("feedback");

const nextButton =
    document.getElementById("next-button");

const questionCard =
    document.getElementById("question-card");

const resultCard =
    document.getElementById("result-card");

const finalScore =
    document.getElementById("final-score");

const correctCount =
    document.getElementById("correct-count");

const wrongCount =
    document.getElementById("wrong-count");

const resultMessage =
    document.getElementById("result-message");

const retryButton =
    document.getElementById("retry-button");

const progressFill =
    document.getElementById("quiz-progress-fill");

const flagVisual =
    document.getElementById("flag-visual");


// ========================================
// CHECK LOGIN
// ========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;

    totalQuestions.textContent =
        questions.length;

    loadQuestion();

});


// ========================================
// LOAD QUESTION
// ========================================

function loadQuestion() {

    const question =
        questions[currentQuestion];


    questionNumber.textContent =
        currentQuestion + 1;


    questionCategory.textContent =
        question.category;


    questionText.textContent =
        question.question;


    currentScore.textContent =
        score;


    answersContainer.innerHTML = "";

    feedback.textContent = "";

    feedback.className =
        "answer-feedback";


    nextButton.style.display =
        "none";


    // Show flag only for first 2 questions

    if (currentQuestion < 2) {

        flagVisual.style.display =
            "flex";

    } else {

        flagVisual.style.display =
            "none";

    }


    // Progress

    const progress =
        (currentQuestion / questions.length) * 100;

    progressFill.style.width =
        progress + "%";


    // Create answer buttons

    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.className =
                "answer-button";

            button.textContent =
                option;


            button.addEventListener(
                "click",
                () => selectAnswer(index)
            );


            answersContainer.appendChild(button);

        }
    );

}


// ========================================
// SELECT ANSWER
// ========================================

function selectAnswer(selectedIndex) {

    const question =
        questions[currentQuestion];


    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );


    // Disable all answers

    buttons.forEach(button => {

        button.disabled = true;

    });


    const correctIndex =
        question.answer;


    if (selectedIndex === correctIndex) {

        score++;

        currentScore.textContent =
            score;


        buttons[selectedIndex]
            .classList.add("correct");


        feedback.textContent =
            "✓ Correct! Good job, Pathfinder.";

        feedback.classList.add("correct-feedback");


    } else {

        buttons[selectedIndex]
            .classList.add("wrong");


        buttons[correctIndex]
            .classList.add("correct");


        feedback.textContent =
            "✗ Not quite. The correct answer is: "
            + question.options[correctIndex];


        feedback.classList.add("wrong-feedback");


        mistakes.push({

            question:
                question.question,

            category:
                question.category,

            selectedAnswer:
                question.options[selectedIndex],

            correctAnswer:
                question.options[correctIndex]

        });

    }


    nextButton.style.display =
        "block";

}


// ========================================
// NEXT QUESTION
// ========================================

nextButton.addEventListener(
    "click",
    () => {

        currentQuestion++;


        if (
            currentQuestion >=
            questions.length
        ) {

            finishLevel();

        } else {

            loadQuestion();

        }

    }
);


// ========================================
// FINISH LEVEL
// ========================================

async function finishLevel() {

    questionCard.classList.add("hidden");

    resultCard.classList.remove("hidden");


    const total =
        questions.length;


    const wrong =
        mistakes.length;


    finalScore.textContent =
        `${score}/${total}`;


    correctCount.textContent =
        score;


    wrongCount.textContent =
        wrong;


    progressFill.style.width =
        "100%";


    // Message

    if (score === total) {

        resultMessage.textContent =
            "Perfect score! Excellent Pathfinder knowledge!";

    } else if (score >= 7) {

        resultMessage.textContent =
            "Excellent work! You have a strong understanding of the basics.";

    } else if (score >= 5) {

        resultMessage.textContent =
            "Good job! Review your mistakes and try to improve.";

    } else {

        resultMessage.textContent =
            "Keep learning! Review your mistakes and try Level 1 again.";

    }


    await saveResult();

}


// ========================================
// SAVE RESULT TO FIRESTORE
// ========================================

async function saveResult() {

    if (!currentUser) {

        return;
    }


    try {

        // Save Level 1 score

        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid
            ),

            {

                level1Score: score,

                level1Completed: true,

                level1MistakeCount:
                    mistakes.length,

                lastLevel1Attempt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );


        // Save every mistake

        for (
            const mistake of mistakes
        ) {

            await addDoc(

                collection(
                    db,
                    "mistakes"
                ),

                {

                    userId:
                        currentUser.uid,

                    userEmail:
                        currentUser.email,

                    level:
                        "Level 1",

                    category:
                        mistake.category,

                    question:
                        mistake.question,

                    selectedAnswer:
                        mistake.selectedAnswer,

                    correctAnswer:
                        mistake.correctAnswer,

                    createdAt:
                        serverTimestamp()

                }

            );

        }


        console.log(
            "Level 1 result saved successfully."
        );


    } catch (error) {

        console.error(
            "Error saving result:",
            error
        );

        alert(
            "Your score was calculated, but there was a problem saving it."
        );

    }

}


// ========================================
// RETRY
// ========================================

retryButton.addEventListener(
    "click",
    () => {

        currentQuestion = 0;

        score = 0;

        mistakes = [];


        resultCard.classList.add(
            "hidden"
        );


        questionCard.classList.remove(
            "hidden"
        );


        currentScore.textContent =
            "0";


        loadQuestion();

    }
);


// ========================================
// LOGOUT
// ========================================

document
    .querySelector(".logout-btn")
    .addEventListener(
        "click",
        async () => {

            const {
                signOut
            } = await import(
                "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js"
            );


            await signOut(auth);


            window.location.href =
                "login.html";

        }
    );