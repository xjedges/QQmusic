function SearchListBox(){
	var self=$("div",{cls:"searchListBox box"})
	var lists=$("ol",{cls:"searchList lists"})
	var bounceTimout
	var data
	self.append(
		lists
	)
	self.setData=function(d){
		lists.clear()
		if(d){
			data=d
			for(var i=0;i<data.SongList.length;i++){
				var line=Line(data.SongList[i])
				lists.append(line)
			}
		}else{
			var line=$("li",{cls:"line",text:"Can't find any songs"})
			lists.append(line)
		}
		lists.css({marginTop:playBox.height()})
	}
	self.onmouseover=function(){
		window.onmousewheel=function(e){
			var endPos=lists.css("marginTop")+e.wheelDelta
			endPos=Math.max(Math.min(endPos,self.height()/2),self.height()/2-lists.height())
			lists.css({marginTop:endPos});

			if(endPos>0 || endPos<-lists.height()+self.height()){
				if(bounceTimout)clearTimeout(bounceTimout)
				bounceTimout=setTimeout(function(){
					if(lists.height()<self.height()){
						endPos=playBox.height()
					}else{
						endPos=Math.max(Math.min(endPos,playBox.height()),-lists.height()+self.height()-tabBar.height())
					}
					lists.css({marginTop:endPos});
				},200)
			}
		};
	}
	self.onmouseout=function(){
		window.onmousewheel=function(){};
	}
	function Line(data){
		var self=$("li",{cls:"line"})
		var initDetailInfo=false
		var singerpic,singername,albumname,playTime
		var songname=$("div",{cls:"songname",text:data.songname})
		var singername=$("div",{cls:"singername",text:data.singername})
		var addBtn=$("div",{cls:"addBtn UI",text:"+"})
		var addPlayBtn=$("div",{cls:"addPlayBtn UI",text:">"})
		self.append(songname,singername,addPlayBtn,addBtn)
		self.init=function(){
			if(self.parent().find(".cur"))self.parent().find(".cur").removeClass("cur");
			self.addClass("cur")
			if(!initDetailInfo){
				singerpic=$("div",{cls:"singerpic"})
				albumname=$("div",{cls:"albumname",text:data.diskname})
				playTime=$("div",{cls:"playTime",text:setTimeFormat(data.playtime)})
				self.prepend(singerpic)
				self.append(
					albumname,
					playTime
				)
				var img=new Image()
				var src=api.getCover(data.diskid)
				img.src=src
				img.onload=function(){
					singerpic.css({backgroundImage:"url("+src+")"})
				}
			}
			initDetailInfo=true
		}
		self.onclick=function(){
			self.init()
		}
		addBtn.onclick=function(e){
			e.stopPropagation();
			songList.add(data)
    		playListBox.add(data)
			gallery.add(data)
			messageBox.alert('Add "'+data.songname+'" to Play List')
		}
		addPlayBtn.onclick=function(e){
			e.stopPropagation();
			songList.add(data,0)
    		playListBox.add(data,0)
			gallery.add(data,0)
			media.stop()
			media.switch(0)
			messageBox.alert('Add and Play "'+data.songname+'" to Play List')
		}
		return self
	}
	return self
}
function PlayListBox(){
	var self=$("div",{cls:"playListBox box"})
	var lists=$("ol",{cls:"playList lists"})
	var backTimeout
	var bounceTimout
	var songEditer=SongEditer()
	self.append(lists)
	self.setData=function(){
		lists.clear()
		for(var i=0;i<songList.data.length;i++){
			var line=Line(songList.data[i])
			
			lists.append(line)
		}
		
		self.roll()
	}
	self.add=function(data,index){
		var line=Line(data)
		if(index==0){
			lists.prepend(line)
    	}else{
			lists.append(line)
    	}
	}
	self.remove=function(index){
		lists.clear(index)
	}
	self.roll=function(index){
		var curLine
		if(index!=null){
			curLine=lists.child(index)
			curLine.init()
		}else{
			curLine=lists.find(".cur")
		}
		if(curLine){
			curLine.addClass("cur")
			var endPos=-curLine.offsetTop
			lists.css({marginTop:endPos})
		}else{
			var endPos=playBox.height()
			lists.css({marginTop:endPos})
		}
	}
	self.onmouseover=function(){
		window.onmousewheel=function(e){
			var endPos=lists.css("marginTop")+e.wheelDelta
			endPos=Math.max(Math.min(endPos,self.height()/2),self.height()/2-lists.height())
			lists.css({marginTop:endPos});

			if(endPos>0 || endPos<-lists.height()+self.height()){
				if(bounceTimout)clearTimeout(bounceTimout)
				bounceTimout=setTimeout(function(){
					if(lists.height()<self.height()){
						endPos=playBox.height()
					}else{
						endPos=Math.max(Math.min(endPos,playBox.height()),-lists.height()+self.height()-tabBar.height())
					}
					lists.css({marginTop:endPos});
				},200)
			}
			backtoCur()
		};
	}
	function backtoCur(){
		if(lists.find(".cur")){
		if(backTimeout)clearTimeout(backTimeout);
			backTimeout=setTimeout(function(){
				self.roll()
			},3000)
		}
	}
	self.onmouseout=function(){
		window.onmousewheel=function(){};
	}
	function SongEditer(index){
		var self=$("ul",{cls:"songEditer"})
		var songname=$("input")
		var diskname=$("input")
		var singername=$("input")
		var mv=$("input")
		var mvBtn=$("span",{cls:"mvBtn",text:"go"});
		var removeBtn=$("div",{cls:"removeBtn",text:"-"})
		var data=null
		var obj
		self.append(
			$("li",{cls:"input",title:"Song"}).append(songname),
			$("li",{cls:"input",title:"Singer"}).append(singername),
			$("li",{cls:"input",title:"Disk"}).append(diskname),
			$("li",{cls:"input",title:"MV"}).append(mv,mvBtn),
			removeBtn
		)
		self.onclick=function(e){
			e.stopPropagation();
		}
		mvBtn.onclick=function(){
			if(mv.value!=""){
	        	api.getVideo(mv.value,function(url){
	        		if(url){
						songList.setMV(obj.domIndex(),url)
	        			messageBox.alert("Add Video "+mv.value)
	        			mv.value=url
	        		}else{
	        			if(data.mv){
	        				songList.setMV(obj.domIndex(),"")
	        				messageBox.alert("remove Video")
	        			}
	        			mv.value=""
	        		}
	        	});
	        }
	    };
	    songname.onblur=function(){
	    	if(data.songname!=songname.value){
	    		data.songname=songname.value
	    		songList.setSong(obj.domIndex(),"songname",data.songname)
	    	}
	    }
	    diskname.onblur=function(){
	    	if(data.diskname!=diskname.value){
	    		data.diskname=diskname.value
	    		songList.setSong(obj.domIndex(),"diskname",data.diskname)
	    	}
	    }
	    singername.onblur=function(){
	    	if(data.singername!=singername.value){
	    		data.singername=singername.value
	    		songList.setSong(obj.domIndex(),"singername",data.singername)
	    	}
	    }
	    removeBtn.onclick=function(){
			var index=obj.domIndex()
			if(index==media.index){
				media.stop();
			}else if(index<media.index){
				media.index--
			}
			songList.remove(index)
    		playListBox.remove(index)
			gallery.remove(index)
			messageBox.alert('Remove "'+data.songname+'" from Play List')
	    }
		self.show=function(o,d){
			obj=o
			data=d
			obj.append(self)
			songname.value=data.songname
			diskname.value=data.diskname
			singername.value=data.singername
			mv.value=data.mv
			self.addClass("show")
		}
		self.hide=function(){
			self.removeClass("show")
		}
		return self
	}

	function SongData(songname,songnameCallback,singername,singernameCallback,diskname,disknameCallback,mv,mvCallback) {
		this._songname=songname
	    this.songnameCallback = songnameCallback;
		this._singername=singername
	    this.singernameCallback = singernameCallback;
		this._diskname=diskname
	    this.disknameCallback = disknameCallback;
		this._mv=mv
	    this.mvCallback = mvCallback;
	}

	SongData.prototype = {
		get songname() {
	        return this._songname;
	    },
	    set songname(val) {
	    	this.songnameCallback(val)
	        this._songname=val;
	    },
	    get singername() {
	        return this._singername;
	    },
	    set singername(val) {
	    	this.singernameCallback(val)
	        this._singername=val;
	    },
	    get diskname() {
	        return this._diskname;
	    },
	    set diskname(val) {
	    	this.disknameCallback(val)
	        this._diskname=val;
	    },
	    get mv() {
	        return this._mv;
	    },
	    set mv(val) {
	    	this.mvCallback(val)
	        this._mv=val;
	    }
	}

	function Line(data){
		var self=$("li",{cls:"line"})
		var initDetailInfo=false
		var singerpic,singername,playTime
		
		var albumname=$("div",{cls:"albumname",text:data.diskname})
		var songname=$("div",{cls:"songname",text:data.songname})
		var singername=$("div",{cls:"singername",text:data.singername})

		var songData=new SongData(
			data.songname,function(val){
				songname.html(val)
			},
			data.singername,function(val){
				singername.html(val)
			},
			data.diskname,function(val){
				albumname.html(val)
			},
			data.mv,function(val){
				mv.html(val)
			}
		)

		var editBtn=$("div",{cls:"editBtn UI",text:"..."})
		var moveBtn=$("div",{cls:"moveBtn UI"})
		self.append(songname,singername,editBtn,moveBtn)

		self.init=function(){
			if(self.parent().find(".cur"))self.parent().find(".cur").removeClass("cur");
			self.addClass("cur")
			if(!initDetailInfo){
				singerpic=$("div",{cls:"singerpic"})
				playTime=$("div",{cls:"playTime",text:setTimeFormat(data.playtime)})
				self.prepend(singerpic)
				self.append(
					albumname,
					playTime
				)
				var img=new Image()
				var src=api.getSinger(data.singerid)
				img.src=src
				img.onload=function(){
					singerpic.css({backgroundImage:"url("+src+")"})
				}
			}
			initDetailInfo=true
		}
		self.oncontextmenu=function(){
			self.append()
			return false; 
		} 
		self.onclick=function(){
			var index=self.domIndex()
			self.init()
			media.switch(index)
		}
		moveBtn.drag({
			container:self,
			down:function(e){
				e.stopPropagation()
				if(backTimeout)clearTimeout(backTimeout);
				self.addClass("move")
			},
			move:function(){
				var active=false
				for(var i=0;i<lists.child().length;i++){
					if(
						(i==0 && this.dragInfo.pos.y+9<lists.child(i).offsetTop)||
						(i==lists.child().length-1 && this.dragInfo.pos.y+13>lists.child(i).offsetTop+lists.child(i).height())||
						(this.dragInfo.pos.y+9<lists.child(i).offsetTop && this.dragInfo.pos.y+13>lists.child(i).offsetTop)
					){
						self.addClass("active")
						active=true
						break;
					}
				}
				if(!active)self.removeClass("active");
				self.css({top:this.dragInfo.pos.y})
			},
			up:function(){
				for(var i=0;i<lists.child().length;i++){
					if(
						(i==0 && this.dragInfo.pos.y+9<lists.child(i).offsetTop)||
						(i==lists.child().length-1 && this.dragInfo.pos.y+13>lists.child(i).offsetTop+lists.child(i).height())||
						(this.dragInfo.pos.y+9<lists.child(i).offsetTop && this.dragInfo.pos.y+13>lists.child(i).offsetTop)
						){
						var oldIndex=self.domIndex()
						if(i==lists.child().length-1){
							lists.append(self)
						}else{
							lists.insertBefore(self,lists.child(i))
						}
						var newIndex=self.domIndex()
						if(newIndex!=oldIndex){
							if(newIndex<media.index && oldIndex>media.index){
								media.index++
							}else if(newIndex>media.index && oldIndex<media.index){
								media.index--
							}else if(oldIndex==media.index){
								media.index=newIndex
							}
							songList.arrage(oldIndex,newIndex)
							gallery.arrage(oldIndex,newIndex)
						}
						break;
					}
				}
				self.removeClass("move")
				self.removeClass("active")
				self.style.cssText=""
				backtoCur()
			}
		})
		editBtn.onclick=function(e){
			e.stopPropagation()
			if(self.find(".songEditer.show")){
				songEditer.hide()
			}else{
				songEditer.show(self,songData)
			}
		}
		return self
	}
	return self
}
function LyricBox(){
	var data=[]
	var curLineIndex=-1
	var lineHeight
	var self=$("div",{cls:"lyricBox box"})
	var lists=$("ul",{cls:"lyric"})
	var backTimeout
	var bounceTimout
	var timeoffset=option.get("lyricTimeOffset")
	var pos=0.4
	self.append(lists)
	self.setPos=function(value){
		pos=value
		self.roll()
	}
	self.getData=function(id){
		self.clean()
		api.getLyric(id,function(lyric){
			self.setData(lyric)
		})
	}
	self.clean=function(){
		data=[]
		lists.clear()
		curLineIndex=-1
		self.scrollTop=0
	}
	self.setData=function(d){
		if(d){
			data=d
			for(var i=0;i<data.length;i++){
				var line=$("li",{cls:"line",text:data[i][1]})
				lists.append(line)
			}
		}else{
			var line=$("li",{cls:"line",text:"Can't find lyric"})
			lists.append(line)
		}
		self.roll()
	}
	self.update=function(time){
		for(var i=0;i<data.length;i++){
			if(time>data[i][0]+timeoffset){
				if((i<data.length-1 && time<data[i+1][0]+timeoffset) || i==data.length-1){
					if(curLineIndex!=i){
						curLineIndex=i
						self.roll()
						if(option.get("titleType")=="lyric"){
							var duringTime=i==data.length-1?5:(data[curLineIndex+1][0]-data[curLineIndex][0])
							pageTitle.lyricRoll(data[curLineIndex][1],duringTime)
						}
					}
					break;
				}
			}
		}
	}
	self.roll=function(){
		if(lists.find(".cur"))lists.find(".cur").removeClass("cur");
		var curLine=lists.child(curLineIndex)
		if(!curLine){
			curLine=lists.child(0)
		}
		if(curLine){
			
			curLine.addClass("cur")
			var endPos=-curLine.offsetTop+self.height()*pos
			lists.css({marginTop:endPos})
		}

	}
	self.onmouseover=function(){
		window.onmousewheel=function(e){
			var endPos=lists.css("marginTop")+e.wheelDelta
			endPos=Math.max(Math.min(endPos,self.height()/2),self.height()/2-lists.height())
			lists.css({marginTop:endPos});

			if(endPos>playBox.height() || endPos<-lists.height()+self.height()){
				if(bounceTimout)clearTimeout(bounceTimout)
				bounceTimout=setTimeout(function(){
					if(lists.height()<self.height()){
						endPos=playBox.height()
					}else{
						endPos=Math.max(Math.min(endPos,playBox.height()),-lists.height()+self.height())
					}
					lists.css({marginTop:endPos});
				},200)
			}
			backtoCur()
		};
	}
	function backtoCur(){
		if(lists.find(".cur")){
		if(backTimeout)clearTimeout(backTimeout);
			backTimeout=setTimeout(function(){
				self.roll()
			},1000)
		}
	}
	self.onmouseout=function(){
		window.onmousewheel=function(){};
	}
	return self
}