**Objective:** 

The purpose of this assignment is to design a software architecture and implement the Intelligent Tutoring System (ITS) using SOLID principles. This system provides personalized, adaptive learning experiences for students. The ITS should be capable of assessing students' knowledge, providing feedback, and recommending customized learning paths. The goal is to create a flexible and scalable architecture that can handle a variety of learning contexts. 

**Context:** 

An Intelligent Tutoring System (ITS) is a type of software application that uses artificial intelligence techniques to provide individualized instruction to learners. These systems are capable of assessing student performance, providing hints, and offering feedback based on student behavior and progress. An ITS aims to replicate some aspects of one-on-one human tutoring, where the system adjusts dynamically to the learner's pace, abilities, and preferences. The system should be able to handle multiple subjects, topics, and difficulty levels, and must also offer administrative features for instructors, such as tracking student progress and generating reports.

**Scope of the System:** 

*   Personalized Learning: The system should assess individual students' strengths, weaknesses, and learning styles, and provide customized instructional content.

    *   What can be gathered for an agent to determine strengths and weaknesses?

        *   Test results, time spent on tests, time spent on learning materials

    *   What can be gathered for an agent to determine learning styles?

    *   What are the customized instructional content?

        *   Agent-generated test practices?

        *   Feedback and hints

        *   When user look into a course detail, give a short summary if this course suitable for them, what they can learn from this course?

            *   Input: **student summary + course content**

            *   Output: personalized course suitability summary

        *   Chatbot that look for suitable course to student learning interest and pace?

*   Feedback: Students should receive feedback on their performance, including guidance and hints when necessary. 

    *   When to provide feedback?

        *   When student complete the course

            *   Generate a short summary of what the student achieve with **course content**, student results, and time spent learning

            *   Update **student summary** 

            *   Suggest next course to take(with MCP)

                *   Pre-defined by instructor

                *   Retrieve and generate by search: comparing **student summary** + what student should learn next (Agent generated) with all **course contents**

    *   When to provide hint?

        *   When student stuck on a question of a test and seek for hint (button), a toast pops up and provides a hint?

            *   Generate a hint and a short summary of each test based on the **course content** only. (**pre-generated hint**)

            *   When student seek help, combine **student summary** and **pre-generated hint** to give personalized hint

*   Assessment and Evaluation: The ITS should include mechanisms for evaluating student progress through quizzes, exercises, or projects.

    *   Provided by instructor

    *   Agent generate?

*   Instructor Dashboard: Teachers can monitor student progress, manage content, and generate reports. 

    *   Student apply to courses freely or can only apply to specific instructors courses? In the 2nd case, instructors should be the ones invite students to their page (which host the instructor’s uploaded learning contents)

*   Learning Content Management: Ability to manage, update, and curate learning materials across different topics, formats (e.g., text, video, interactive exercises).

    *   Support text content, interactive exercise first (Frontend display)

    *   Support for video content
