document.addEventListener("DOMContentLoaded", () => {
  const GEMINI_API_KEY = "AIzaSyAccZ2uQqD3vaixS_UVpbaDKRF1WzbkWdg"; // YOUR ACTUAL API KEY
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const screens = {
    camera: document.getElementById("screen-camera"),
    manualMood: document.getElementById("screen-manual-mood"),
    recommendation: document.getElementById("screen-recommendation"),
    loading: document.getElementById("screen-loading"),
  };

  const video = document.getElementById("camera-feed");
  const canvas = document.getElementById("snapshot-canvas");
  const cameraArea = document.getElementById("camera-area");
  const cameraPlaceholder = document.getElementById("camera-placeholder");
  const scanAnimationBar = document.getElementById("scan-animation-bar");

  const checkMoodBtn = document.getElementById("check-mood-btn");
  const noPicLink = document.getElementById("no-pic-link");
  const moodButtons = document.querySelectorAll(".mood-btn");
  const submitManualMoodBtn = document.getElementById("submit-manual-mood-btn");
  const scanAgainBtn = document.getElementById("scan-again-btn");

  const detectedMoodText = document.getElementById("detected-mood-text");
  const movieTitleDisplay = document.getElementById("movie-title-display");
  const movieThumbnail = document.getElementById("movie-thumbnail");
  const watchNowLink = document.getElementById("watch-now-link");
  const loadingText = document.getElementById("loading-text");

  let currentStream = null;
  let selectedManualMood = null;

  const movieData = {
    Happy: {
      name: "Welcome",
      link: "https://www.primevideo.com/detail/0MJFLZHIV04F9V9V21RAY2Z8ZZ/",
      thumbnail:
        "https://m.media-amazon.com/images/S/pv-target-images/af13e1c59556eb143d2b213c9f95567677f409033d4c9619c553367d71bee982._SX1920_FMwebp_.jpg",
    },
    Sad: {
      name: "Call me Bae",
      link: "https://www.primevideo.com/detail/0TF2BODX83KZOWTP08NXFE897E/",
      thumbnail:
        "https://m.media-amazon.com/images/S/pv-target-images/0cb7ac74d1d6e8eb2e3d59aa5354359714eb54d84fcfaa616d9de19d64b492ca._SX1920_FMwebp_.jpg",
    },
    Excited: {
      name: "Citadel Honey Bunny",
      link: "https://www.primevideo.com/detail/0KYRVT4JDB957NXZO72E2MIFW5",
      thumbnail:
        "https://m.media-amazon.com/images/S/pv-target-images/51c2c75da778c109ccc33ff293ff48f0cccc60b18c3fef8a42afe2a80e07acac._SX1920_FMwebp_.jpg",
    },
    Neutral: {
      name: "Farzi",
      link: "https://www.primevideo.com/detail/0HDHQAUF5LPWOJRCO025LFJSJI",
      thumbnail:
        "https://m.media-amazon.com/images/S/pv-target-images/8aed532f0875925f72c4012aab688ed409773ecbfb3b18e1a39cd9ad1a4dd485._SX1920_FMwebp_.jpg",
    },
    Angry: {
      name: "Agneepath",
      link: "https://www.primevideo.com/detail/0NU7IFXPL2WWSDHNGAR5Z1GUJE/",
      thumbnail:
        "https://images-eu.ssl-images-amazon.com/images/S/pv-target-images/1863426056ae862def9a69ca76e8af54cdb6b8a5a2be1100e096e59b00060847._UX1920_.png",
    },
  };
  const validMoods = Object.keys(movieData);

  function showScreen(screenName) {
    Object.values(screens).forEach((screen) =>
      screen.classList.remove("active")
    );
    if (screens[screenName]) {
      screens[screenName].classList.add("active");
    }
  }

  async function startCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 300, height: 300 },
        });
        video.srcObject = currentStream;
        video.style.display = "block";
        cameraPlaceholder.style.display = "none";
        checkMoodBtn.disabled = false;
        return true;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      cameraPlaceholder.innerHTML =
        "<p>Camera access denied or unavailable.</p><p>Try choosing your mood manually.</p>";
      checkMoodBtn.disabled = true;
    }
    return false;
  }

  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;
      video.srcObject = null;
      video.style.display = "none";
      cameraPlaceholder.style.display = "flex"; // Show placeholder again
      cameraPlaceholder.innerHTML =
        "<p>Camera will appear here.</p><p>Allow camera access when prompted.</p>";
    }
    cameraArea.classList.remove("scanning");
    scanAnimationBar.style.animation = "none"; // Reset animation
  }

  function captureFrame() {
    if (!currentStream || !video.videoWidth) return null;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.translate(canvas.width, 0); // Flip horizontally
    context.scale(-1, 1); // Flip horizontally
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for next draw
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1]; // Get base64 data
  }

  async function getMoodFromGemini(base64ImageData) {
    showScreen("loading");
    loadingText.textContent = "Analyzing your mood...";

    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Analyze the facial expression in this image. What is the dominant mood displayed? Choose ONLY from the following: Happy, Excited, Neutral, Angry, Sad. If the mood is ambiguous, not clearly one of these, or no face is clearly visible, please respond with 'Neutral'. Respond with only one word from the list.",
            },
            { inline_data: { mime_type: "image/jpeg", data: base64ImageData } },
          ],
        },
      ],
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log("Gemini Response:", data);

      let mood = "Neutral"; // Default
      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0 &&
        data.candidates[0].content.parts[0].text
      ) {
        let extractedText = data.candidates[0].content.parts[0].text.trim();
        // Clean up potential markdown or extra phrases if Gemini doesn't strictly follow "one word"
        const moodMatch = extractedText.match(
          /\b(Happy|Excited|Neutral|Angry|Sad)\b/i
        );
        if (moodMatch && moodMatch[0]) {
          mood =
            moodMatch[0].charAt(0).toUpperCase() +
            moodMatch[0].slice(1).toLowerCase();
          if (!validMoods.includes(mood)) mood = "Neutral"; // Ensure it's one of our specific moods
        } else {
          mood = "Neutral"; // Default if no valid mood found in text
        }
      }
      return mood;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Neutral"; // Default on error
    }
  }

  function displayRecommendation(mood) {
    const movie = movieData[mood] || movieData.Neutral;
    detectedMoodText.textContent = mood;
    movieTitleDisplay.textContent = movie.name;
    movieThumbnail.src = movie.thumbnail;
    movieThumbnail.alt = movie.name + " Thumbnail";
    watchNowLink.href = movie.link;
    showScreen("recommendation");
  }

  checkMoodBtn.addEventListener("click", async () => {
    if (!currentStream) {
      alert("Camera is not active. Please allow camera access.");
      return;
    }
    checkMoodBtn.disabled = true;
    cameraArea.classList.add("scanning");
    scanAnimationBar.style.animation = "scan 2s linear forwards"; // Trigger animation

    // Wait for scan animation to be noticeable
    setTimeout(async () => {
      const imageData = captureFrame();
      if (imageData) {
        stopCamera(); // Stop camera after capture, before API call
        const mood = await getMoodFromGemini(imageData);
        displayRecommendation(mood);
      } else {
        alert("Failed to capture image. Please try again.");
        stopCamera(); // Ensure camera stops and UI resets
        showScreen("camera"); // Go back to camera screen
      }
      checkMoodBtn.disabled = false; // Re-enable after processing
      cameraArea.classList.remove("scanning");
      scanAnimationBar.style.animation = "none";
    }, 500); // Delay to let scan start visually
  });

  noPicLink.addEventListener("click", () => {
    stopCamera();
    selectedManualMood = null; // Reset selection
    moodButtons.forEach((btn) => btn.classList.remove("selected"));
    submitManualMoodBtn.disabled = true;
    showScreen("manualMood");
  });

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moodButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedManualMood = button.dataset.mood;
      submitManualMoodBtn.disabled = false;
    });
  });

  submitManualMoodBtn.addEventListener("click", () => {
    if (selectedManualMood) {
      displayRecommendation(selectedManualMood);
    }
  });

  scanAgainBtn.addEventListener("click", async () => {
    showScreen("camera");
    checkMoodBtn.disabled = true; // Disable until camera starts
    const cameraStarted = await startCamera();
    if (cameraStarted) {
      checkMoodBtn.disabled = false;
    }
  });

  // Initial setup
  async function init() {
    showScreen("camera");
    checkMoodBtn.disabled = true; // Disable until camera starts
    const cameraStarted = await startCamera();
    if (cameraStarted) {
      checkMoodBtn.disabled = false;
    } else {
      // If camera fails to start, offer manual choice more prominently or switch
      // For now, the placeholder text and disabled button handle this.
    }
  }

  init();
});