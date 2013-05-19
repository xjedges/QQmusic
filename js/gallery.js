function Gallery(){
	var self=$("div",{cls:"gallery"})
	var layer3d=$("div",{cls:"layer3d"})
	var title=$("div",{cls:"title"})
	var singer=$("div",{cls:"singer"})
	var curIndex=option.get("curIndex")
	var coverFlow=CoverFlow()
	var backTimeout
	self.append(
		layer3d.append(
			coverFlow,
			title,
			singer
		)
	);
	self.drag({
		up:function(){
			if(this.dragInfo.pos.x<-300){
				self.switchAlbum(curIndex-Math.round(this.dragInfo.pos.x/300))
			}else if(this.dragInfo.pos.x>300){
				self.switchAlbum(curIndex-Math.round(this.dragInfo.pos.x/300))
			}
		}
	})
	self.setData=function(){
		coverFlow.setData()
		self.switchAlbum(curIndex,true)
	}
	self.resize=function(height,innerHeight,sync){
		self.css({height:height})
		layer3d.css({marginTop:(innerHeight-380)/2})
		var scale=Math.min(Math.max(innerHeight/495,0.2),1)
		if(sync){
			layer3d.css({"-webkit-transform":"scale("+scale+")"})
		}
	}
	var lock=false
	self.onmouseover=function(){
		window.onmousewheel=function(e){
			if(!lock){
				lock=true
				setTimeout(function(){lock=false},1)
		        self.switchAlbum(curIndex-e.wheelDelta/120)
		    }
		}
	}
	self.onmouseout=function(){
		window.onmousewheel=function(){};
	}
	self.backtoCur=function(){
		if(backTimeout)clearTimeout(backTimeout);
		backTimeout=setTimeout(function(){
			if(media.index!=-1)self.switchAlbum(media.index);
		},2000)
	}
	self.remove=function(index){
		coverFlow.clear(index)
		if(index<curIndex)curIndex--;
		if(index==coverFlow.child().length){
			self.switchAlbum(coverFlow.child().length-1,true)
		}else{
			self.switchAlbum(index,true)
		}
	}
	self.arrage=function(oldIndex,newIndex){
		if(newIndex==coverFlow.child().length-1){
			coverFlow.append(coverFlow.child(oldIndex))
		}else{
			if(oldIndex>newIndex){
				var cover1=coverFlow.child(oldIndex)
				var cover2=coverFlow.child(newIndex)
			}else{
				var cover1=coverFlow.child(oldIndex)
				var cover2=coverFlow.child(newIndex+1)
			}
			coverFlow.insertBefore(cover1,cover2)
		}
		self.switchAlbum(newIndex,true)
    }
	self.add=function(data,index){
		var cover=Cover(data)
		if(index==0){
			coverFlow.prepend(cover)
			self.switchAlbum(0,true)
    	}else{
			coverFlow.append(cover)
			self.switchAlbum(coverFlow.child().length-1,true)
    	}
	}
	self.switchAlbum=function(index,force){
		var index=parseInt(index)
		if(curIndex==index && !force){return false}
		if(index==-1){index=0}

		curIndex=index
		if(curIndex>=0 && curIndex<songList.data.length){
			coverFlow.switch(curIndex)
			var d=songList.data[curIndex]
			
			title.html(d.songname)
			singer.html(d.singername)
			self.backtoCur()
		}else if(songList.data.length==0){
			title.html("")
			singer.html("")
		}
	}
	return self
}
function CoverFlow(){
	var self=$("ul",{cls:"coverFlow"})
	var extra=6
	
	self.setData=function(){
		self.clear()
		for(i in songList.data){
			var data=songList.data[i]
			var cover=Cover(data)
			self.append(cover)
		}
	}
	self.switch=function(index){
		self.each(function(i){
			if(i<index-extra){
				if(this.freeze!=-1){
					// this.hide()
					this.freeze=-1;
					this.css({"-webkit-transform":"translateX(-"+(extra*75+110)+"px) translateZ(-320px) rotateY(45deg)"})
				}
			}else if(i>index+extra){
				if(this.freeze!=1){
					this.hide()
					this.freeze=1;
					this.css({"-webkit-transform":"translateX("+(extra*75+110)+"px) translateZ(-320px) rotateY(-45deg)"})
				};
			}else{
				this.show()
				this.freeze=0;
				this.init();
				if(i==index)		{this.css({"-webkit-transform":"translateX(0) translateZ(0px) rotateY(0)"});}
				else if(i==index-1)	{this.css({"-webkit-transform":"translateX(-"+180+"px) translateZ(-200px) rotateY(60deg)"})}
				else if(i==index+1)	{this.css({"-webkit-transform":"translateX("+180+"px) translateZ(-200px) rotateY(-60deg)"})}
				else if(i<index)	{this.css({"-webkit-transform":"translateX(-"+((index-i)*75+110)+"px) translateZ(-280px) rotateY(45deg)"})}
				else if(i>index)	{this.css({"-webkit-transform":"translateX("+((i-index)*75+110)+"px) translateZ(-280px) rotateY(-45deg)"})}
			}
		})
	}
	return self
}
function Cover(data){
	var self=$("div",{cls:"cover"})
	var reflectCover=$("div",{cls:"reflect"})
	self.append(reflectCover)
	self.freeze=0
	var initState=false
	var hideTimeout
	self.drag({
		up:function(){
			if(this.dragInfo.pos.x>-100 && this.dragInfo.pos.x<100){
				var index=self.domIndex()
				media.switch(index)
			}
		}
	})
	// self.onclick=function(){
	// 	var index=self.domIndex()
	// 	media.switch(index)
	// }
	self.hide=function(){
		if(hideTimeout)clearTimeout(hideTimeout);
		// if(self.css("display")!="none"){
			hideTimeout=setTimeout(function(){
				self.css({opacity:0})
			},300)
		// }
	}
	self.show=function(){
		if(hideTimeout)clearTimeout(hideTimeout);
		self.css({opacity:1})
	}
	self.init=function(){
		if(!initState){
			initState=true
			var img=new Image()
			var src=api.getCover(data.diskid)
			img.src=src
			img.onload=function(){
				self.css({backgroundImage:"url("+src+")"})
				reflectCover.css({backgroundImage:"url("+src+")"})
			}
		}
	}
	return self
}
