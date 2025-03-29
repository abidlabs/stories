# Bedtime Stories Player

A simple and beautiful web application for playing bedtime stories for your child. This player allows you to organize and play your recorded stories with playback controls and a user-friendly interface.

## Features

- Beautiful, child-friendly interface with a storybook theme
- Large play/pause button for easy control
- Next/previous story navigation
- Playback speed control (0.5x to 2x)
- Volume control
- Progress bar with time display
- Mobile-responsive design

## How to Use

1. **Adding Your Stories**:
   - Place your MP3 audio files in the `stories/` directory
   - Edit the `app.js` file to update the `stories` array with your own story information:
     ```javascript
     const stories = [
         { 
             title: "Your Story Title",
             file: "stories/your-story-filename.mp3"
         },
         // Add more stories here
     ];
     ```
   - The player will automatically detect the duration of your audio files

2. **Viewing the Website**:
   - Open `index.html` in a web browser
   - Or host the files on a web server

3. **Using the Player**:
   - Click on a story from the list to select it
   - Use the large play/pause button to start or stop playback
   - Use the previous/next buttons to navigate between stories
   - Adjust playback speed or volume as needed
   - Click on the timeline to jump to a specific point in the story

## Technical Details

This application uses:
- HTML5 for structure
- CSS3 for styling
- JavaScript for functionality
- HTML5 Audio API for playback
- FontAwesome for icons
- Google Fonts for typography

## Compatibility

This player works on most modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Customization

You can customize the appearance by editing the `styles.css` file:
- Change colors by modifying the color values
- Adjust fonts by changing the font-family properties
- Modify sizes and spacing to fit your preferences

## License

This project is open source and free to use for personal purposes.