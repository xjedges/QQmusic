// unsafeWindow.GM_getData=GM_getData
// var http = new XMLHttpRequest();
// function GM_getData(url,callback){
//     http.onreadystatechange = function() {
//         if (http.readyState == XMLHttpRequest.DONE) {
//             if(http.status==200){
//                 callback(http)
//             }else{
//                 callback(http)
//             }
//         }
//     }
//     http.open("GET", url)
//     http.send()
    
// }

GM_getData=function(){alert(1)}
GM_getData1=function(){alert(2)}
function API(){
	var head=$("head")
	var scriptNode=null
	searchCallBack=function(){}//search
	jsonCallback=function(){}//list
	JsonCallback=function(){}//rank
	var listAPI={
        url:"http://qzone-music.qq.com/fcg-bin/fcg_music_fav_getinfo.fcg?",
        option:{
        	dirinfo:0,//是否返回用户音乐列表名称与id
        	dirid:2,//QQ音乐用户的列表id
        	uin:582851997,//用户的QQ号码
        	p:0.987458083563218,//随机函数生成的随机数
        }
    }
    var searchAPI={
    	url:"http://shopcgi.qqmusic.qq.com/fcgi-bin/shopsearch.fcg?",
    	option:{
        	value:"",
        	artist:"",
        	type:"qry_song",
        	out:"json",
        	page_no:1,
        	page_record_num:60,
        	p:0.987458083563218,//随机函数生成的随机数
        }
    }
    var rankAPI={
    	random:"http://music.qq.com/musicbox/shop/v3/data/random/0/random67.js",
    	sell:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_sell.js",
    	newsong:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_newsong.js",
    	ch:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_ch.js",
    	eu:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_eu.js",
    	jk:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_jk.js",
    	all:"http://music.qq.com/musicbox/shop/v3/data/hit/hit_all.js",
    }
	this.getList=function(callback){
		jsonCallback=callback

		var src=listAPI.url

		// for(var i in setting)
		// 	if(listAPI.option[i]!=null)
		// 		listAPI.option[i]=setting[i];
		for(var i in listAPI.option)
			src+=i+"="+listAPI.option[i]+"&"

		if(scriptNode){scriptNode.remove(); scriptNode=null}


        scriptNode=$("script",{src:src});
        head.append(scriptNode);
	}
	this.getCover=function(albumid){
		return "http://imgcache.qq.com/music/photo/album_300/"+albumid%100+"/300_albumpic_"+albumid+"_0.jpg" //big size
		// return "http://imgcache.qq.com/music/photo/album/"+albumid%100+"/albumpic_"+albumid+"_0.jpg"
	}
	this.getLyric=function(songid,callback){
		var requestURL="http://music.qq.com/miniportal/static/lyric/"+songid%100+"/"+songid+".xml"
		GM_getData1(requestURL,function(http){
			if(http.status!=404){
				callback(LRCtoJSON(http.responseText))
			}else{
				callback()
			}
		})
	}
	this.getVideo=function(ID,callback){
		GM_getData("http://www.yinyuetai.com/video/"+ID,function(http){
			if(http.status!=404){
				var result=http.responseText.match(/hcVideoUrl : '(.*?)'/)
				if(result){
					callback(result[1]+"&rd=html5")
				}else{
					callback()
				}
			}else{
				callback()
			}
		})
	}
	this.getSong=function(data){
		if (data.url.indexOf("qqmusic.qq.com") > 0 && data.url.indexOf("wma") > 0) {
			if(data.idx!=null){
				var loc=10+parseInt(data.location)
			}else{
				var loc = parseInt(((data.url.split("/"))[2].split("."))[0].substring(6)) + 10;
			}
			return "http://stream" + loc + ".qqmusic.qq.com/" + (parseInt(data.id) + 30000000) + ".mp3";
		}
		return data.url
	}
	this.search=function(setting,callback){
		searchCallBack=function(data){
			data=convertSearchDataFormat(data)
			callback(data)
		}

		var src=searchAPI.url

		for(var i in setting)
			if(searchAPI.option[i]!=null)
				searchAPI.option[i]=setting[i];
		for(var i in searchAPI.option)
			src+=i+"="+searchAPI.option[i]+"&"

		if(scriptNode){scriptNode.remove(); scriptNode=null}


        scriptNode=$("script",{src:src});
        head.append(scriptNode);
	}
	this.getRank=function(name,callback){
		JsonCallback=function(data){
			data=convertRankDataFormat(data)
			callback(data)
		}

		var src=rankAPI[name]

		scriptNode=$("script",{src:src});
        head.append(scriptNode);
	}

	function convertRankDataFormat(data){
		var newData={SongList:[]}
		for(var i in data.songlist){
			var d=data.songlist[i]
			var _d={}
			for(var j in d){
				_d[j.toLowerCase().replace(/album/,"disk")]=d[j]
			}
			newData.SongList.push(_d)
		}
		return newData
	}
	function convertSearchDataFormat(data){
		var newData={SongList:[]}
		for(var i in data.songlist){
			var d=data.songlist[i]
			var _d={}
			for(var j in d){
				_d[j.replace(/_/,"").replace(/album/,"disk").replace(/songid/,"id")]=d[j].replace(/&acute;/,"'")
			}
			_d.playtime=0
			_d.url="http://stream12.qqmusic.qq.com/"+d.song_id+".wma"
			newData.SongList.push(_d)
		}
		return newData
	}
	function LRCtoJSON(str){
		var lyric=[]
		function getLine(){
			var result=str.match(/\[([\d:\.]*)\]([^\[\]]*)/)
			if(result){
				if(result[2].length>2){
					var time=result[1].match(/(\d*):(\d*)\.(\d*)/)
					time=parseInt(time[1])*60+parseInt(time[2])+parseInt(time[3])*0.01
					lyric.push([time,result[2]])
				}
				str=str.substring(result.index+result[0].length)
				getLine()
			}
		}
		getLine()
		return lyric
	}
	this.getSinger=function(singerid){
		return "http://imgcache.qq.com/music/photo/singer/"+singerid%100+"/singerpic_"+singerid+"_0.jpg"
	}
	return this
}