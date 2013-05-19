/*
 * 2013-4-1
 *
 * 参数: tag:标签<string>,
 *       attr:参数<{id, cls, text, html, src, href, value, css}>
 *
 * 方法: hasClass, addClass, removeClass,
 *       append, appendTo, parent, children[],
 *       click,
 *       css, animation,
 *       remove, clear,
 *       html, text, each,
 */
function isArray(value){
    if(value instanceof Array||value.constructor.toString().match(/function\sArray\(/))return true;
};
function $(tag,attr){
    var self={};
    if(tag[0]!="#"){
        switch(tag){
            case "body" : self=document.body;break;
            case "head" : self=document.head;break;
            case "frag" :
                var frag=document.createDocumentFragment();
                frag.append=function(){
                    for(var i in arguments){
                        if(isArray(arguments[i])){
                            for(var j in arguments[i]){
                                frag.appendChild(arguments[i][j]);
                            }
                        }else{
                            frag.appendChild(arguments[i]);
                        }
                    }
                };
                return frag;
            default     : self=document.createElement(tag);
        }
    }else{
        self=document.getElementById(tag.slice(1));
    }
    for(var i in attr||{}){
        var value=attr[i];
        switch(i){
            case "cls"  : self.className=value;break;
            case "text" : self.text(value);break;
            case "html" : self.html(value);break;
            case "css"  : self.css(value);break;
            default     : self[i]=value;
        }
    }
    self.dragInfo={
        limit:false,
        pos:{x:0,y:0},
        offset:{x:0,y:0},
        container:self,
        magnet:10,
        down:function(){},
        move:function(){},
        up:function(){}
    }
    
    return self;
};
HTMLElement.prototype.drag=function(setting){
    for(var i in setting)
        if(this.dragInfo[i]!=null)
            this.dragInfo[i]=setting[i];
    this.addEventListener('touchstart', onDocumentMouseDown);
    this.addEventListener('mousedown', onDocumentMouseDown);
    var self=this
    function onDocumentMouseDown( event ) {
        // event.preventDefault();
        if(self.dragInfo.limit){
            var limitObj=self.dragInfo.limit.obj
            if(limitObj){
                self.dragInfo.limit.T=limitObj.scrollTop+(limitObj.offsetHeight>self.dragInfo.container.offsetHeight)?0:limitObj.offsetHeight-self.dragInfo.container.offsetHeight;
                self.dragInfo.limit.B=limitObj.scrollTop+(limitObj.offsetHeight<self.dragInfo.container.offsetHeight)?0:limitObj.offsetHeight-self.dragInfo.container.offsetHeight;
                self.dragInfo.limit.L=limitObj.scrollLeft+(limitObj.offsetWidth>self.dragInfo.container.offsetWidth)?0:limitObj.offsetWidth-self.dragInfo.container.offsetWidth;
                self.dragInfo.limit.R=limitObj.scrollLeft+(limitObj.offsetWidth<self.dragInfo.container.offsetWidth)?0:limitObj.offsetWidth-self.dragInfo.container.offsetWidth;
            }
            // self.dragInfo.limit.obj=null
        }
        document.addEventListener('mousemove',    onDocumentMouseMove);
        document.addEventListener('mouseup',      onDocumentMouseUp);
        document.addEventListener('touchmove',    onDocumentMouseMove);
        document.addEventListener('touchend',      onDocumentMouseUp);
        self.dragInfo.offset.x=event.pageX-self.dragInfo.container.offsetLeft;
        self.dragInfo.offset.y=event.pageY-self.dragInfo.container.offsetTop;
        self.dragInfo.down.apply(self,arguments);
    }
    function onDocumentMouseMove( event ) {
        event.preventDefault();
        self.dragInfo.pos.x=event.pageX-self.dragInfo.offset.x
        self.dragInfo.pos.y=event.pageY-self.dragInfo.offset.y
        if(self.dragInfo.limit){
            self.dragInfo.pos.x=Math.min(Math.max(self.dragInfo.pos.x, self.dragInfo.limit.L), self.dragInfo.limit.R);
            self.dragInfo.pos.y=Math.min(Math.max(self.dragInfo.pos.y, self.dragInfo.limit.T), self.dragInfo.limit.B);
        }
        self.dragInfo.move.apply(self,arguments);
    }
    function onDocumentMouseUp( event ) {
        document.removeEventListener('mousemove',    onDocumentMouseMove);
        document.removeEventListener('mouseup',      onDocumentMouseUp);
        document.removeEventListener('touchmove',    onDocumentMouseMove);
        document.removeEventListener('touchend',      onDocumentMouseUp);
        event.preventDefault();
        self.dragInfo.pos.x=event.pageX-self.dragInfo.offset.x
        self.dragInfo.pos.y=event.pageY-self.dragInfo.offset.y
        if(self.dragInfo.limit){
            if(self.dragInfo.pos.x<=self.dragInfo.limit.L+self.dragInfo.magnet)self.dragInfo.pos.x=self.dragInfo.limit.L;
            else if(self.dragInfo.pos.x>=self.dragInfo.limit.R-self.dragInfo.magnet)self.dragInfo.pos.x=self.dragInfo.limit.R;
            if(self.dragInfo.pos.y<=self.dragInfo.limit.T+self.dragInfo.magnet){self.dragInfo.pos.y=self.dragInfo.limit.T;}
            else if(self.dragInfo.pos.y>=self.dragInfo.limit.B-self.dragInfo.magnet){self.dragInfo.pos.y=self.dragInfo.limit.B;}
        }
        self.dragInfo.up.apply(self,arguments);
        self.dragInfo.pos.x=0//fix bug
        self.dragInfo.pos.y=0//fix bug
    }
}
HTMLElement.prototype.css=function(attr){
    if(typeof(attr)=="string"){
        var value=window.getComputedStyle(this,null)[attr];
        if(attr.match(/[height|width|top|right|bottom|left|marginTop|marginRight|marginBottom|marginLeft|paddingTop|paddingRight|paddingBottom|paddingLeft]/)){
            value=parseInt(value.match(/[-\d]*/));
        }
        return value;
    };
    for(var stl in attr){
        value=attr[stl];
        switch(typeof value){
            case "string":
                this.style[stl]=value;break;
            case "number":
                if(stl=="zIndex"||stl=="opacity"||value==0){this.style[stl]=value;}
                else{this.style[stl]=value+"px";}break;
            case "object":
                var str="";
                for(var i in value){
                    str+=value[i];
                    if(typeof value[i]=="number"&&value[i]!=0){
                        str+="px";
                    }
                    str+=" ";
                }
                this.style[stl]=str;break;
        }
    }
    return this;
};
HTMLElement.prototype.addCss=function(filter, cssText) {
    var styleSheet = document.styleSheets[0];
    if (styleSheet.addRule) {
        styleSheet.addRule(filter, cssText);
    } else {
        styleSheet.insertRule(filter+"{" + cssText + "}", styleSheet.cssRules.length);
    }
}
HTMLElement.prototype.attr=function(attrName,attr){
    if(attr){this.setAttribute(attrName,attr)}
    else{return this.getAttribute(attrName)}
};
HTMLElement.prototype.domIndex=function(){
    var k = 0;
    var elem=this
    while(elem.previousSibling){
        k++;
        elem = elem.previousSibling;
    }
    return k
};
HTMLElement.prototype.each=function(fun){
    for(var i=0;i<this.childNodes.length;i++){
        fun.call(this.childNodes[i],i);
    }
    return this;
};
HTMLElement.prototype.find=function(exp){
    return this.querySelector(exp);
};
HTMLElement.prototype.findAll=function(exp){
    var arr=[]
    var result=this.querySelectorAll(exp)
    for(var i=0;i<result.length;i++){
        arr.push(result[i])
    }
    return arr;
};
//---------------------------------------- hasClass addClass removeClass
HTMLElement.prototype.hasClass=function(cls){
    return this.className.match(new RegExp('\\b'+cls+'\\b'));
};
HTMLElement.prototype.addClass=function(cls){
    var clsArr=cls.split(" ");
    for(var i in clsArr){
        if (!this.hasClass(clsArr[i]))this.className+=(this.className==""?"":" ")+clsArr[i];
    }
    return this;
};
HTMLElement.prototype.removeClass=function(cls){
    var clsArr=cls.split(" ");
    for(var i in clsArr){
        if (this.hasClass(clsArr[i])) {
            var reg = new RegExp('\\s\\b'+cls+'\\b\|^'+cls+'\\b\\s|^'+cls+'$');
            this.className=this.className.replace(reg,'');
        }
    }
    return this;
};
//---------------------------------------- append prepend
HTMLElement.prototype.append=function(){
    for(var i in arguments){
        if(isArray(arguments[i])){
            for(var j in arguments[i]){
                this.appendChild(arguments[i][j]);
            }
        }else{
            this.appendChild(arguments[i]);
        }
    };
    return this;
};
HTMLElement.prototype.appendTo=function(parent){
    this.parentNode.append(this);
    return this;
};
HTMLElement.prototype.prepend=function(){
    for(var i in arguments){
        if(this.hasChildNodes()){ 
            this.insertBefore(arguments[i],this.firstChild); 
        }else{ 
            this.appendChild(arguments[i]); 
        }
    }
    return this;
};
HTMLElement.prototype.prependTo=function(parent){
    this.parentNode.prepend(this);
    return this;
};
//---------------------------------------- parent child
HTMLElement.prototype.parent=function(num){
    if(num>1){
         return this.parentNode.parent(num-1);
    }
    else{return this.parentNode;}
};
HTMLElement.prototype.child=function(num){
    if(num!=null){
         return this.children[num];
    }
    else{return this.children;}
};
HTMLElement.prototype.next=function(){
    return this.nextSibling;
};
HTMLElement.prototype.prev=function(){
    return this.previousSibling;
};
//---------------------------------------- remove clear
HTMLElement.prototype.remove=function(){
    if(this.parentNode){
        this.parentNode.removeChild(this);
    }
};
HTMLElement.prototype.clear=function(index){
    if(index==null){
        while (this.hasChildNodes()) {
            this.removeChild(this.lastChild);
        }
    }else if(index>=0 && index<this.children.length){
        this.removeChild(this.children[index]);
    }
    return this;
};
//---------------------------------------- html text
HTMLElement.prototype.html=function(str){
    if(str!=null){
        this.innerHTML=str;
    }else{
        return this.innerHTML;
    }
};
HTMLElement.prototype.text=function(str){
    // this.innerHTML= str.replace(/</g,"&lt;").replace(/>/g,"&gt;")
    if(str!=null){
        this.appendChild(document.createTextNode(str));
        return this;
    }else{
        return this.innerHTML;
    }
};
//---------------------------------------- width height top left
HTMLElement.prototype.width=function(num){
    if(num!=null){
        this.style.width=num;
        return this;
    }
    return this.offsetWidth;
};
HTMLElement.prototype.height=function(num){
    if(num!=null){
        this.style.height=num;
        return this;
    }
    return this.offsetHeight;
};
HTMLElement.prototype.top=function(num){
    if(num!=null){
        this.style.top=num;
        return this;
    }
    return this.offsetTop;
};
HTMLElement.prototype.left=function(num){
    if(num!=null){
        this.style.left=num;
        return this;
    }
    return this.offsetLeft;
};
HTMLElement.prototype.getScreenTop=function(e){
    e=e || this
    var offset=e.offsetTop; 
    if(e.offsetParent!=null) offset+=e.getScreenTop(e.offsetParent); 
    return offset; 
};
HTMLElement.prototype.getScreenLeft=function(e){
    e=e || this
    var offset=e.offsetLeft; 
    if(e.offsetParent!=null) offset+=e.getScreenLeft(e.offsetParent); 
    return offset; 
};
HTMLElement.prototype.show=function(){
    this.style.display="block";
};
HTMLElement.prototype.hide=function(){
    this.style.display="none";
};