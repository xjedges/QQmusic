function PlayBox(){
	var self=$("div",{cls:"playBox"})
	playBtn=$("div",{cls:"playBtn UI"})
	nextBtn=$("div",{cls:"nextBtn UI"})
	prevBtn=$("div",{cls:"prevBtn UI"})
	modeBtn=ModeBtn();
	volumeBtn=$("div",{cls:"volumeBtn UI"})
	var dragger=$("div",{cls:"dragger"})
	playBtn.onclick=function(){
		media.play()
	}
	volumeBtn.onclick=function(){
		if(media.getMuted()){
			volumeBtn.removeClass("mute")
			media.setMuted(false)
		}else{
			volumeBtn.addClass("mute")
			media.setMuted(true)
		}
	}
	nextBtn.onclick=function(){
		media.next()
	}
	prevBtn.onclick=function(){
		media.prev()
	}
	timeBar=TimeBar()
	volumeBar=VolumeBar()
	self.append(
		dragger,
		playBtn,
		nextBtn,
		prevBtn,
		modeBtn,
		volumeBtn,
		timeBar,
		volumeBar
	)
	if(option.get("video")){
		videoModeBtn=$("div",{cls:"videoModeBtn video"})
		self.append(videoModeBtn)
		videoModeBtn.onclick=function(){
			if(videoModeBtn.hasClass("video")){
				videoModeBtn.removeClass("video")
			}else{
				videoModeBtn.addClass("video")
			}
			var curIndex=media.index
			media.stop()
			media.switch(curIndex)
		}
	}
	dragger.drag({
		limit:{obj:wrap},
		magnet:120,
		container:self,
		down:function(){
			bottomTab.css({opacity:0.5})
		},
		move:function(){
			gallery.resize(playBox.offsetTop+playBox.height(),playBox.offsetTop)
			bottomTab.css({height:"-webkit-calc(100% - "+this.dragInfo.pos.y+"px)"})
			self.top(this.dragInfo.pos.y);
			var scale=this.dragInfo.pos.y/495
			if(this.dragInfo.pos.y!=0 && this.dragInfo.pos.y+this.height()!=wrap.height()){
				wrap.removeClass("maximumBottom")
				wrap.removeClass("maximumTop")
			}
		},
		up:function(){
			gallery.resize(playBox.offsetTop+playBox.height(),playBox.offsetTop,true)
			bottomTab.css({height:"-webkit-calc(100% - "+this.dragInfo.pos.y+"px)",opacity:1})
			self.top(this.dragInfo.pos.y);
			
			if(this.dragInfo.pos.y==0){
				wrap.addClass("maximumBottom")
			}else if(this.dragInfo.pos.y+this.height()==wrap.height()){
				wrap.addClass("maximumTop")
				playListBox.roll()
				lyricBox.roll()
			}else{
				wrap.removeClass("maximumBottom")
				wrap.removeClass("maximumTop")
				option.set("playBoxTop",this.dragInfo.pos.y)
			}
		}
	})
	return self
}
function ModeBtn(){
	var opt=[
		{cls:"order",callback:function(){
			media.setMode("order")
			option.set("playMode","order")
		}},
		{cls:"unorder",callback:function(){
			media.setMode("unorder")
			option.set("playMode","unorder")
		}},
		{cls:"cycleSingle",callback:function(){
			media.setMode("cycleSingle")
			option.set("playMode","cycleSingle")
		}},
		{cls:"cycle",callback:function(){
			media.setMode("cycle")
			option.set("playMode","cycle")
		}},
	]
	var index=-1
	var playMode=option.get("playMode")
	for(var i=0;i<opt.length;i++){
		if(opt[i].cls==playMode){
			index=i
			break;
		}
	}
	var self=$("div",{cls:"modeBtn UI "+opt[index].cls})
	self.onclick=function(){
		self.removeClass(opt[index].cls)
		index=index==opt.length-1?0:(index+1)
		self.addClass(opt[index].cls)
		opt[index].callback()
	}
	return self
}
function TimeBar(){
	var self=$("div",{cls:"timeBar"})
	var processPlay=$("div",{cls:"process"})
	var processKey=$("div",{cls:"processKey"})
	var processInfo=$("div",{cls:"processInfo"})
	var processDownload=$("div",{cls:"processDownload"})
	var processBar=$("div",{cls:"processBar"})
	var freezing=false
	self.append(
		processBar.append(
			processDownload,
			processPlay
		),
		processKey.append(
			processInfo
		)
	)
	processKey.drag({
		limit:{obj:self},
		move:function(e){
			var radio=this.dragInfo.pos.x/self.width()
			var radioStr=Math.round(radio*100)+"%"
			this.css({left:radioStr});
			media.setProgress(radio)
			processPlay.css({width:radioStr})
			freezing=true
		},
		up:function(e){
			var radio=this.dragInfo.pos.x/self.width()
			var radioStr=Math.round(radio*100)+"%"
			this.css({left:radioStr});
			media.setProgress(radio)
			processPlay.css({width:radioStr})
			freezing=false
		}
	})
	self.setProgress=function(radio,curTime){
		processInfo.html(setTimeFormat(curTime))
		if(!freezing){
			processPlay.width(Math.round(radio*self.width()))
			processKey.left(Math.round(radio*self.width()))
		}
	}
	self.setBufferProgress=function(radio){
		processDownload.width(Math.round(radio*self.width()))
	}
	return self
}
function VolumeBar(){
	var value=option.get("volume")
	var self=$("div",{cls:"volumeBar UI"})
	var process=$("div",{cls:"process UI"})
	var processKey=$("div",{cls:"processKey UI"})
	self.append(
		process,
		processKey
	)
	process.css({width:value*100+"%"})
	processKey.css({left:value*100+"%"});
	media.setVolume(value)
	processKey.drag({
		limit:{obj:self},
		move:function(e){
			var radio=this.dragInfo.pos.x/self.width()
			var radioStr=Math.round(radio*100)+"%"
			this.css({left:radioStr});
			media.setVolume(radio)
			process.css({width:radioStr})
		},
		up:function(e){
			var radio=this.dragInfo.pos.x/self.width()
			var radioStr=Math.round(radio*100)+"%"
			this.css({left:radioStr});
			media.setVolume(radio)
			process.css({width:radioStr})
			option.set("volume",radio)
		}
	})
	return self
}