# Prime Video - Mood Match Ad

**Live Demo:** [https://mood-app-iota.vercel.app/](https://mood-app-iota.vercel.app/)

This is a frontend project for a 300x600px display ad that recommends Prime Video movies based on the user's mood. The mood can be detected via their camera (simulated API call) or selected manually.

## Features

*   **Mood Detection via Camera:** Allows users to grant camera access. A frame is captured, and a mood is (simulated) detected.
*   **Manual Mood Selection:** Users can opt out of camera access and manually select their mood from options: Happy, Excited, Neutral, Angry, Sad.
*   **Scanning Animation:** A visual scanning animation is displayed while the "mood detection" is in progress.
*   **Movie Recommendation:** Based on the determined mood, a relevant movie from Prime Video is recommended with a thumbnail, title, and a "Watch Now" link.
*   **"Scan Again" / "Try Again" Functionality:** Allows users to restart the process.
*   **Responsive Design:** Adheres to the 300x600px dimensions.

## Tech Stack

*   HTML5
*   CSS3
*   JavaScript (Vanilla)
*   GSAP (GreenSock Animation Platform) for animations

## Project Structure 


## How to Run Locally

1.  Clone this repository (if applicable) or download the project files.
2.  Navigate to the project's root directory.
3.  Open `index.html` in a modern web browser (e.g., Chrome, Firefox, Edge).
4.  The browser will ask for camera permission if you choose the "Check my mood" option.

Alternatively, view the live deployment: [https://mood-app-iota.vercel.app/](https://mood-app-iota.vercel.app/)

## Deployment

This project is currently deployed on Vercel.

Static sites like this can also be easily deployed on other platforms such as:
*   Netlify
*   GitHub Pages
*   Or any static web host.

## Notes

*   **Mood Detection API:** The mood detection from the camera image is currently *simulated* within `js/script.js`. For a real-world application, this would involve a backend service that communicates with an AI/ML API (like OpenAI Vision API) to analyze the image and return a mood. The frontend would then call this backend service.
*   **Asset URLs:** The Prime Video logo and movie thumbnails are loaded from external URLs.

---

This README provides a good overview of the project, its features, how to run it, and important technical notes, now with a direct link to your live application!
