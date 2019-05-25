// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const jq = require('jquery');
window.fs = require('fs');
window.http = require('https');
window.request = require("request");
window.gunzip = require('gunzip-file');
window.WebTorrent = require('webtorrent')
window.parseTorrent = require('parse-torrent');
window.rarbg = require('rarbg-api');
const OS = require('opensubtitles-api');
window.OpenSubtitles = new OS({
    useragent:'SolEol v1.00',
    username: 'oramabo123',
    password: '791346',
    ssl: true
});
