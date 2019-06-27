const hbjs = require('handbrake-js')
const fs = require('fs')


async function convert(path) {
    console.log("converting",path)
    return new Promise(function (resolve, reject) {
        hbjs.spawn({
                input: path,
                output: path.substring(0, path.lastIndexOf('.')) + '.mp4',
            })
            .on('error', err => {
                // invalid user input, no video found etc
                reject(err);
            })
            .on('begin', () => {
                console.dir("started!");
            })
            .on('progress', progress => {
                //if(Number.isInteger( progress.percentComplete) )
                console.dir(
                    `Percent complete: ${progress.percentComplete}, ETA: ${progress.eta}`,
                )
            }).on("complete", res => {
                console.dir("finish!");
                fs.unlink(path, function (err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.dir('File deleted!');
                    resolve("ok");
                });
            });
    });
}

async function convertAll(rootPath) {
    
    let files = await fs.readdir(rootPath, async function (err, list) {
        let results = [];
        console.log("dir scaned:", rootPath);
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(async function (file) {
            file = path.resolve(rootPath, file);
            fs.stat(file, async function (err, stat) {
                fs.readdir(file, async function (err, list) {
                    for (name of list) {
                        if (/.mkv|.avi/.test(name)) {
                            await convert(file+'/'+name);
                        }
                    }
                    if (!--pending) done(null, results);
                });
            });
        });
    });
}


// convert('resolve').then(()=>{
//     console.log("after")
// }).catch(e =>{
//     console.log(e)
// })

module.exports = {
    "run": convert,
    "runAll": convertAll
}