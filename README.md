# CMU Bulletin

**Live Site:** [cmubulletin.com](https://cmubulletin.com) (Once Deployed)

CMU Bulletin is a modern digital bulletin board for the Carnegie Mellon University community. It provides a centralized platform for students and organizations to discover, post, and engage with events and announcements on campus.

## Key Features

- **Event Discovery:** A clean, filterable grid view of all current and upcoming event posters.
- **Poster Uploads:** A simple form for users to upload their own event posters and details.
- **User Profiles:** Personalized pages where users can see the posters they've uploaded and the ones they've liked.
- **Interactive Liking:** Users can "like" posters to save them to their profile.
- **Detailed Modal View:** Clicking a poster opens a detailed view with all event information, including dates, location, tags, and organizer.

## Technology Stack

This project is built with a modern, scalable tech stack:

- **Frontend:**
  - **React:** For building the user interface.
  - **Vite:** As the fast, modern build tool and development server.
  - **React Router:** For handling client-side navigation.

- **Backend & Database:**
  - **Firebase:** The primary backend platform, providing:
    - **Firestore:** A NoSQL database for storing poster and user data.
    - **Firebase Authentication:** For secure user sign-up and login.
    - **Firebase Storage:** For hosting uploaded poster images.
    - **Firebase Hosting:** For deploying the live web application.

- **Styling:**
  - **CSS:** Custom styling to create the project's look and feel.