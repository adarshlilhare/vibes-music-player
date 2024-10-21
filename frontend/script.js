const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');

if (accessToken) {
    document.getElementById('search-area').style.display = 'block';

    document.getElementById('search-btn').addEventListener('click', async () => {
        const songName = document.getElementById('song-input').value.trim();
        if (!songName) {
            alert('Please enter a song name.');
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const data = await response.json();
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Clear previous results

            if (data.tracks.items.length > 0) {
                data.tracks.items.forEach(track => {
                    const trackElement = document.createElement('div');
                    trackElement.className = 'track';
                    trackElement.innerHTML = `
                        <h3>${track.name}</h3>
                        <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                        <audio controls>
                            <source src="${track.preview_url}" type="audio/mpeg">
                            Your browser does not support the audio tag.
                        </audio>
                    `;
                    resultsDiv.appendChild(trackElement);
                });
            } else {
                resultsDiv.innerHTML = '<p>No results found</p>';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while searching for songs. Please try again.');
        }
    });
} else {
    // Redirect to login page if no access token is found
    window.location.href = 'http://localhost:5000/login';
}
