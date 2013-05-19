function setTimeFormat(time){
	var min = parseInt(time / 60);
	min=(min<10)?("0"+min):min
	var sec=time%60
	sec=(sec<10)?("0"+sec):sec;
	return min+":"+sec
}

//--------------------------------------------- Json
function Json(){
    this.stringify=function(obj){
        switch(typeof obj){   
            case 'string':   
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';   
            case 'array':   
                return '[' + obj.map(this.stringify).join(',') + ']';   
            case 'object':   
                 if(obj instanceof Array){
                    var strArr = [];   
                    var len = obj.length;   
                    for(var i=0; i<len; i++){   
                        strArr.push(this.stringify(obj[i]));   
                    }   
                    return '[' + strArr.join(',') + ']';   
                }else if(obj==null){   
                    return 'null';  
                }else{   
                    var string = [];   
                    for (var property in obj) string.push(this.stringify(property) + ':' + self.stringify(obj[property]));   
                    return '{' + string.join(',') + '}';   
                }   
            case 'number':   
                return obj;   
            case'boolean':
                return new Boolean(obj);
            case false:   
                return obj;   
        }   
    };
    this.parse=function(str){
        return eval('(' + str + ')');   
    };
    return this;
}

//--------------------------------------------- Keyboard
function keyboard(type,event){
    var keycode=event.keyCode;
    switch(type){
        case "Number":if(keycode>=48 && keycode<=57)return true;break;
        case "Character":if(keycode>=65 && keycode<=90)return true;break;
        case "Enter":if(keycode==13)return true;break;
        case "Left":if(keycode==37)return true;break;
        case "Right":if(keycode==39)return true;break;
        case "Down":if(keycode==40)return true;break;
        case "Up":if(keycode==38)return true;break;
        case "BackSpace":if(keycode==8)return true;break;
        case "Spacebar":if(keycode==32)return true;break;
    }
}