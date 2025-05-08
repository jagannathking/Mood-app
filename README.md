
## How to Run Locally

1.  Clone this repository (if applicable) or download the files.
2.  Ensure you have the following folder structure:
    ```
    mood-match-ad/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
    ```
3.  Open `index.html` in a modern web browser (e.g., Chrome, Firefox, Edge).
4.  The browser will ask for camera permission if you choose the "Check my mood" option.

## Deployment

This project is a static site and can be easily deployed on platforms like:

*   Vercel
*   Netlify
*   GitHub Pages
*   Or any static web host.

## Notes

*   **Mood Detection API:** The mood detection from the camera image is currently *simulated* within `js/script.js`. For a real-world application, this would involve a backend service that communicates with an AI/ML API (like OpenAI Vision API) to analyze the image and return a mood. The frontend would then call this backend service.
*   **Asset URLs:** The Prime Video logo and movie thumbnails are loaded from external URLs.

## Screenshots (Optional)

*(You can optionally add links to or embed screenshots of the ad in different states here if you have them hosted somewhere, or if you are using this README in a Git repository that supports image embedding.)*

*   Initial Screen: `[Link to Screenshot 1]`
*   Mood Selection: `[Link to Screenshot 2]`
*   Recommendation: `[Link to Screenshot 3]`

---

This README provides a good overview of the project, its features, how to run it, and important technical notes.
