# The Spotify Dashboard
Name: Moksh Srinivas

Here is the website: https://spotify-dashboard-jet.vercel.app

Here is the link to the video: https://drive.google.com/file/d/1P2c-EzF3fqABPV6NiXNGigwiGgY1d7rU/view?usp=sharing

This shouldn't need to run locally because you can just run the site on the link above but if you need to run it locally, in src/pages/login.js, change redirect uri to http://localhost:3000/callback. In the terminal of the root directory (should be ending in spotify-dashboard). Run "npm start" and if there is an error (specifically if react-scripts is not recognized), run "npm install react react-scripts axios helmet" to ensure all the requirements to run the site is met and you can access the site on: http://localhost:3000/

## Available Features

In this website you will find

### `Your Top 20 Songs`

Based on your listening history, you can find you top 20 most listened to songs.

### `Your Top 20 Artists`

Based on your listening history, you can find you top 20 most listened to artists.

### `Your Top 20 Albums`

Based on a combination of your top songs ranking and number of top songs in the album, you can see your top albums.

### `Search`

You can search for songs and play previews of each of them. The songs are presented in a better way than the current spotify search tool.


