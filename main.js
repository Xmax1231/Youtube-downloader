const https = require('https');
const request = require('request');
const fs = require('fs');

var file_type = '';
var yt_v = process.argv[2];
var type_sw = process.argv[3]||"type";
    type_sw = new RegExp(type_sw, 'i');
var str = '';
var link=[];
var signature=[];
var type=[];

if(!(yt_v)){
    console.log('你沒輸入目標齁？');
}else{
    if(yt_v.length==11){
        var yt_url = 'https://www.youtube.com/watch?v='+yt_v;
    }else{
        var yt_url = yt_v;
    }
    const req = https.get(yt_url, (res) => {

        res.on('data', (d) => {
            str += d.toString('utf8');
        });

        res.on('end', function(){
            var s = /ytplayer\.config = ({.*?});/.exec(str);
            var a = JSON.parse(s[1]);
            var title = a['args']['title'];
                title = title   .replace(/\//g,' ')
                                .replace(/\\/g,' ')
                                .replace(/\*/g,' ')
                                .replace(/\?/g,' ')
                                .replace(/\:/g,' ')
                                .replace(/\"/g,' ')
                                .replace(/\</g,' ')
                                .replace(/\>/g,' ')
                                .replace(/\|/g,' ');
            var OAO = a['args']['url_encoded_fmt_stream_map']+","+a['args']['adaptive_fmts'];
            var b = OAO.split(",");
            for(i in b){
                var c = b[i].split("&");
                for(j in c){
                    d=c[j].split("=");
                    if(d[0]=='url'){
                        link.push(unescape(d[1]));
                    }
                    if(d[0]=='s'){
                        re_d=[...d[1]];
                        let tmp = re_d[re_d.length-1];
                        re_d[re_d.length-1] = re_d[re_d.length-28];
                        re_d[re_d.length-28] = tmp;
                        signature.push(re_d.join(""));
                    }
                    if(d[0]=='type'){
                        type.push(unescape(d[1]));
                    }
                }
            }
            try {
                if(type_sw.exec('type')!=null){
                    for(let x=0;x<type.length;x++){
                        console.log(type[x]);
                    }
                }else{
                    var x=0;
                    while(type_sw.exec(type[x])==null){
                        x++;
                    }
                    if(type_sw.exec('video/mp4')==null){
                        file_type = "mp3";
                    }else{
                        file_type = "mp4";
                    }
                    if(signature.length==0){
                        console.log(`${title}.${file_type}`);
                        request(link[x]).pipe(fs.createWriteStream(`./NEW/${title}.${file_type}`));
                    }else{
                        console.log(`${title}.${file_type}`);
                        request(link[x]+'&signature='+signature[x]).pipe(fs.createWriteStream(`./NEW/${title}.${file_type}`));
                    }
                }
            } catch (err) {
                console.log('Sorry .............');
            }
        });

    }).on('error', (e) => {
        console.error(e);
    });
}
