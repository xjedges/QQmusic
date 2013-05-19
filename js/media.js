function Video(){
	var self=$("video",{cls:"video"})
	return self
}
function RandomList(){
	var self={}
	var list=[]
	var listIndex=-1
	self.reset=function(index){
		if(index && index!=list[listIndex]){
			list=[index]
			listIndex=0
		}
	}
	self.getNextIndex=function(){
		if(listIndex+1<=list.length-1){
			listIndex++
			return list[listIndex]
		}else{
			var index=random()
			list.push(index)
			listIndex=list.length-1
			return index
		}
	}
	self.getPrevIndex=function(){
		if(listIndex-1>=0){
			listIndex--
			return list[listIndex]
		}else{
			var index=random()
			list.unshift(index)
			listIndex=0
			return index
		}
	}
	function random(){
		var index=Math.floor(Math.random()*songList.data.length)
		if(index==self.index){
			return random()
		}else{
			return index
		}
	}
	return self
}
function Media(){
	var self={}
	var mode=option.get("playMode")
	var state="ended"
	var volume=option.get("volume")
	var muted=false
	var randomList=RandomList()
	self.index=-1
	var media
	
	self.play=function(){
		if(self.index==-1){
			self.switch(option.get("curIndex"))
		}else if(media.paused || state=="ended"){
			media.play()
		}else if(!media.paused){
			media.pause()
		}
	}
	self.switch=function(index){
		if(self.index==index){
			self.play()
		}else if(index>=0 && index<songList.data.length){
			if(mode=="unorder"){
				randomList.reset(index)
			}
			self.stop()
			self.index=index
			option.set("curIndex",index)
			self.load(songList.data[self.index])
			media.play()
			gallery.switchAlbum(self.index)
			playListBox.roll(self.index)
			lyricBox.getData(songList.data[self.index].id)
		}
	}
	self.next=function(){
		switch(mode){
			case "cycleSingle":
				self.stop()
				self.play()
				break;
			case "cycle":
				self.switch(self.index==songList.data.length-1?0:(self.index+1))
				break;
			case "order":
				self.switch(self.index+1)
				break;
			case "unorder":
				self.switch(randomList.getNextIndex())
				break;
		}
	}
	self.prev=function(){
		switch(mode){
			case "cycleSingle":
				self.stop()
				self.play()
				break;
			case "cycle":
			case "order":
				self.switch(self.index-1)
				break;
			case "unorder":
				self.switch(randomList.getPrevIndex())
				break;
		}
	}
	self.setMode=function(value){
		if(mode=="unorder" && value!="unorder"){
			randomList.reset()
		}
		mode=value
	}
	self.load=function(data){
		if(option.get("video") && data.mv && videoModeBtn.hasClass("video")){
			video.src=data.mv
			// video.load()
			media=video
			addListener()
		}else{
			var audio=new Audio()
			audio.volume=volume
			audio.muted=muted
			audio.src=api.getSong(data)
			// audio.load()
			media=audio
			addListener()
		}
	}
	self.stop=function(){
		if(media!=null){
			if(media.hasClass("video"))gallery.removeClass("video");
			try{
				media.pause()
				media.currentTime = 0
			}catch(e){}
		}
		self.index=-1
	}
	self.setProgress=function(ratio){
		media.currentTime = media.duration * ratio;
	}
	self.setVolume=function(ratio){
		if(media!=null){
			media.volume = ratio;
		}
		volume=ratio
	}
	self.getMuted=function(){
		return muted
	}
	self.setMuted=function(value){
		if(media!=null){
			media.muted = value;
		}
		muted=value
	}
	function addListener(){
		media.addEventListener("progress",function(){
			try{
				var bufferPos=media.buffered.end(0)
				var radio=bufferPos/media.duration
				
				if(radio<=1)timeBar.setBufferProgress(radio);
			}catch(e){}
		})
		media.addEventListener("playing",function(){
			if(songList.data[self.index].playtime==0){
				songList.setPlayTime(self.index,Math.floor(media.duration))
			}
			if(option.get("soundVisual") && !media.hasClass("video"))soundVisual.play(media);
			if(media.hasClass("video")){
				gallery.addClass("video");
			}
			state="playing"
			playBtn.addClass("pause")
			gallery.removeClass("pause")
			pageTitle.play()
		})
		media.addEventListener("pause",function(){
			state="pause"
			playBtn.removeClass("pause")
			gallery.addClass("pause")
			pageTitle.pause()
		})
		media.addEventListener("error",function(){
			if(state!="error"){
				state="error"
				var currentTime=media.currentTime
				self.load(songList.data[self.index])
				media.play()
				// media.currentTime=currentTime
				// console.log(media.error.code,media.currentTime)
			}
			// 
		})
		media.addEventListener("ended",function(){
			if(media.hasClass("video"))gallery.removeClass("video");
			if(state!="ended"){
				state="ended"
				pageTitle.pause()
				self.next()
				playBtn.removeClass("pause")
			}
		})
		media.addEventListener("seeked",function(){
		})
		media.addEventListener("timeupdate",function(){
			var lCurPos = Math.floor(media.currentTime);
			var lTotal = Math.floor(media.duration);

			timeBar.setProgress(lCurPos/lTotal,lCurPos);
			lyricBox.update(media.currentTime)
		})
		media.onclick=function(){
			self.play()
		}
	}
	return self
}
function SoundVisual(){
	var self=$("canvas",{cls:"soundVisual"})
	var ctx = self.getContext('2d');
	var context = new webkitAudioContext();
	var analyser = context.createAnalyser();
	var source = null;
	var curAudio=null
	window.onresize=self.resize
	self.play=function(audio){
		if(curAudio!=audio){
			curAudio=audio
			self.resize()
		    source = context.createMediaElementSource(audio);
		    source.connect(analyser);
		    analyser.connect(context.destination);
		    jsProcessor = context.createJavaScriptNode(2048 /*bufferSize*/, 1 /*num inputs*/, 1 /*num outputs*/);
			jsProcessor.onaudioprocess=render
			jsProcessor.connect(context.destination);
		}
	}
	self.stop=function(){
	    source.disconnect(0);
	    jsProcessor.disconnect(0);
	    analyser.disconnect(0);
	    ctx.clearRect(0, 0, self.width, self.height);
	}
	self.resize=function(){
		self.width=gallery.width()
		self.height=80
		ctx.clearRect(0, 0, self.width, self.height);
		ctx.fillStyle="#4488ff";
	}
	function render() {
		var freqByteData = new Uint8Array(analyser.frequencyBinCount);

		if (false) {
		  analyser.getByteTimeDomainData(freqByteData);
		} else {
		  analyser.getByteFrequencyData(freqByteData);
		}

		const SPACER_WIDTH = 5;//colWidth_ + 1;
		const numBars = Math.round(self.width / SPACER_WIDTH);

		ctx.clearRect(0, 0, self.width, self.height);

		// freqByteData = freqByteData.subarray(0);

		for (var i = 0; i < numBars /*freqByteData.length*/; ++i) {
			if(numBars>160){
				var magnitude1 = freqByteData[i];
				var magnitude2 = freqByteData[numBars-1-i];
				ctx.fillRect(i * SPACER_WIDTH, self.height, 4, -Math.max(magnitude1,magnitude2)/4);
			}else{
				var magnitude1 = freqByteData[i];
				ctx.fillRect(i * SPACER_WIDTH, self.height, 4, -magnitude1/4);

			}
		}
	};
	return self
}