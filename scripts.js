//var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';


// HTML elements
rarbg = window.rarbg;
parseTorrent = window.parseTorrent;
os =window.OpenSubtitles;
client = new window.WebTorrent();
var $body = document.body
var $progressBar = document.querySelector('#progressBar')
var $numPeers = document.querySelector('#numPeers')
var $downloaded = document.querySelector('#downloaded')
var $total = document.querySelector('#total')
var $remaining = document.querySelector('#remaining')
var $uploadSpeed = document.querySelector('#uploadSpeed')
var $downloadSpeed = document.querySelector('#downloadSpeed')
os.login()
    .then(res => {
        console.log(res.token);
        console.log(res.userinfo);
    })
    .catch(err => {
        console.log(err);
    });
searchTorrents();
async function getSubs(movieName){
    os.search({	
        sublanguageid: 'heb',       // Can be an array.join, 'all', or be omitted.
          // Total size, in bytes.
            //   is included.
        extensions: ['srt', 'vtt'], // Accepted extensions, defaults to 'srt'.
        limit: '3',                 // Can be 'best', 'all' or an
                                    // arbitrary nb. Defaults to 'best'            // Number of frames per sec in the video.
        query: movieName,   // Text-based query, this is not recommended.
        gzip: true                  // returns url to gzipped subtitles, defaults to false
    }).then((s)=>{
        if(s.he){
            var subs = s.he[0];
                var fileUrl =subs.vtt;
                var output = "subs/" + movieName +".vtt";
                request({url: fileUrl, encoding: null}, function(err, resp, body) {
                if(err) throw err;
                fs.writeFile(output, body, function(err) {
                    console.log("file written!");
                    var track = `<track label="${subs.filename}" kind="subtitles" srclang="he" src="subs/${movieName}.vtt" default>`
                    $('#output .video video').append(track);
                });
                });
                     
            }
            console.log(s)
    });
}
async function searchTorrents(){    
    
    rarbg.list( {
      sort: 'seeders',
      category: rarbg.CATEGORY.MOVIES_X264,
      limit : 100
    }).then(data => {
        var output = $("#searchOutput > div")
        output.html('');
        let i = 0;
        for (movie of data){
            if(i % 3 == 0){
                output.append(`<div class="row row${i}">`);
                var curRow = `.row${i}`;
            }
            var li = `<div class="card" style="width: 18rem;">
            <img src="#" class="card-img-top" alt="...">
            
            <div class="card-body">
                <h5>${movie.title}</h5>
                <p class="card-text" >
                    category : ${movie.category}
                    leechers : ${movie.leechers}
                    seeders  : ${movie.seeders}
                    size     : ${prettyBytes(movie.size) }
                </p>
            <a class="startDownload btn btn-primary" Data-link="${movie.download}">Watch now</a>
            </div>
            </div>`;
            output.find(curRow).append(li);
            i++;
        }
    })
}
$('body').delegate(".startDownload","click",(e)=>{
    e.preventDefault();
    let link = $(e.target).data("link");
    downloadTorrent(link);
})




function downloadTorrent(torrentId) { 
    
    console.log('torrentId: ' + torrentId)
    for (t of client.torrents )
        client.remove(t.magnetURI);
    client.add(torrentId, function (torrent) {
        console.log(torrent);
        // Torrents can contain many files. Let's use the .mp4 file
        var file = torrent.files.find(function (file) {
            let ext = /.mp4|.mkv/;
            if( ext.test(file.name)){
                return file;
            }
            else
                return false;
        })
        client.on('error', function (err) {
            console.error('ERROR: ' + err.message)
          })
        // Stream the file in the browser
        if (file){
            $('#output .video').html('');
            file.appendTo('#output .video');
            getSubs(file.name);

        }
        else{
            alert("not supported file ");
        }
    
        // Trigger statistics refresh
        torrent.on('done', onDone);
        setInterval(onProgress, 500);
        onProgress();
        function onProgress() {
            // Peers
            $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers')
    
            // Progress
            var percent = Math.round(torrent.progress * 100 * 100) / 100
            $progressBar.style.width = percent + '%'
            $downloaded.innerHTML = prettyBytes(torrent.downloaded)
            $total.innerHTML = prettyBytes(torrent.length)
    
            // Remaining time
            var remaining
            if (torrent.done) {
                remaining = 'Done.'
            } else {
                remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
                remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
            }
            $remaining.innerHTML = remaining
    
            // Speed rates
            $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s'
            $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'
        }
    
        function onDone() {
            $body.className += ' is-seed'
            onProgress()
        }
        
    
    }); 
}
function prettyBytes(num) {
    var exponent, unit, neg = num < 0,
        units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    if (neg) num = -num
    if (num < 1) return (neg ? '-' : '') + num + ' B'
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = Number((num / Math.pow(1000, exponent)).toFixed(2))
    unit = units[exponent]
    return (neg ? '-' : '') + num + ' ' + unit
}



