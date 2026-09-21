// types.js

/**
 * @typedef {Object} Post
 * @property {{pt: string, en: string}} title
 * @property {{pt: string, en: string}} description
 * @property {string} author
 * @property {string} reading_time
 * @property {string} date
 * @property {string} route
 * @property {string} path
 * @property {string[]} tag
 * @property {boolean} [draft]
 */

/**
 * @typedef {Object<string, {pt: string, en: string}>} TagMap
 */

/**
 * @typedef {Object} MetaData
 * @property {Post[]} posts
 * @property {TagMap} tags
 */
