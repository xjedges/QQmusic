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
    playBoxTop:{
        type:"cookie",
        value:450,
    },
    X:{type:"cookie",value:0,},
    Y:{type:"cookie",value:0,},
    W:{type:"cookie",value:0,},
    H:{type:"cookie",value:0,},
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
			gallery.append(
                media
            ),
			playBox,
			bottomTab
		)
	)
    if(option.get("shortCut")){
        shortCut=ShortCut()
    }

    if(option.get("maximum")&&!windowState){
        wrap.addClass("maximum")
        lyricBox.setPos(0.1)
    }else{
        playBox.top(option.get("playBoxTop"))
        bottomTab.css({height:"-webkit-calc(100% - "+playBox.top()+"px)"})
        gallery.resize(playBox.top()+playBox.height(),playBox.top(),true)
    }

})