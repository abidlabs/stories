// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const timeline = document.querySelector('.timeline');
const progress = document.querySelector('.progress');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');
const storyTitle = document.getElementById('story-title');
const storyDuration = document.getElementById('story-duration');
const storiesList = document.getElementById('stories');
const playbackSpeed = document.getElementById('playback-speed');
const volumeControl = document.getElementById('volume');

// Story data
// You can add your own stories to this array
const stories = [
    { 
        title: "The Adventures of Fluffy the Cloud",
        file: "stories/fluffy-cloud.mp3"
    },
    { 
        title: "Princess Penny and the Magic Garden",
        file: "stories/princess-penny.mp3"
    },
    { 
        title: "The Brave Little Spaceship",
        file: "stories/brave-spaceship.mp3"
    },
    { 
        title: "Dragons Don't Eat Vegetables",
        file: "stories/dragons-vegetables.mp3"
    },
    { 
        title: "The Whispering Forest",
        file: "stories/whispering-forest.mp3"
    }
];

// State variables
let currentStoryIndex = 0;
let isPlaying = false;

// Format time from seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Load stories into the list
function loadStories() {
    storiesList.innerHTML = '';
    
    stories.forEach((story, index) => {
        const li = document.createElement('li');
        li.classList.add('story-item');
        if (index === currentStoryIndex) {
            li.classList.add('active');
        }
        
        // Create temporary audio element to get duration
        const tempAudio = new Audio(story.file);
        
        li.innerHTML = `
            <span class="story-name">${story.title}</span>
            <span class="story-length">Loading...</span>
        `;
        
        // Once metadata is loaded, update the duration display
        tempAudio.addEventListener('loadedmetadata', () => {
            const durationSpan = li.querySelector('.story-length');
            if (durationSpan) {
                durationSpan.textContent = formatTime(tempAudio.duration);
            }
            
            // Store the duration in the story object
            story.duration = tempAudio.duration;
            
            // If this is the current story, update the display
            if (index === currentStoryIndex) {
                storyDuration.textContent = formatTime(tempAudio.duration);
                totalTimeDisplay.textContent = formatTime(tempAudio.duration);
            }
        });
        
        // Handle loading errors gracefully
        tempAudio.addEventListener('error', () => {
            const durationSpan = li.querySelector('.story-length');
            if (durationSpan) {
                durationSpan.textContent = "Unavailable";
            }
        });
        
        li.addEventListener('click', () => {
            loadStory(index);
        });
        
        storiesList.appendChild(li);
    });
}

// Load a specific story
function loadStory(index) {
    if (index < 0) index = stories.length - 1;
    if (index >= stories.length) index = 0;
    
    currentStoryIndex = index;
    
    // Update story display
    storyTitle.textContent = stories[index].title;
    
    // Update audio source
    audioPlayer.src = stories[index].file;
    
    // Update active state in list
    const storyItems = document.querySelectorAll('.story-item');
    storyItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Reset progress bar
    progress.style.width = '0%';
    currentTimeDisplay.textContent = '00:00';
    
    // Set duration display (if already known)
    if (stories[index].duration) {
        storyDuration.textContent = formatTime(stories[index].duration);
        totalTimeDisplay.textContent = formatTime(stories[index].duration);
    } else {
        storyDuration.textContent = "Loading...";
        totalTimeDisplay.textContent = "00:00";
        
        // When audio metadata is loaded, update the duration
        audioPlayer.addEventListener('loadedmetadata', function updateDuration() {
            stories[index].duration = audioPlayer.duration;
            storyDuration.textContent = formatTime(audioPlayer.duration);
            totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
            
            // Remove this listener after it runs once for this loading
            audioPlayer.removeEventListener('loadedmetadata', updateDuration);
        });
    }
    
    // Start playing if already in playing state
    if (isPlaying) {
        playAudio();
    } else {
        pauseAudio();
    }
}

// Play audio
function playAudio() {
    const playPromise = audioPlayer.play();
    
    // Handle play() promise to catch any errors
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Playback started successfully
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        })
        .catch(error => {
            // Auto-play was prevented or another error occurred
            console.log("Playback error:", error);
            pauseAudio();
        });
    }
}

// Pause audio
function pauseAudio() {
    audioPlayer.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
}

// Toggle play/pause
function togglePlay() {
    if (audioPlayer.paused) {
        playAudio();
    } else {
        pauseAudio();
    }
}

// Go to previous story
function prevStory() {
    loadStory(currentStoryIndex - 1);
}

// Go to next story
function nextStory() {
    loadStory(currentStoryIndex + 1);
}

// Update progress bar
function updateProgress() {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = `${percent}%`;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    }
}

// Set progress bar on click
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if (duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
}

// Event listeners
playPauseBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevStory);
nextBtn.addEventListener('click', nextStory);
timeline.addEventListener('click', setProgress);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', nextStory);

playbackSpeed.addEventListener('change', () => {
    audioPlayer.playbackRate = playbackSpeed.value;
});

volumeControl.addEventListener('input', () => {
    audioPlayer.volume = volumeControl.value;
});

// Initialize the player
function init() {
    loadStories();
    loadStory(0);
}

// Start the app
window.addEventListener('DOMContentLoaded', init); 