/*
http://www.douban.com/note/158621500/				--Audio
http://xsky.sinaapp.com/2012/01/qq-music-api.html --API
http://mezzoblue.github.com/PaintbrushJS/demo/    --Color
http://updates.html5rocks.com/2012/02/HTML5-audio-and-the-Web-Audio-API-are-BFFs
http://css.dzone.com/articles/exploring-html5-web-audio
http://chromium.googlecode.com/svn/trunk/samples/audio/index.html
http://www.html5audio.org/2012/10/interactive-navigable-audio-visualization-using-webaudio-api-and-canvas.html
http://techslides.com/html5-web-audio-api-demos-and-libraries/
http://www.behance.net/gallery/Floating-3D-sound-visualization/4384841
http://stackoverflow.com/questions/13122965/audio-api-fail-to-resume-music-and-also-visualize-it-is-there-bug-in-html5-aud
http://www.html5china.com/HTML5features/video/20120206_3425.html --fullscreen
*/
//获取图片色调 桌面化 专辑光效 processing.js 最小化 播放列表
//bug:volume setting doesn't work with soundVisual

option=Option({
    titleType:{
        name:"Title Type",
        type:"select",
        value:"static",
        format:[
            {name:"Static",value:"static"},
            {name:"Lyric",value:"lyric"},
            {name:"Songname",value:"songname"},
        ],
    },
    skin:{
        name:"Skin",
        type:"select",
        value:"dark",
        format:[
            {name:"Dark",value:"dark",callback:function(){
                css.attr("href","style/css_dark.css")
            }},
            {name:"Light",value:"light",callback:function(){
                css.attr("href","style/css_light.css")
            }},
        ],
    },
    fontSize:{
        name:"Font Size",
        type:"select",
        value:"18",
        format:[
            {name:"14px",value:"14",callback:function(){
                body.addCss("html","font-size:14px !important")
            }},
            {name:"16px",value:"16",callback:function(){
                body.addCss("html","font-size:16px !important")
            }},
            {name:"18px",value:"18",callback:function(){
                body.addCss("html","font-size:18px !important")
            }},
        ],
    },
    lyricTimeOffset:{
        name:"Lyric Time Offset",
        type:"number",
        value:0,
    },
    shortCut:{
    	name:"Short Cut",
    	type:"checkbox",
    	value:false,
    },
    maximum:{
        type:"cookie",
        value:false,
    },
    soundVisual:{
        name:"Sound Visual",
        type:"checkbox",
        value:false,
    },
    video:{
        name:"Video",
        type:"checkbox",
        value:true,
    },
    playMode:{
        type:"cookie",
        value:"unorder",
    },
    volume:{
        type:"cookie",
        value:0.7,
    },
    curIndex:{
        type:"cookie",
        value:0,
    },
    playlist:{
        type:"cookie",
        value:"",
    },
    X:{
        type:"cookie",
        value:0,
    },
    Y:{
        type:"cookie",
        value:0,
    },
    W:{
        type:"cookie",
        value:0,
    },
    H:{
        type:"cookie",
        value:0,
    },
})

windowState=document.title=="pop"?true:false
document.title="QQmusic"
css=$("link",{rel:"stylesheet",href:"style/css_"+option.get("skin")+".css"})
$("head").append(css)
JSON=Json();
database=Database()
pageTitle=PageTitle()
songList=SongList()
messageBox=MessageBox()
api=API()
media=Media()

playListBox=PlayListBox()
searchListBox=SearchListBox()
gallery=Gallery()
lyricBox=LyricBox()
bottomTab=BottomTab()

function Wrap(){
    var self=$("div",{cls:"wrap"})
    var toolBar=ToolBar()
    self.append(toolBar)
    if(!windowState){
        var dragHandle=$("div",{cls:"dragHandle"})
        var resizeHandle=$("div",{cls:"resizeHandle"})
        self.headline=$("div",{cls:"headline"})
        self.append(
            dragHandle.append(
                self.headline
            ),
            resizeHandle
        )
        dragHandle.drag({
            limit:{obj:body},
            magnet:20,
            container:self,
            down:function(e){
                self.addClass("move")
            },
            move:function(e){
                self.top(this.dragInfo.pos.y);
                self.left(this.dragInfo.pos.x);
            },
            up:function(e){
                self.top(this.dragInfo.pos.y);
                self.left(this.dragInfo.pos.x);
                self.removeClass("move")
                option.set("X",this.dragInfo.pos.x)
                option.set("Y",this.dragInfo.pos.y)
            }
        })
        resizeHandle.drag({
            limit:{obj:body},
            magnet:10,
            down:function(){
            },
            move:function(){
                self.width(this.dragInfo.pos.x)
                self.height(this.dragInfo.pos.y)
            },
            up:function(){
                self.width(this.dragInfo.pos.x)
                self.height(this.dragInfo.pos.y)
                option.set("W",this.dragInfo.pos.x)
                option.set("H",this.dragInfo.pos.y)
            }
        })
        self.css({left:option.get("X"),top:option.get("Y"),width:option.get("W"),height:option.get("H")})
    }else{
        self.css({width:"100%",height:"100%"})
    }
    
    return self
}

debug(1,{W:200,H:300},function(){
    body=$("body")
    body.addCss("html","font-size:"+option.get("fontSize")+"px !important")
    wrap=Wrap()
    playBox=PlayBox()
	$("body").append(
		wrap.append(
			messageBox,
			option,
			gallery,
			playBox,
			bottomTab
		)
	)
    if(option.get("soundVisual")){
        soundVisual=SoundVisual()
        gallery.append(soundVisual)
    }
    if(option.get("video")){
        video=Video()
        gallery.append(video)
    }
    if(option.get("shortCut")){
        shortCut=ShortCut()
    }

    if(option.get("maximum")&&!windowState){
        wrap.addClass("maximum")
        lyricBox.setPos(0.1)
    }else{
        bottomTab.css({height:wrap.height()-playBox.offsetTop})
        gallery.resize(playBox.offsetTop+playBox.height(),playBox.offsetTop,true)
    }

})