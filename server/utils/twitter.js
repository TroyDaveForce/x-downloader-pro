const axios = require('axios');

/**
 * Pulls a numeric tweet/status ID out of a twitter.com or x.com URL.
 * Accepts links like:
 *   https://twitter.com/user/status/1234567890
 *   https://x.com/user/status/1234567890?s=20
 */
function extractTweetId(rawUrl) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl.trim());
    const host = url.hostname.replace('www.', '');

    if (!['twitter.com', 'x.com', 'mobile.twitter.com'].includes(host)) {
      return null;
    }

    const match = url.pathname.match(/\/status(?:es)?\/(\d+)/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetches public tweet data (including video variants, if any) using
 * Twitter's public syndication endpoint - the same one used to power
 * embedded tweet widgets. No auth/API key is required for this endpoint.
 */
async function fetchTweetData(tweetId) {
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result`;

  const { data } = await axios.get(endpoint, {
    params: {
      id: tweetId,
      token: '1', // syndication endpoint just needs any non-empty token
    },
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    timeout: 10000,
  });

  if (!data || data.__typename === 'TweetTombstone') {
    throw new Error('Tweet not found or is private/deleted.');
  }

  const author = {
    name: data?.user?.name || 'Unknown',
    handle: data?.user?.screen_name || 'unknown',
    avatar: data?.user?.profile_image_url_https || null,
  };

  const text = data?.text || '';

  // Video lives under mediaDetails, type "video" or "animated_gif"
  const mediaDetails = data?.mediaDetails || [];
  const videoMedia = mediaDetails.find(
    (m) => m.type === 'video' || m.type === 'animated_gif'
  );

  if (!videoMedia) {
    return {
      hasVideo: false,
      author,
      text,
      thumbnail: mediaDetails[0]?.media_url_https || null,
      videos: [],
    };
  }

  const variants = (videoMedia.video_info?.variants || [])
    .filter((v) => v.content_type === 'video/mp4' && v.bitrate !== undefined)
    .sort((a, b) => b.bitrate - a.bitrate)
    .map((v) => ({
      quality: bitrateToLabel(v.bitrate),
      bitrate: v.bitrate,
      url: v.url,
    }));

  return {
    hasVideo: true,
    author,
    text,
    thumbnail: videoMedia.media_url_https || null,
    videos: variants,
  };
}

function bitrateToLabel(bitrate) {
  if (bitrate >= 2000000) return '1080p';
  if (bitrate >= 800000) return '720p';
  if (bitrate >= 250000) return '480p';
  return '360p';
}

module.exports = { extractTweetId, fetchTweetData };
