// Resonance - Community Voice Platform
// All data flows through /api routes - no direct database access

// Get organization from URL parameter (e.g., ?org=lincoln-heights)
const urlParams = new URLSearchParams(window.location.search);
const orgId = urlParams.get('org') || 'general';
const orgName = urlParams.get('name') || 'Community Development Forum';

// Update page title and header with org name
if (orgId !== 'general') {
    document.title = `${orgName} - Voice Platform`;
    const contextBox = document.getElementById('contextBox');
    if (contextBox) {
        const h2 = contextBox.querySelector('h2');
        if (h2) h2.textContent = orgName;
    }
}

// Audio recording variables
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let startTime = null;
let timerInterval = null;
let encouragementInterval = null;

// Recording limits
const MAX_RECORDING_SECONDS = 300; // 5 minutes max
const WARNING_SECONDS = 240; // Warning at 4 minutes

// Community development questions that rotate during recording
const encouragements = [
    "What makes our community unique?",
    "What resources do we need most?",
    "How can we better support local businesses?",
    "What would make you proud to live here?",
    "How can we engage more young people?",
    "What spaces do we need for gathering?",
    "How do we preserve our community's character?",
    "What skills exist here that we're not utilizing?",
    "How can we improve transportation access?",
    "What would make families want to stay?",
    "How do we bridge generational divides?",
    "What partnerships could strengthen us?",
    "How can we celebrate our diversity?",
    "What infrastructure needs attention first?",
    "How do we attract sustainable development?",
    "What traditions should we preserve?",
    "How can we support our seniors better?",
    "What would draw visitors to our area?",
    "How do we create more job opportunities?",
    "What makes a neighborhood thrive?"
];

// DOM elements
const micButton = document.getElementById('micButton');
const status = document.getElementById('status');
const recordingIndicator = document.getElementById('recordingIndicator');
const timerDisplay = document.getElementById('timerDisplay');
const encouragement = document.getElementById('encouragement');

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    micButton.addEventListener('click', toggleRecording);
});

async function toggleRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await uploadRecording(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        startTime = Date.now();

        // Enter recording booth mode
        document.body.classList.add('recording-mode');
        micButton.classList.add('recording');
        recordingIndicator.classList.add('active');

        // Start timer
        timerInterval = setInterval(updateTimer, 100);

    } catch (err) {
        console.error('Error accessing microphone:', err);
        status.innerHTML = '<span class="error">Please allow microphone access to share your voice</span>';
        status.classList.add('active');
        setTimeout(() => {
            status.classList.remove('active');
            status.textContent = '';
        }, 3000);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;

        // Exit recording booth mode
        document.body.classList.remove('recording-mode');
        micButton.classList.remove('recording');
        recordingIndicator.classList.remove('active');

        // Clear intervals
        clearInterval(timerInterval);
        clearInterval(encouragementInterval);

        // Hide encouragement
        encouragement.classList.remove('visible');
        setTimeout(() => {
            encouragement.textContent = '';
        }, 1000);

        // Show processing message
        status.textContent = 'Processing your message...';
        status.classList.add('active');
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Show warning when approaching limit
    if (elapsed === WARNING_SECONDS) {
        status.innerHTML = '<span class="warning">1 minute remaining</span>';
        status.classList.add('active');
        setTimeout(() => {
            if (isRecording) {
                status.classList.remove('active');
                status.textContent = '';
            }
        }, 3000);
    }

    // Auto-stop at max length
    if (elapsed >= MAX_RECORDING_SECONDS) {
        console.log('Maximum recording length reached');
        stopRecording();
        status.innerHTML = '<span class="info">Maximum recording length reached (5 minutes)</span>';
        status.classList.add('active');
        setTimeout(() => {
            status.classList.remove('active');
            status.textContent = '';
        }, 5000);
    }
}

function showEncouragement() {
    // Fade out current message
    encouragement.classList.remove('visible');

    setTimeout(() => {
        // Pick a random encouragement
        const randomIndex = Math.floor(Math.random() * encouragements.length);
        encouragement.textContent = encouragements[randomIndex];
        encouragement.classList.add('visible');
    }, 500);
}

// Upload recording through API (no direct database access)
async function uploadRecording(audioBlob) {
    try {
        const timestamp = Date.now();
        const filename = `voice_${timestamp}.webm`;

        // Upload through API route - credentials stay server-side
        const response = await fetch(`/api/upload?filename=${filename}&org=${orgId}`, {
            method: 'POST',
            body: audioBlob,
            headers: {
                'Content-Type': 'audio/webm',
            },
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        console.log('Uploaded:', result.pathname);

        // Get recording count through API
        const countResponse = await fetch(`/api/recordings?org=${orgId}`);
        const countData = await countResponse.json();
        const voiceCount = countData.count || 1;

        // Show detailed thank you message with close button
        status.innerHTML = `
            <div class="thank-you-message">
                <button class="close-button" onclick="this.parentElement.parentElement.classList.remove('active'); this.parentElement.parentElement.innerHTML = '';">×</button>
                <h3>✓ Thank You for Contributing!</h3>
                <p>Your voice has been added to the community repository.</p>
                <p class="next-steps">
                    <strong>What happens next:</strong><br>
                    Your response will be synthesized with ${voiceCount - 1} other community voices
                    to identify common themes, priorities, and innovative ideas.
                    Together, we're building a collective vision for our community's future.
                </p>
                <p class="repository-note">
                    All voices remain anonymous and are used solely for community development planning.
                </p>
            </div>
        `;
        status.classList.add('active');
        timerDisplay.textContent = '0:00';

        // Keep message visible for 30 seconds unless manually closed
        setTimeout(() => {
            if (status.classList.contains('active')) {
                status.classList.remove('active');
                setTimeout(() => {
                    status.innerHTML = '';
                }, 500);
            }
        }, 30000);

    } catch (err) {
        console.error('Upload error:', err);
        status.innerHTML = '<span class="error">Upload failed. Please try again.</span>';
        status.classList.add('active');
        timerDisplay.textContent = '0:00';

        setTimeout(() => {
            status.textContent = '';
            status.classList.remove('active');
        }, 5000);
    }
}
