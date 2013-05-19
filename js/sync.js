// http://174.133.80.170/api/docs/
function Sync(appName,key){
	var action=[]
	var base64 = new Base64();
	// var localData=JSON.parse(window.localStorage.getItem("sync")) || {
	// 	version:0,
	// 	since:0,
	// };
	var param=(function(){
		var account={
			username:"xjedgeshotmail",
			// username:"xiejun",
			password:"qazwsxedc",
			apikey:key,
		}
		var param=""
		for(var i in account){
			param+=i+"="+account[i]+"&"
		}
		return param
	})();
	// this.sync=function(msg,callback){
	// 	// this.getWebVersion(function(version){
	// 	// 	DD(version)
	// 	// })
	// 	// this.setWebVersion(5)
	// 	this.get(function(webData){
	// 		// eval("var list="+data.data)
	// 		if(webData.version>localData.version){
	// 			localData.version=webData.version
	// 			callback(webData.data)
	// 			this.save()
	// 		}else if(webData.version<localData.version){
	// 			this.delete(webData.version,webData.packageNum,function(){
	// 				callback(false)
	// 				this.send(localData.version,msg)
	// 			})
	// 		}else{
	// 			callback(false)
	// 			DD("the same version")
	// 		}
	// 	})
	// }
	this.download=function(callback){
		this.get(function(webData){
			callback(unpack(webData))
		})
	}
	this.upload=function(msg,callback){
		this.get(function(webData){
			this.delete(webData,function(){
				this.send(msg)
			})
		})
	}
	// this.save=function(){
	// 	window.localStorage.setItem("sync",JSON.stringify(localData));
	// }
	this.send=function(msg){
		var dataPackage=pack(msg)
		var i=-1
        function send(){
        	i++
        	if(i<dataPackage.length){
	        	var id=appName+"_"+i
				GM_getData("https://readitlaterlist.com/v2/add?"+param+"url="+dataPackage[i]+"&title="+id,function(http){
				    console.log("send "+id)
				    send()
				})
	        }else{
	        	console.log("send package["+dataPackage.length+"] over")
	        }
        }
        if(dataPackage.length>0){
        	console.log("send package["+dataPackage.length+"] start")
        	send();
        }
		
	}
	this.delete=function(webData,callback){
		var i=-1
		if(webData.length>0){
        	dataDelete()
        	console.log("delete package["+webData.length+"] start")
        }else{
        	console.log("delete package["+webData.length+"] over")
        	callback()
        }
		function dataDelete(){
			i++
        	if(i<webData.length){
	        	var sender='{"0":{"url":"http://'+webData[i].data+'"}}'
				
				GM_getData(
					"https://readitlaterlist.com/v2/send?"+param+"read="+sender,
					function(http){
				    console.log("delete qqmusic_"+i)
				    dataDelete()
				})
	        }else{
	        	console.log("delete package["+webData.length+"] over")
	        	callback()
	        }
		}
		// for(var i in webData){
		// 	sender[i]={url:"http://"+webData[i]}
		// }
		// GM_getData("https://readitlaterlist.com/v2/send?"+param+"read="+JSON.stringify(sender),function(http){
		//     callback()
		// })
	}
	// this.stats=function(callback){
	// 	GM_getData("https://readitlaterlist.com/v2/stats?"+param,function(http){
	// 	    eval("var data="+http.responseText)
	// 	    JJ(data)
	// 	})
	// }
	this.get=function(callback){
		GM_getData("https://readitlaterlist.com/v2/get?"+param+"myAppOnly=1&since=1360230926&state=unread",function(http){
		    eval("var data="+http.responseText)
		    var newData=[]
		    for(var i in data.list){
		    	var d=data.list[i]
	    		var regRex=d.title.match(/(\d+)/)
	    		if(regRex && regRex[1]!=null){
			    	newData.push({
			    		data:d.url.slice(7),
			    		pack:parseInt(regRex[1]),
			    	})
			    }else{
			    	DD("error")
			    	JJ(d)
			    }
			}
		    callback(newData)
		    	// newData,data:unpack(newData)
		    
		})
	}
	function pack(msg){
		var str=base64.encode(msg)
		var dataPackage=[]
		while(str.length>0){
			dataPackage.push(str.slice(0,8000))
			str=str.slice(8000)
		}
		return dataPackage
	}
	function unpack(data){
		var dataStr=""
		data=data.sort(function(a,b){
			return a.pack-b.pack
		})
		for(var i in data){
			dataStr+=data[i].data
		}
		dataStr=dataStr.replace(/\s/g,"+")
		dataStr=base64.decode(dataStr)
		return dataStr
	}
	return this
}


/**
*
*  Base64 encode / decode
*
*  @author haitao.tu
*  @date   2010-04-26
*  @email  tuhaitao@foxmail.com
*
*/
 
function Base64() {
 
	// private property
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
 
	// public method for encoding
	this.encode = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
 
	// public method for decoding
	this.decode = function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}
 
	// private method for UTF-8 encoding
	_utf8_encode = function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	}
 
	// private method for UTF-8 decoding
	_utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}