function BottomTab(){
	var self=$("div",{cls:"bottomTab"})
	tabBar=$("ul",{cls:"tabBar"})
	var tabBox=$("div",{cls:"tabBox"})
	var webListTab=$("li",{cls:"weblistTab tab",text:"Web List"})
	var listsTab=$("li",{cls:"playlistTab tab cur",text:"Local List"})
	var lyricTab=$("li",{cls:"lyricTab tab",text:"Lyric"})
	var webList=WebList()
	var localList=LocalList()
	self.append(
		tabBox.append(
			searchListBox,
			lyricBox,
			playListBox.addClass("cur")
		),
		tabBar.append(
			webListTab.append(
				webList
			),
			lyricTab,
			listsTab.addClass("cur").append(
				localList
			)
		)
	)
	lyricTab.onclick=function(){
		self.switchTab(1)
	}
	webListTab.onmouseover=function(){
		webList.show()
	}
	webListTab.onmouseout=function(){
		webList.hide()
	}
	listsTab.onmouseover=function(){
		localList.show()
	}
	listsTab.onmouseout=function(){
		localList.hide()
	}
	self.switchTab=function(index){
		var tab=tabBar.child(index)
		if(!tab.hasClass("cur")){
			tabBar.find(".cur.tab").removeClass("cur")
			tab.addClass("cur")
			tabBox.find(".cur.box").removeClass("cur")
			var curTabBox=tabBox.child(tab.domIndex())
			curTabBox.addClass("cur")
			if(curTabBox.roll)curTabBox.roll();
		}
	}

	return self
}
function WebList(){
	var self=$("div",{cls:"webList"})
	var lists=$("ul")
	var searchBox=$("li",{cls:"search"})
    var queryInput=$("input",{cls:"queryInput"});
    var queryBtn=$("div",{cls:"queryBtn",text:"go"});
    var default_list=$("li",{cls:"default_list",text:"Web play List"})
	var rank_random=$("li",{cls:"rank rank_random",text:"Random"})
	var rank_sell=$("li",{cls:"rank rank_sell",text:"Sell Rank"})
	var rank_newsong=$("li",{cls:"rank rank_newsong",text:"New Rank"})
	var rank_all=$("li",{cls:"rank rank_all",text:"Main Rank"})
	var rank_ch=$("li",{cls:"rank rank_ch",text:"Chinese Rank"})
	var rank_eu=$("li",{cls:"rank rank_eu",text:"English Rank"})
	var rank_jk=$("li",{cls:"rank rank_jk",text:"JP&Ko Rank"})
	self.append(
		lists.append(
			default_list,
			rank_random,
			rank_sell,
			rank_newsong,
			rank_all,
			rank_ch,
			rank_eu,
			rank_jk,
			searchBox.append(
				queryInput,
				queryBtn
			)
		)
	)
	self.show=function(){
		self.css({display:"block",height:Math.min(bottomTab.height()-120,190)})
	}
	default_list.onclick=function(){
		if(switchCur(default_list))
			api.getList(setData)
	}
	rank_random.onclick=function(){
		if(switchCur(rank_random))
			api.getRank("random",setData);
	}
	rank_sell.onclick=function(){
		if(switchCur(rank_sell))
			api.getRank("sell",setData);
	}
	rank_newsong.onclick=function(){
		if(switchCur(rank_newsong))
			api.getRank("newsong",setData);
	}
	rank_all.onclick=function(){
		if(switchCur(rank_all))
			api.getRank("all",setData);
	}
	rank_ch.onclick=function(){
		if(switchCur(rank_ch))
			api.getRank("ch",setData);
	}
	rank_eu.onclick=function(){
		if(switchCur(rank_eu))
			api.getRank("eu",setData);
	}
	rank_jk.onclick=function(){
		if(switchCur(rank_jk))
			api.getRank("jk",setData);
	}
	queryBtn.onclick=function(){
		switchCur(searchBox)
		if(queryInput.value!=""){
        	api.search({value:queryInput.value},function(data){
        		setData(data)
        	});
        }
    };
    function switchCur(list){
    	self.hide()
		if(!list.hasClass("cur")){
			var curList=self.find("li.cur")
			if(curList)curList.removeClass("cur");
			list.addClass("cur")
			return true
		}else{
			bottomTab.switchTab(0)
			return false
		}
    }
    function setData(data){
    	bottomTab.switchTab(0)
		searchListBox.setData(data)
    }
	return self
}
function LocalList(){
	var self=$("div",{cls:"localList"})
	var lists=$("ul")
    var addPlayListInput=$("input",{cls:"queryInput"});
    var addPlayListBtn=$("div",{cls:"queryBtn",text:"+"});
	var addPlayList=$("div",{cls:"addPlayList"})
	self.append(
		lists,
		addPlayList.append(
			addPlayListInput,
			addPlayListBtn
		)
	)
	addPlayList.onclick=function(e){
		if(addPlayListInput.value!=""){
			database.addPlayList(addPlayListInput.value,function(){
				addList({name:addPlayListInput.value})
				addPlayListInput.value=""
			})
		}
	}
	database.getPlayList(function(data){
		for(var i in data){
			addList(data[i])
		}
		if(data.length==0){
			addList({name:""})
		}
	})
	function addList(data){
		var list=$("li",{cls:"list",text:data.name?data.name:"default"})
		list.onclick=function(e){
			switchPlayList(e.target,data.name)
		}
		if(option.get("playlist")==data.name)switchPlayList(list,data.name);
		if(data.name){
			var removeBtn=$("div",{cls:"removeBtn",text:"-"})
			removeBtn.onclick=function(e){
				e.stopPropagation()
				database.deletePlayList(data.name)
				e.target.parent().remove()
			}
			list.append(removeBtn)
		}
		lists.append(list)
	}
	function switchPlayList(curObj,name){
		self.hide()
		if(!curObj.hasClass("cur")){
			var curList=self.find("li.cur")
			if(curList)curList.removeClass("cur");
			curObj.addClass("cur")
			database.getSong(name,function(data){
				songList.setData(data)
			})
			option.set("playlist",name)
			media.stop()
		}
		bottomTab.switchTab(2)
	}
	self.show=function(){
		self.css({display:"block",height:bottomTab.height()-playBox.height()-self.parent().height()-5})
	}
	return self
}