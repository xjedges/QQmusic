function PageTitle(){
    var self={}
    var title=document.title
    var baseStr="QQmusic"
    var rollInterval
    var rollTimeSpan=400
    var titleLength=10
    self.play=function(){
        switch(option.get("titleType")){
            case "songname":
                if(rollInterval)clearInterval(rollInterval);
                var index=0
                var rollStr=songList.data[media.index].songname+" - "+songList.data[media.index].singername+" - "
                rollInterval=setInterval(function(){
                    var str1=rollStr.substring(0,index)
                    var str2=rollStr.substring(index)
                    index=index<rollStr.length?(index+1):0
                    document.title=str2+str1
                },rollTimeSpan)
                break;
            case "static":
                document.title=baseStr;
                break;
            case "lyric":
                break;
        }
        
    }
    self.lyricRoll=function(line,duringTime){
        if(rollInterval)clearInterval(rollInterval);
        if(isChinese(line)){
            //Chinese Lyric
            if(line.length<titleLength){
                document.title=line
            }else{
                var rollSpan=1
                var rollCount=line.length-titleLength
                var rollTimeSpan=duringTime*1000/rollCount
                var rollIndex=0
                var strIndex=0
                var rollStr=line

                document.title=line
                rollInterval=setInterval(function(){
                    rollStr=line.substring(strIndex)
                    strIndex+=rollSpan
                    document.title=rollStr
                    rollIndex++
                    if(rollIndex>rollCount)clearInterval(rollInterval);
                },rollTimeSpan)
            }
        }else{
            //English Lyric
            if(line.length<titleLength*2){
                document.title=line
            }else{
                var index=line.indexOf(" ",line.length-titleLength*2)
                var subLine=line.substring(0,index) //the part of line for rolling
                var result=subLine.match(/\s/g)
                if(result){
                    var rollCount=result.length //how much words for rolling
                    var rollTimeSpan=duringTime*1000/rollCount
                    var rollIndex=0

                    document.title=line
                    rollInterval=setInterval(function(){
                        var result=line.match(/\s(.*)/)
                        if(result){
                            line=result[1]
                            document.title=line
                            rollIndex++
                            if(rollIndex==rollCount)clearInterval(rollInterval);
                        }else{
                            clearInterval(rollInterval);
                        }
                    },rollTimeSpan)
                }else{
                    document.title=line
                }
            }
        }
        
    }
    function isChinese(str) {
        for(var i in str){
          if(!/[^\u4e00-\u9fa5]/.test(str[i])) {
            return true
          }
        }
        return false
    }
    self.pause=function(){
        if(rollInterval)clearInterval(rollInterval);
        document.title=baseStr
    }
    return self
}

function ShortCut(){
    var self={}
    document.onkeyup=function(e){
        if(e.target.className=="queryInput")return;
        if(keyboard("Spacebar",e)){
            media.play()
        }else if(keyboard("Right",e)){
            media.next()
        }else if(keyboard("Left",e)){
            media.prev()
        }
    }

    return self
}
function MessageBox(){
    var self=$("div",{cls:"messageBox"})
    var hideTimeout
    self.alert=function(text){
        self.html(text)
        self.addClass("show")
        if(hideTimeout)clearTimeout(hideTimeout);
        hideTimeout=setTimeout(function(){
            self.removeClass("show")
        },2000)
    }
    return self
}
function SongList(setting){
    var self={};
    self.setData=function(data){
        self.data=data
        playListBox.setData()
        gallery.setData()
    }
    self.arrage=function(oldIndex,newIndex){
        var oldData=self.data[oldIndex]
        self.data.splice(oldIndex,1)
        self.data.splice(newIndex,0,oldData)
    }
    self.remove=function(index){
        database.deleteSong(self.data[index].id)
        self.data.splice(index,1)
    };
    self.add=function(data,index){
        if(index==0){
            self.data.unshift(data)
        }else{
            self.data.push(data)
        }
        database.addSong(data)
    };
    self.setSong=function(index,key,value){
        database.updateSong(self.data[index].id,key,value)
    }
    self.setMV=function(index,src){
        database.updateSong(self.data[index].id,"mv",src)
    }
    self.setPlayTime=function(index,time){
        database.updateSong(self.data[index].id,"playtime",time)
    }
    self.setPlayList=function(index,playlist){
        database.updateSong(self.data[index].id,"playlist",playlist)
    }
    return self;
}
function ToolBar(){
    var self=$("div",{cls:"toolBar"})
    var homeBtn=$("div",{cls:"homeBtn UI"})
    var optionBtn=$("div",{cls:"optionBtn UI"})
    var maximumBtn=$("div",{cls:"maximumBtn UI"})
    var fullScreenBtn=$("div",{cls:"fullScreenBtn UI"})
    self.append(
        fullScreenBtn,
        maximumBtn,
        optionBtn,
        homeBtn
    )
    if(windowState){
        maximumBtn.hide()
    }
    homeBtn.onclick=function(){
        // window.open("http://y.qq.com/")
        if(windowState){
            window.open(
                "http://127.0.0.1/~xiejun/QQmusic/index.html"
            );
            window.open("","_self").close()
        }else{
            window.open(
                "http://127.0.0.1/~xiejun/QQmusic/pop.html",
                "popup1",
                "width="+option.get("W")+",height="+option.get("H")+",\
                scrollbars=1,\
                left=0,top=0,\
                screenX="+Math.round((window.screen.width-(wrap.width()+10))/2)+",\
                screenY="+Math.round((window.screen.height-(wrap.height()+90))/2)
            ); 
            window.open("","_self").close()
        }
    }
    optionBtn.onclick=function(){
        option.showHide()
    }
    maximumBtn.onclick=function(){
        if(wrap.hasClass("maximum")){
            wrap.removeClass("maximum")
            playListBox.roll()
            lyricBox.roll()
            bottomTab.css({height:wrap.height()-playBox.offsetTop})
            gallery.resize(playBox.offsetTop+playBox.height(),playBox.offsetTop,true)
            option.set("maximum",false)
            video.update()
        }else{
            wrap.addClass("maximum")
            option.set("maximum",true)
        }
        if(option.get("soundVisual"))soundVisual.resize();
    }
    fullScreenBtn.onclick=function(){
        if(!document.webkitIsFullScreen){
            wrap.addClass("fullscreen")
            wrap.webkitRequestFullScreen();
            wrap.addClass("maximum")
        }else{
            document.webkitCancelFullScreen();
            wrap.removeClass("maximum")
            wrap.removeClass("fullscreen")
        }
    }
    return self
}