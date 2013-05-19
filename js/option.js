function Option(setting){
    var self=$("div",{cls:"option"});
    var data=JSON.parse(window.localStorage.getItem("qqmusic")) || {};
    var sync=Sync("qqmusic","c51AHg10d124ak0Z0lp5e4bZ7fT2dM39")
    var UI={};
    var initState=false
    for(var i in setting){
        data[i]=typeof(setting[i].value)==typeof(data[i])?data[i]:setting[i].value;
    }
    self.get=function(attr){
        return data[attr];
    };
    self.set=function(attr,value){
        if(data[attr]!=null && typeof(value)==typeof(data[attr])){
            data[attr]=value;
            if(UI[attr])UI[attr].setValue(value);
            saveData()
        }
    };
    self.showHide=function(){
    	if(self.hasClass("show")){
			self.removeClass("show")
		}else{
			self.addClass("show")
			if(!initState){self.init();initState=true}
		}
    }
    function saveData(){
        for(var i in UI){
            data[UI[i].id]=UI[i].getValue();
        }
        window.localStorage.setItem("qqmusic",JSON.stringify(data));
    }
    self.init=function(){
        //option
        for(var i in setting){
            if(setting[i].type!="cookie"){
                var item=Item(i,setting[i].name,setting[i].type,data[i],setting[i].format);
                UI[i]=item;
                self.append(item);
            }
        }
        //SaveBtn
        var saveBtn=$("div",{id:"saveBtn",text:"Save"});
        saveBtn.onclick=function(){
            saveData();
            // window.location.reload();
        };
        //playListText
        var playListText=$("textarea",{id:"playListText"})
        database.exportSongs(function(data){
            playListText.value=JSON.stringify(data)
        })
        //downloadBtn
        var downloadBtn=$("div",{id:"downloadBtn",text:"Download"})
        downloadBtn.onclick=function(){
            playListText.value=""
            sync.download(function(data){
                messageBox.alert("download Finish")
                playListText.value=data
            })
        }
        //uploadBtn
        var uploadBtn=$("div",{id:"uploadBtn",text:"Upload"})
        uploadBtn.onclick=function(){
            sync.upload(playListText.value,function(data){
                messageBox.alert("upload Finish")
            })
        }
        //ImportBtn
        var importBtn=$("div",{id:"importBtn",text:"Import"});
        importBtn.onclick=function(){
            database.importSongs(eval(playListText.value))
            // window.location.reload();
        }
        self.append(
            saveBtn,
            $("div",{id:"IO_data"}).append(
                playListText,
                downloadBtn,
                uploadBtn,
                importBtn
            )
        );
    };
    return self;
}
function Item(id,name,type,value,format){
    var self=$("div",{id:id,cls:"opt "+type,text:name});
    self.id=id;
    var input;
    switch(type){
        case "checkbox":input=$("input",{type:type,checked:value}); break;
        case "text":input=$("input",{type:type,value:value}); break;
        case "number":input=NumberItem(value);break;
        case "array":input=Filter(value);break;
        case "select":input=Select(value,format);break;
    }
    self.getValue=function(){
        switch(type){
            case "checkbox":return input.checked;
            case "text":return input.value;
            case "number":return input.getValue();
            case "array":return input.getValue();
            case "select":return input.value;
        }
    };
    self.setValue=function(value){
        switch(type){
            case "checkbox":input.checked=value;break;
            case "text":input.value=value;break;
            case "number":input.setValue(value);break;
            case "array":input.setValue(value);break;
            case "select":input.value=value;break;//issus
        }
    };
    self.append(input);
    function NumberItem(value){
        var self=$("input",{type:"text",value:value.toString()});
        self.getValue=function(){
            return Number(self.value)
        }
        self.setValue=function(value){
            self.value=value.toString()
        }
        return self
    }
    function Select(value,format){
        var self=$("select");
        for(var i in format){
            var opt=$("option",{html:format[i].name,value:format[i].value});
            if(value==format[i].value)opt.selected=true;
            self.append(opt);
        }
        self.onchange=function(){
            for(var i in format){
                if(format[i].value==self.value){
                    if(format[i].callback)format[i].callback(self.value);
                }
            }
        }
        return self;
    }
    function Filter(setting){
        var self=$("div",{cls:"filter"});
        var wrap=$("div",{cls:"container"});
        var filters=$("ul");
        var addBtn=$("div",{cls:"addBtn",text:"Add"});
        for(var i in setting){
            var list=List(setting[i]);
            filters.append(list);
        }
        self.append(
            wrap.append(
                filters
            ),
            addBtn
        );
        addBtn.onclick=function(){
            var list=List("");
            filters.append(list);
            list.input.focus();
        };
        self.getValue=function(){
            var valueArr=[];
            filters.each(function(){
                valueArr.push(this.input.value);
            });
            return valueArr;
        };
        self.setValue=function(setting){
            filters.clear();
            for(var i in setting){
                var list=List(setting[i]);
                filters.append(list);
            }
        };
        function List(value){
            var self=$("li");
            self.input=$("input",{type:"text",value:value});
            var deleteBtn=$("div",{cls:"deleteBtn",text:"X"});
            self.input.onfocus=function(){
                this.parent().addClass("active");
            };
            self.input.onblur=function(){
                this.parent().removeClass("active");
                if(this.value=="")this.parent().remove();
            };
            deleteBtn.onclick=function(){
                this.parent().remove();
            };
            self.append(
                self.input,
                deleteBtn
            );
            return self;
        }
        return self;
    }
    return self;
}