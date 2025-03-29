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

// State variables
let stories = []; // Will be populated from stories.json
let currentStoryIndex = 0;
let isPlaying = false;
let isLoading = false; // Track loading state

// Format time from seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Fetch stories from the stories.json file
async function fetchStories() {
    try {
        const response = await fetch('stories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the file list to create story objects
        stories = data.files.map(filename => {
            // Extract a title from the filename by removing extension and replacing hyphens with spaces
            let title = filename.replace('.mp3', '').replace(/-/g, ' ');
            
            // Capitalize first letter of each word
            title = title.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            return {
                title: title,
                file: `stories/${filename}`,
                loaded: false // Track if this audio has been loaded
            };
        });
        
        // Sort alphabetically by title
        stories.sort((a, b) => a.title.localeCompare(b.title));
        
        // If we have stories, load them
        if (stories.length > 0) {
            loadStories();
            loadStory(0, true); // Load the first story
        } else {
            storyTitle.textContent = "No stories found";
            storiesList.innerHTML = '<li class="no-stories">No audio files found in the stories directory</li>';
        }
    } catch (error) {
        console.error('Error fetching stories:', error);
        storyTitle.textContent = "Error loading stories";
        storiesList.innerHTML = `<li class="error">Error: ${error.message}</li>`;
    }
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
        
        li.innerHTML = `
            <span class="story-name">${story.title}</span>
            <span class="story-length">Loading...</span>
        `;
        
        // Create temporary audio element to get duration
        const tempAudio = new Audio();
        
        // Set listeners before setting source
        tempAudio.addEventListener('loadedmetadata', function() {
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
        
        tempAudio.addEventListener('error', function(e) {
            console.error(`Error loading audio for ${story.title}:`, e);
            const durationSpan = li.querySelector('.story-length');
            if (durationSpan) {
                durationSpan.textContent = "Unavailable";
            }
            
            // If this is the current story, update displays
            if (index === currentStoryIndex) {
                storyDuration.textContent = "Unavailable";
            }
        });
        
        // Set the source after adding event listeners
        tempAudio.preload = "metadata";
        tempAudio.src = story.file;
        
        li.addEventListener('click', () => {
            loadStory(index, true); // Force loading when clicking on a story
        });
        
        storiesList.appendChild(li);
    });
    
    // Start preloading the first audio file
    preloadAudio(0);
}

// Preload an audio file in the background
function preloadAudio(index) {
    if (index < 0 || index >= stories.length || stories[index].loaded) {
        return; // Don't preload if out of bounds or already loaded
    }
    
    // Create a new Audio element for preloading
    const preloader = new Audio();
    preloader.src = stories[index].file;
    preloader.preload = "auto"; // Force preloading
    
    // Mark as loaded when completely loaded
    preloader.addEventListener('canplaythrough', () => {
        stories[index].loaded = true;
        
        // Preload next story if available
        if (index < stories.length - 1) {
            preloadAudio(index + 1);
        }
    }, { once: true });
}

// Load a specific story
function loadStory(index, forceLoad = false) {
    if (index < 0) index = stories.length - 1;
    if (index >= stories.length) index = 0;
    
    // Don't reload the same story unless forced
    if (index === currentStoryIndex && !forceLoad) {
        return;
    }
    
    currentStoryIndex = index;
    
    // Update story display
    storyTitle.textContent = stories[index].title;
    
    // Update loading state
    isLoading = !stories[index].loaded;
    if (isLoading) {
        playPauseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
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
    }
    
    // Add error listener before setting source
    const handleError = function() {
        console.error(`Error loading audio for ${stories[index].title}`);
        storyDuration.textContent = "Unavailable";
        totalTimeDisplay.textContent = "00:00";
        isLoading = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    };
    
    // Remove previous error listener if any
    audioPlayer.removeEventListener('error', handleError);
    
    // Add new error listener
    audioPlayer.addEventListener('error', handleError);
    
    // Update audio source
    audioPlayer.src = stories[index].file;
    
    // Set preload to auto to load the entire file
    audioPlayer.preload = "auto";
    
    // Update active state in list
    const storyItems = document.querySelectorAll('.story-item');
    storyItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // When audio metadata is loaded, update the duration
    const updateDuration = function() {
        stories[index].duration = audioPlayer.duration;
        storyDuration.textContent = formatTime(audioPlayer.duration);
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
        
        // Also update the playlist item
        const storyItems = document.querySelectorAll('.story-item');
        if (storyItems[index]) {
            const durationSpan = storyItems[index].querySelector('.story-length');
            if (durationSpan) {
                durationSpan.textContent = formatTime(audioPlayer.duration);
            }
        }
    };
    
    // Remove previous metadata listener if any
    audioPlayer.removeEventListener('loadedmetadata', updateDuration);
    
    // Add new metadata listener
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    
    // When enough of the audio has loaded to play through
    const canPlayHandler = function() {
        isLoading = false;
        stories[currentStoryIndex].loaded = true;
        
        // Update the play button if we're not already playing
        if (!isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // If we were already in playing state, start playing
        if (isPlaying) {
            playAudio();
        }
        
        // Preload the next story if it exists
        if (currentStoryIndex < stories.length - 1) {
            preloadAudio(currentStoryIndex + 1);
        }
    };
    
    // Remove previous canplay listener if any
    audioPlayer.removeEventListener('canplay', canPlayHandler);
    
    // Add new canplay listener
    audioPlayer.addEventListener('canplay', canPlayHandler);
    
    // Start playing if already in playing state
    if (isPlaying) {
        // We'll attempt to play when canplay event fires above
        playPauseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else {
        pauseAudio();
    }
}

// Play audio
function playAudio() {
    // Don't try to play if we're still loading
    if (isLoading) {
        playPauseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        isPlaying = true;  // Mark as playing so it will play when loaded
        return;
    }
    
    // Add loading spinner while waiting for playback to start
    playPauseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
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
    loadStory(currentStoryIndex - 1, true);
}

// Go to next story
function nextStory() {
    loadStory(currentStoryIndex + 1, true);
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

// playbackSpeed.addEventListener('change', () => {
//     audioPlayer.playbackRate = playbackSpeed.value;
// });

// volumeControl.addEventListener('input', () => {
//     audioPlayer.volume = volumeControl.value;
// });

// Initialize the player
function init() {
    // Set audio player to preload automatically
    audioPlayer.preload = "auto";
    
    // Add global error handler for debugging
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.message, e.filename, e.lineno);
    });
    
    fetchStories();
}

// Start the app
window.addEventListener('DOMContentLoaded', init); 