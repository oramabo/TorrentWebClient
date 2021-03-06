// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
window.fs = require('fs');
window.http = require('https');
window.request = require("request");
window.gunzip = require('gunzip-file');
window.WebTorrent = require('webtorrent')
window.rarbg = require('rarbg-api');
window.srt2vtt = require('srt-to-vtt');
window.path = require('path');
window.dir = __dirname;
window.convert = require('./converter');
window.ffmpeg = require('fluent-ffmpeg');

const OS = require('opensubtitles-api');
window.settings = JSON.parse(fs.readFileSync("settings.json"));
window.OpenSubtitles = new OS({
    useragent:'SolEol v1.00',
    username: 'oramabo123',
    password: '791346',
    ssl: true
});
