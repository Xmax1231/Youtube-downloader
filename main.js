const https = require('https');
const request = require('request');
const querystring = require('querystring');
const fs = require('fs');
const replaceall = require("replaceall");

var yt_v = process.argv[2];
var str = '';
var link=[];

if(!(yt_v)){
	console.log('你沒輸入目標齁？');
}else{
	if(yt_v.length==11){
		var yt_url = 'https://www.youtube.com/watch?v='+yt_v;
	}else{
		var yt_url = yt_v;
			yt_url = replaceall("youtu.be/","www.youtube.com/watch?v=",yt_url);
	}
	const req = https.get(yt_url, (res) => {

		res.on('data', (d) => {
			str += d.toString('utf8');
		});

		res.on('end', function(){
			var s = /ytplayer\.config = ({.*?});/.exec(str);
			var a = JSON.parse(s[1]);
			var title = a['args']['title'];
				title = replaceall("/",' ',title);
				title = replaceall("\\",' ',title);
				title = replaceall("*",' ',title);
				title = replaceall("?",' ',title);
				title = replaceall(":",' ',title);
				title = replaceall("\"",' ',title);
				title = replaceall("<",' ',title);
				title = replaceall(">",' ',title);
				title = replaceall("|",' ',title);
			var b = a['args']['url_encoded_fmt_stream_map'].split(",");
			for(i in b){
				var c = b[i].split("&");
				for(j in c){
					d=c[j].split("=");
					if(d[0]=='url'){
						link.push(querystring.parse(c[j]));
					}
				}
			}
			try {
				var x = 0;
				while((/mime=video%2Fmp4/.exec(link[x]['url'])==null)||(/signature/.exec(link[x]['url'])==null)){
					x++;
				}	
				request(link[x]['url']).pipe(fs.createWriteStream(`${title}.mp4`));
				//console.log(link[x]['url']);
				console.log(`${title}.mp4`);
			} catch (err) {
				console.log('Sorry .............');
			}
	    });

	}).on('error', (e) => {
		console.error(e);
	});
}
