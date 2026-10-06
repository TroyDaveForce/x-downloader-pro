const express = require('express');
const { extractTweetId, fetchTweetData } = require('../utils/twitter');

const router = express.Router();

router.post('/fetch', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Please provide a tweet URL.' });
  }

  const tweetId = extractTweetId(url);

  if (!tweetId) {
    return res.status(400).json({
      success: false,
      message: 'That doesn\'t look like a valid twitter.com or x.com status link.',
    });
  }

  try {
    const result = await fetchTweetData(tweetId);

    if (!result.hasVideo) {
      return res.status(404).json({
        success: false,
        message: 'No video was found in that post.',
      });
    }

    return res.json({
      success: true,
      author: result.author,
      text: result.text,
      thumbnail: result.thumbnail,
      videos: result.videos,
    });
  } catch (err) {
    console.error('fetchTweetData error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Could not retrieve that post. It may be private, deleted, or age-restricted.',
    });
  }
});

module.exports = router;
