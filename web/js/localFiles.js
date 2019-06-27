results = {};
var walk = function (dir, done) {
    var mainPath = dir;
    
    fs.readdir(dir, function (err, list) {
        console.log("dir scaned:" ,mainPath);
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            var filename;
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                console.log("dir scaned:" ,file);
                if (stat && stat.isDirectory()) {
                    filename = file.substring(file.lastIndexOf('/')+1);

                    fs.readdir(file, function (err, list) {
                        if(  !results[filename] && /.mp4/.test(list.toString()))
                            results[filename] = {"subs":{},"image":""};
                        for( name of list){
                            if(name != "RARBG.mp4"){
                                if (/.mp4/.test(name) ){
                                    console.log("mp4 found:" ,name);
                                    results[filename]["moviePath"] = `${mainPath}/${filename}/${name}`;
                                }
                                if (  results[filename] && /.srt/.test(name)){
                                    let newName = name.replace('.srt','.vtt');
                                    if(!fs.existsSync(`${mainPath}/${filename}/${newName}`)){
                                        fs.createReadStream(`${mainPath}/${filename}/${name}`)
                                        .pipe(srt2vtt())
                                        .pipe(fs.createWriteStream(`${mainPath}/${filename}/${newName}`));
                                    }
                                    if(results[filename] && /he/.test(newName)){
                                        results[filename]["subs"]["he"] = `${mainPath}/${filename}/${newName}`;
                                    }else{
                                        results[filename]["subs"]["en"] = `${mainPath}/${filename}/${newName}`;
                                    }
                                }
                                if ( results[filename] &&  /.png|.jpg|.jpeg/.test(name)){
                                    results[filename].image  = `${mainPath}/${filename}/${name}`;
                                }
                            }
                        }
                    if (!--pending) done(null, results);
                    
                    });
                }
            });
        });
    });
};

function initMovies(dir) {
    results = {};
    walk(dir, function(err, results) {
        if (err) throw err;
        console.log(results,results.length);
        let i = 0;
        let row = 1;
        for( obj in results ){
            var data = results[obj];
            if( i % 6 == 0){
                row++;
                $(`<div class="browse-inner index${row}"></div>`).appendTo('#movieWraper ');
                
            }
            var card=`
                <div class="col-md-2 w3l-movie-gride-agile movie">
                    <a href="#" data-fullName="${obj}" data-name="${obj.replace(/([\.\w']+?)(\.[0-9]{4}\..*)/ ,'$1').replace(/\./g, " ") }" data-path="${data.moviePath}" data-toggle="modal" data-target="#myModal" class="hvr-shutter-out-horizontal openPopup"><img src="${data.image? data.image : 'images/noimg.png'}" title="album-name"
                            alt=" " />
                        <div class="w3l-action-icon"><i class="fa fa-play-circle" aria-hidden="true"></i></div>
                    </a>
                    <div class="mid-1">
                        <div class="w3l-movie-text">
                            <h6><a class="openPopup"  data-fullName="${obj}" data-toggle="modal" data-target="#myModal"  data-path="${data.moviePath}" href="#">${obj.replace(/([\.\w']+?)(\.[0-9]{4}\..*)/ ,'$1').replace(/\./g, " ") }</a></h6>
                        </div>
                        <div class="mid-2">
                            <p></p>
                        </div>
                        </div>
                </div>`;
            $(card).appendTo(`#movieWraper .browse-inner.index${row}`);
            if( i == 6 )
                i=1
            else
                i++;
        }
        $(`#movieWraper .browse-inner`).append('<div class="clearfix"> </div>');
    });

};
$('body').delegate('#myModal', 'show.bs.modal', (e)=>{
    console.log("open");
    let modal = $(e.target);
    let cur = $(document.activeElement)
    let path = cur.data('path');
    let name = cur.data('name');
    let movie = results[cur.data('fullname')];
    let player = $('#myModal #moviePlayer video');
    modal.find('.modal-header .title').text(name);
    player.find('source').attr('src',path);
    if(movie.subs){
        let subs = movie.subs;
        for(let sub in subs){
            player.append(`<track kind="subtitles" ${sub == 'he'? "default":""} srclang="${sub}" src="${subs[sub]}"/>`)
        }
    }
    else{
        //getSubs();
    }
    player[0].load();
    player[0].play();
});
$('body').delegate('#myModal', 'hide.bs.modal', (e)=>{

    let player = $('#myModal #moviePlayer video');

    player[0].pause();
});


$('body').delegate('.prevent', 'click', (e)=>{
    e.preventDefault();
});

$('body').delegate('#convertAll', 'click', (e)=>{
    window.convert.runAll(window.settings.paths.movie);

});

$('body').delegate('#settings', 'show.bs.modal', (e)=>{
    let movieInp = $('#moviePath');
    let tvInp = $('#tvPath');
    let disneyInp = $('#disneyPath');
    movieInp.val( window.settings.paths.movie);
    tvInp.val( window.settings.paths.tv );
    disneyInp.val( window.settings.paths.disney );
});

$('body').delegate('#settings', 'hide.bs.modal', (e)=>{
    let movieInp = $('#moviePath');
    let tvInp = $('#tvPath');
    let disneyInp = $('#disneyPath');
    window.settings.paths.movie = movieInp.val( );
    window.settings.paths.tv = tvInp.val( );
    window.settings.paths.disney = disneyInp.val( );
    fs.writeFileSync(window.dir +"/settings.json",JSON.stringify(window.settings));
});
$('body').delegate('#pathConvert', 'hide.bs.modal', (e)=>{
    let path = $('#convertPath').val();
    if(path)
        window.convert.run(path).then(()=>{
            $('.alert-success').removeClass('hide');
            setTimeout(()=>{
                $('.alert-success').addClass('hide');
            },5000)
            console.log("done!");
        }).catch((e)=>{
            console.log('error',e);
        });
});

$('body').delegate('.nenu-item', 'click', (e)=>{
    e.preventDefault();
    switch($(e.target).data('page')){
        case 'disney':
            initMovies(window.settings.paths.disney);
            break;
        default:
            break;
    }
    
});


function main() {
    initMovies( window.settings.paths.movie );
}
main();