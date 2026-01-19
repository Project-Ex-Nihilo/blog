// types.js

/**
 * @typedef {Object} Post
 * @property {{br: string, en: string}} title
 * @property {{br: string, en: string}} description
 * @property {string} author
 * @property {string} reading_time
 * @property {string} date
 * @property {string} route
 * @property {string} path
 * @property {string[]} tag
 */

/**
 * @typedef {Object<string, {br: string, en: string}>} TagMap
 */

/**
 * @typedef {Object} MetaData
 * @property {Post[]} posts
 * @property {TagMap} tags
 */