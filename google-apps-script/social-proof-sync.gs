/**
 * Daily social proof sync for the AJ rental site.
 *
 * Google publishes a shop's rating, review count and a handful of reviews
 * through the Places API. Meta publishes the owned Facebook Page's follower
 * count through the Graph API. This script reads them once a day and writes
 * them into the same Gist the website already loads, so the page needs no API
 * key of its own and keeps working when this script is not running.
 *
 * What it does NOT do: scrape facebook.com or maps.google.com. Both serve an
 * empty JavaScript shell to a fetcher, block non-browser clients outright, and
 * forbid scraping in their terms. Facebook recommendations, review count and
 * hand-picked reviews stay under admin control.
 *
 * Setup (Project Settings -> Script Properties):
 *   GOOGLE_MAPS_API_KEY  key with "Places API" enabled
 *   GOOGLE_PLACE_ID      the shop's place id (run findPlaceId() once to get it)
 *   FACEBOOK_PAGE_ID     the numeric id of the owned Facebook Page
 *   FACEBOOK_PAGE_ACCESS_TOKEN  Page token with pages_read_engagement
 *   FACEBOOK_GRAPH_VERSION      optional, defaults to v25.0
 *   GIST_ID              the gist the website reads
 *   GITHUB_TOKEN         a token with gist scope
 *
 * Then run syncSocialProof() once by hand to authorise it, and add a daily
 * time-driven trigger for the same function.
 */

var GIST_FILE = 'aj_rental_data.json';
var PLACE_FIELDS = 'rating,user_ratings_total,reviews';

function props_() {
  return PropertiesService.getScriptProperties();
}

function requireProp_(name) {
  var value = props_().getProperty(name);
  if (!value) throw new Error('Missing script property: ' + name);
  return value;
}

/**
 * Run this once to turn the shop name into a place id, then paste the result
 * into the GOOGLE_PLACE_ID script property. The short maps.app.goo.gl link
 * cannot be used directly: it resolves to a redirect page with no place data.
 */
function findPlaceId() {
  var key = requireProp_('GOOGLE_MAPS_API_KEY');
  var query = props_().getProperty('GOOGLE_PLACE_QUERY') || 'AJ เช่าเครื่องเกมส์ PS4 PS5';
  var url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    + '?input=' + encodeURIComponent(query)
    + '&inputtype=textquery&fields=place_id,name,formatted_address&key=' + key;
  var body = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
  if (body.status !== 'OK') throw new Error('Place search failed: ' + body.status + ' ' + (body.error_message || ''));
  body.candidates.forEach(function (candidate) {
    Logger.log(candidate.place_id + '  ' + candidate.name + '  ' + candidate.formatted_address);
  });
  return body.candidates;
}

function fetchGooglePlace_() {
  var key = requireProp_('GOOGLE_MAPS_API_KEY');
  var placeId = requireProp_('GOOGLE_PLACE_ID');
  var language = props_().getProperty('GOOGLE_REVIEW_LANGUAGE') || '';
  var url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + encodeURIComponent(placeId)
    + '&fields=' + PLACE_FIELDS
    + (language ? '&language=' + encodeURIComponent(language) : '')
    + '&reviews_no_translations=true'
    + '&key=' + key;
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var body = JSON.parse(response.getContentText());
  if (body.status !== 'OK') throw new Error('Place details failed: ' + body.status + ' ' + (body.error_message || ''));
  return body.result || {};
}

function fetchFacebookPage_() {
  var pageId = requireProp_('FACEBOOK_PAGE_ID');
  var token = requireProp_('FACEBOOK_PAGE_ACCESS_TOKEN');
  var version = props_().getProperty('FACEBOOK_GRAPH_VERSION') || 'v25.0';
  var url = 'https://graph.facebook.com/' + encodeURIComponent(version)
    + '/' + encodeURIComponent(pageId)
    + '?fields=followers_count';
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });
  var body = JSON.parse(response.getContentText() || '{}');
  if (response.getResponseCode() !== 200 || body.error) {
    var message = body.error && body.error.message ? body.error.message : response.getContentText();
    throw new Error('Facebook Page read failed: ' + response.getResponseCode() + ' ' + message);
  }
  if (body.followers_count == null) throw new Error('Facebook Page response has no followers_count');
  return body;
}

function gistHeaders_() {
  return {
    Authorization: 'token ' + requireProp_('GITHUB_TOKEN'),
    Accept: 'application/vnd.github+json'
  };
}

function readGist_() {
  var url = 'https://api.github.com/gists/' + requireProp_('GIST_ID');
  var response = UrlFetchApp.fetch(url, { headers: gistHeaders_(), muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Gist read failed: ' + response.getResponseCode());
  var gist = JSON.parse(response.getContentText());
  var file = gist.files && gist.files[GIST_FILE];
  if (!file) throw new Error('Gist has no file named ' + GIST_FILE);
  return JSON.parse(file.content || '{}');
}

function writeGist_(data) {
  var url = 'https://api.github.com/gists/' + requireProp_('GIST_ID');
  var payload = { files: {} };
  payload.files[GIST_FILE] = { content: JSON.stringify(data, null, 2) };
  var response = UrlFetchApp.fetch(url, {
    method: 'patch',
    headers: gistHeaders_(),
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() >= 300) {
    throw new Error('Gist write failed: ' + response.getResponseCode() + ' ' + response.getContentText());
  }
}

/**
 * Google returns at most five reviews and picks which ones itself. They are
 * quoted as written, so no translation happens here either.
 */
function mapReviews_(reviews) {
  return (reviews || []).map(function (review, index) {
    return {
      id: 'g_' + (review.time || index),
      active: true,
      name: String(review.author_name || '').trim(),
      source: 'google',
      stars: Number(review.rating) || 5,
      text: String(review.text || '').trim(),
      time: Number(review.time) || 0
    };
  }).filter(function (review) {
    return review.name && review.text;
  });
}

function syncSocialProof() {
  var place = fetchGooglePlace_();
  var facebookPage = null;
  try {
    facebookPage = fetchFacebookPage_();
  } catch (error) {
    // Google and Facebook are independent. Keep the last Facebook value and
    // still publish fresh Google data if Meta is unavailable or its token has
    // expired.
    Logger.log('Facebook follower sync skipped: ' + error.message);
  }
  var data = readGist_();
  var social = data.socialProof && typeof data.socialProof === 'object' ? data.socialProof : {};

  social.googleAuto = {
    rating: place.rating != null ? String(place.rating) : '',
    count: place.user_ratings_total != null ? String(place.user_ratings_total) : '',
    reviews: mapReviews_(place.reviews),
    syncedAt: new Date().toISOString()
  };
  if (facebookPage) {
    social.facebookAuto = {
      followers: String(facebookPage.followers_count),
      syncedAt: new Date().toISOString()
    };
  }

  data.socialProof = social;
  data.savedAt = new Date().toISOString();
  writeGist_(data);

  Logger.log('Synced rating ' + social.googleAuto.rating
    + ' from ' + social.googleAuto.count + ' ratings, '
    + social.googleAuto.reviews.length + ' reviews; Facebook followers '
    + (social.facebookAuto ? social.facebookAuto.followers : 'unchanged'));
  return { google: social.googleAuto, facebook: social.facebookAuto || null };
}

/** Adds the daily trigger. Safe to run twice; it clears its own duplicates. */
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'syncSocialProof') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('syncSocialProof').timeBased().everyDays(1).atHour(4).create();
  Logger.log('Daily trigger installed for 04:00');
}
