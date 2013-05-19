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
	var self=$("div",{id:"media"})
	var video=$("video",{cls:"video"})
	var audio=$("audio")
    self.append(
    	audio,
    	video
    )
	var mode=option.get("playMode")
	var volume=option.get("volume")
	var muted=false
	var state="ended"
	var media=audio
	var randomList=RandomList()
	addListener(video)
	addListener(audio)
	self.index=-1
	
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
			load(songList.data[self.index])
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
		if(mode=="unorder" && value!="unorder")
			randomList.reset();
		mode=value
	}
	self.stop=function(){
		if(media.hasClass("video"))gallery.removeClass("video");
		try{
			media.pause()
			media.currentTime = 0
		}catch(e){}
		self.index=-1
	}
	self.setProgress=function(ratio){
		media.currentTime = media.duration * ratio;
	}
	self.setVolume=function(ratio){
		media.volume = ratio;
		volume = ratio;
	}
	self.getMuted=function(){
		return media.muted
	}
	self.setMuted=function(value){
		media.muted = value;
		muted=value;
	}
	function load(data){
		if(data.mv && videoModeBtn.hasClass("video")){
			video.src=data.mv
			media=video
		}else{
			audio.src=api.getSong(data)
			media=audio
		}
		media.volume=volume
		media.muted=muted
	}
	function addListener(_media){
		_media.addEventListener("progress",function(){
			try{
				var bufferPos=media.buffered.end(0)
				var radio=bufferPos/media.duration
				
				if(radio<=1)timeBar.setBufferProgress(radio);
			}catch(e){}
		})
		_media.addEventListener("playing",function(){
			if(songList.data[self.index].playtime==0){
				songList.setPlayTime(self.index,Math.floor(media.duration))
			}
			if(media.tagName=="VIDEO"){
				gallery.addClass("video");
			}
			state="playing"
			playBtn.addClass("pause")
			gallery.removeClass("pause")
			pageTitle.play()
		})
		_media.addEventListener("pause",function(){
			state="pause"
			playBtn.removeClass("pause")
			gallery.addClass("pause")
			pageTitle.pause()
		})
		_media.addEventListener("error",function(){
			if(state!="error"){
				state="error"
				var currentTime=media.currentTime
				load(songList.data[self.index])
				media.play()
			}
		})
		_media.addEventListener("ended",function(){
			if(media.hasClass("video"))gallery.removeClass("video");
			if(state!="ended"){
				state="ended"
				pageTitle.pause()
				self.next()
				playBtn.removeClass("pause")
			}
		})
		_media.addEventListener("timeupdate",function(){
			var lCurPos = Math.floor(media.currentTime);
			var lTotal = Math.floor(media.duration);

			timeBar.setProgress(lCurPos/lTotal,lCurPos);
			lyricBox.update(media.currentTime)
		})
		_media.onclick=function(){
			self.play()
		}
	}
	return self
}