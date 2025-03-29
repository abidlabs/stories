Place your MP3 audio files in this directory!

For example:
- fluffy-cloud.mp3
- princess-penny.mp3
- brave-spaceship.mp3
- dragons-vegetables.mp3
- whispering-forest.mp3

Then update the stories array in app.js to match your file names and provide the story titles:

const stories = [
    { 
        title: "Your Story Title",
        file: "stories/your-story-filename.mp3"
    },
    // Add more stories here
];

The audio player will automatically detect and display the duration of each story. 