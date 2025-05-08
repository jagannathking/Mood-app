document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        cameraAccess: document.getElementById('camera-access-screen'),
        moodSelect: document.getElementById('mood-select-screen'),
        scanning: document.getElementById('scanning-screen'),
        recommendation: document.getElementById('recommendation-screen'),
    };

    const video = document.getElementById('video-feed');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const checkMoodBtn = document.getElementById('check-mood-btn');
    const noPicLink = document.getElementById('no-pic-link');
    const moodOptionBtns = document.querySelectorAll('.mood-option-btn');
    const submitMoodBtn = document.getElementById('submit-mood-btn');
    const scanAgainBtn = document.getElementById('scan-again-btn');
    const scanFacePlaceholder = document.getElementById('scan-face-placeholder');

    const movieData = {
        Happy: {
            name: "Welcome",
            link: "https://www.primevideo.com/detail/0MJFLZHIV04F9V9V21RAY2Z8ZZ/",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/af13e1c59556eb143d2b213c9f95567677f409033d4c9619c553367d71bee982._SX1920_FMwebp_.jpg",
        },
        Sad: {
            name: "Call me Bae",
            link: "https://www.primevideo.com/detail/0TF2BODX83KZOWTP08NXFE897E/",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/0cb7ac74d1d6e8eb2e3d59aa5354359714eb54d84fcfaa616d9de19d64b492ca._SX1920_FMwebp_.jpg",
        },
        Excited: {
            name: "Citadel Honey Bunny",
            link: "https://www.primevideo.com/detail/0KYRVT4JDB957NXZO72E2MIFW5",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/51c2c75da778c109ccc33ff293ff48f0cccc60b18c3fef8a42afe2a80e07acac._SX1920_FMwebp_.jpg",
        },
        Neutral: {
            name: "Farzi",
            link: "https://www.primevideo.com/detail/0HDHQAUF5LPWOJRCO025LFJSJI",
            thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/8aed532f0875925f72c4012aab688ed409773ecbfb3b18e1a39cd9ad1a4dd485._SX1920_FMwebp_.jpg",
        },
        Angry: {
            name: "Agneepath",
            link: "https://www.primevideo.com/detail/0NU7IFXPL2WWSDHNGAR5Z1GUJE/",
            thumbnail: "https://images-eu.ssl-images-amazon.com/images/S/pv-target-images/1863426056ae862def9a69ca76e8af54cdb6b8a5a2be1100e096e59b00060847._UX1920_.png",
        }
    };
    const VALID_MOODS = ["Happy", "Excited", "Neutral", "Angry", "Sad"];
    let currentSelectedMood = null;
    let stream = null;
    let scanAnimation = null;

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    async function startCamera() {
        try {
            if (stream) { // Stop existing stream before starting a new one
                stream.getTracks().forEach(track => track.stop());
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = stream;
            checkMoodBtn.textContent = "CAPTURE & CHECK MOOD"; // Change button text after access
            video.style.display = 'block'; // Ensure video is visible
            console.log("Camera started");
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access camera. Please allow camera access or choose your mood manually.");
            showScreen('moodSelect'); // Fallback to manual selection
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.srcObject = null;
            console.log("Camera stopped");
        }
        checkMoodBtn.textContent = "Check my mood"; // Reset button text
    }

    function captureImageAndSimulateMoodDetection() {
        showScreen('scanning');
        
        // Set canvas dimensions to video feed for capture
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        scanFacePlaceholder.src = imageDataUrl; // Show captured image on scanning screen

        stopCamera(); // Stop camera after capture
        startScanningAnimation();

        // --- SIMULATED OpenAI API CALL ---
        console.log("Simulating OpenAI API call with image data (not actually sending)...");
        setTimeout(() => {
            // In a real scenario, you'd send imageDataUrl (or blob) to your backend,
            // which then calls OpenAI.
            const randomMoodIndex = Math.floor(Math.random() * VALID_MOODS.length);
            let detectedMood = VALID_MOODS[randomMoodIndex];
            
            // Simulate API failure or invalid mood occasionally
            if (Math.random() < 0.1) { // 10% chance of "failure"
                console.log("Simulated API failure or invalid mood response.");
                detectedMood = "InvalidMood"; // or an error condition
            }

            processMoodResult(detectedMood);
        }, 3000); // Simulate network delay
    }

    function processMoodResult(mood) {
        stopScanningAnimation();
        if (!VALID_MOODS.includes(mood)) {
            console.warn(`Detected mood "${mood}" is not valid. Defaulting to Neutral.`);
            mood = "Neutral";
        }
        currentSelectedMood = mood;
        displayRecommendation(mood);
    }
    
    function startScanningAnimation() {
        const scanBar = document.getElementById('scan-bar');
        gsap.set(scanBar, { y: 0 }); // Reset position
        scanAnimation = gsap.to(scanBar, {
            y: "245px", // scan-animation-container height (250px) - bar height (5px)
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    function stopScanningAnimation() {
        if (scanAnimation) {
            scanAnimation.kill();
            scanAnimation = null;
        }
    }

    function displayRecommendation(mood) {
        const movie = movieData[mood];
        if (movie) {
            document.getElementById('detected-mood-text').textContent = mood;
            document.getElementById('movie-thumbnail').src = movie.thumbnail;
            document.getElementById('movie-thumbnail').alt = movie.name + " Thumbnail";
            document.getElementById('movie-title').textContent = movie.name;
            document.getElementById('watch-now-link').href = movie.link;
            showScreen('recommendation');
        } else {
            console.error("No movie data for mood:", mood);
            // Handle case where movie data might be missing (shouldn't happen with current setup)
            processMoodResult("Neutral"); // Fallback to neutral if something is wrong
        }
    }

    // --- Event Listeners ---

    checkMoodBtn.addEventListener('click', () => {
        if (!stream) { // If camera not started, try to start it
            startCamera();
        } else { // If camera is already running, capture image
            captureImageAndSimulateMoodDetection();
        }
    });

    noPicLink.addEventListener('click', (e) => {
        e.preventDefault();
        stopCamera();
        showScreen('moodSelect');
    });

    moodOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodOptionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentSelectedMood = btn.dataset.mood;
            submitMoodBtn.disabled = false;
        });
    });

    submitMoodBtn.addEventListener('click', () => {
        if (currentSelectedMood) {
            // No scanning animation for manual selection, directly to recommendation
            processMoodResult(currentSelectedMood);
        }
    });

    scanAgainBtn.addEventListener('click', () => {
        stopCamera(); // Ensure camera is stopped if it was running
        currentSelectedMood = null;
        submitMoodBtn.disabled = true;
        moodOptionBtns.forEach(b => b.classList.remove('selected'));
        checkMoodBtn.textContent = "Check my mood"; // Reset button text
        video.style.display = 'none'; // Hide video element initially
        // Let's offer the choice again
        showScreen('cameraAccess'); 
    });

    // Initial setup
    showScreen('cameraAccess');
    video.style.display = 'none'; // Hide video element until camera access is granted
    // Preload movie thumbnails (optional, good for UX)
    Object.values(movieData).forEach(movie => {
        const img = new Image();
        img.src = movie.thumbnail;
    });
    const primeLogoImg = new Image();
    primeLogoImg.src = document.querySelector('.prime-logo').src; // Preload prime logo
});