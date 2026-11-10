
// FRIEND CLASS - QUIZ 1
// General Pathfinder Knowledge
// 10 questions | 1 point each | Passing score: 7/10

window.friendQuizData = {
    quizNumber: 1,
    title: "General Pathfinder Knowledge",
    passingScore: 7,

    questions: [
        {
            question: "What is the main purpose of the Pathfinder Club?",
            choices: [
                "To develop young people through spiritual and practical activities",
                "To train young people only for sports competitions",
                "To teach young people only academic subjects",
                "To prepare young people for professional employment"
            ],
            answer: 0,
            explanation: "The Pathfinder Club supports the spiritual, mental, and physical development of young people."
        },
        {
            question: "Which age group is the Pathfinder program primarily designed for?",
            choices: [
                "5 to 9 years old",
                "10 to 15 years old",
                "16 to 21 years old",
                "22 to 30 years old"
            ],
            answer: 1,
            explanation: "The official Pathfinder program is designed for young people ages 10 to 15."
        },
        {
            question: "Which of the following is part of the Pathfinder program?",
            choices: [
                "Community service",
                "Professional office training only",
                "Business management only",
                "Competitive gaming only"
            ],
            answer: 0,
            explanation: "Community service is one of the activities that helps Pathfinders develop helpfulness and responsibility."
        },
        {
            question: "What does the Pathfinder Law help teach its members?",
            choices: [
                "Good character and responsible behavior",
                "How to become wealthy",
                "How to win every competition",
                "How to avoid helping other people"
            ],
            answer: 0,
            explanation: "The Pathfinder Law provides principles that guide members in their behavior and daily lives."
        },
        {
            question: "Which section of the Bible contains the book of Genesis?",
            choices: [
                "New Testament",
                "Old Testament",
                "Book of Psalms",
                "Gospels"
            ],
            answer: 1,
            explanation: "Genesis is the first book of the Old Testament."
        },
        {
            question: "Who is traditionally identified as the author of Psalm 23?",
            choices: [
                "Moses",
                "Solomon",
                "David",
                "Peter"
            ],
            answer: 2,
            explanation: "Psalm 23 is attributed to David and describes the Lord as a shepherd."
        },
        {
            question: "What lesson can Pathfinders learn from the Golden Rule?",
            choices: [
                "Treat others the way you want to be treated",
                "Always put yourself before others",
                "Avoid people who are different from you",
                "Help others only when you receive something"
            ],
            answer: 0,
            explanation: "The Golden Rule teaches kindness and consideration toward other people."
        },
        {
            question: "In Daniel 1, what did Daniel and his friends choose to avoid?",
            choices: [
                "Their daily responsibilities",
                "The king's food and wine",
                "Studying and learning",
                "Helping one another"
            ],
            answer: 1,
            explanation: "Daniel and his friends chose a different diet rather than eating the food and drinking the wine provided by the king."
        },
        {
            question: "Which activity helps Pathfinders learn about the natural world?",
            choices: [
                "Nature observation",
                "Online shopping",
                "Watching advertisements",
                "Playing computer games"
            ],
            answer: 0,
            explanation: "Nature observation helps Pathfinders understand and appreciate the environment."
        },
        {
            question: "Why is learning basic outdoor safety important?",
            choices: [
                "To avoid preparing for outdoor activities",
                "To help prevent accidents and respond safely to possible dangers",
                "To make outdoor activities more competitive",
                "To avoid following instructions"
            ],
            answer: 1,
            explanation: "Outdoor safety helps Pathfinders recognize risks and make responsible decisions during activities."
        }
    ]
};

// GET THE SELECTED PATHFINDER CLASS
const selectedClass = new URLSearchParams(window.location.search)
    .get("class") || "Friend";

const classDetails = {
    Friend: {
        title: "Friend Class",
        description: "Begin your Pathfinder adventure and discover basic values, knowledge, and activities."
    },
    Companion: {
        title: "Companion Class",
        description: "Continue learning and develop your knowledge through Pathfinder activities."
    },
    Explorer: {
        title: "Explorer Class",
        description: "Discover new experiences and explore practical Pathfinder skills."
    },
    Ranger: {
        title: "Ranger Class",
        description: "Build your skills through learning, service, and outdoor activities."
    },
    Voyager: {
        title: "Voyager Class",
        description: "Develop your knowledge, leadership, and practical Pathfinder skills."
    },
    Guide: {
        title: "Guide Class",
        description: "Continue your Pathfinder journey through leadership, service, and advanced learning."
    }
};

const currentClass = classDetails[selectedClass] || classDetails.Friend;

document.getElementById("class-title").textContent = currentClass.title;
document.getElementById("class-description").textContent = currentClass.description;

