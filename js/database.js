function Database(){
    var self={}
    var db = window.openDatabase("QQmusic", "1.0","",20000)
    // db.transaction(function(tx) {
    //     tx.executeSql("DROP TABLE songlist");
    // })
    
    executeSql("CREATE TABLE IF NOT EXISTS songlist (\
            id INT UNIQUE,\
            idx INT,\
            songname TEXT,\
            diskname TEXT,\
            singername TEXT,\
            singerid INT,\
            diskid INT,\
            location INT,\
            playtime INT,\
            url TEXT,\
            mv TEXT\
        )");
    executeSql("CREATE TABLE IF NOT EXISTS playlists (\
            name TEXT UNIQUE\
        )",null,function(){
        executeSql("INSERT INTO playlists (name) values(?)",null,function(){},function(){})
    });

    var option={
        id:0,
        idx:0,
        songname:"",
        diskname:"",
        singername:"",
        singerid:0,
        diskid:0,
        location:0,
        playtime:0,
        url:"",
        mv:"",
    }
    self.exportSongs=function(callback){
        var sqlStatement="SELECT * FROM songlist"
        executeSql(sqlStatement, null,
            function(result){
                var obj=[]
                for(var i = 0; i < result.rows.length; i++){ 
                    obj.unshift(result.rows.item(i))
                }
                callback(obj)
            }
        );
    }
    self.importSongs=function(setting){
        if(typeof(setting)=="string"){
            setting=eval(setting)
        }
        executeSql("DELETE FROM songlist")
        
        // for(var i=setting.length-1;i>0;i--){
        //     self.addSong(setting[i])
        // }
        
        //------------------------Asynchronous
        var i=setting.length
        function addSong(){
        	i--
        	if(i>=0){
	        	self.addSong(setting[i],addSong)
                messageBox.alert("importing ( "+(setting.length-i)+"/"+setting.length+" ) ...")
	        }else{
	        	messageBox.alert("imported "+setting.length+" songs, finish!")
                window.location.reload();
	        }
        }
        if(setting.length>0)addSong();
    }
    self.addPlayList=function(name,callback){
        executeSql("CREATE TABLE IF NOT EXISTS playlist_"+name+" (\
                id INT UNIQUE,\
                idx INT UNIQUE\
            )",null,
            function(){
                executeSql("INSERT INTO playlists (name) values(?)", [name],function(){
                    callback()
                })
        });
    }
    // self.updatePlayList=function(oldname,newname){
    //     var sqlStatement="UPDATE playlists set name=? WHERE name='"+oldname+"'"
    //     executeSql(sqlStatement, [newname]);

    //     var sqlStatement="UPDATE songlist set playlist=? WHERE playlist='"+oldname+"'"
    //     executeSql(sqlStatement,[newname]);
    // }
    self.deletePlayList=function(name){
        executeSql("DROP TABLE playlist_"+name,null,function(){
            executeSql("DELETE FROM playlists WHERE name='"+name+"'")
        });
    }
    self.getPlayList=function(callback){
        var sqlStatement="SELECT * FROM playlists"
        executeSql(sqlStatement, null,
            function(result){
                var obj=[]
                for(var i = 0; i < result.rows.length; i++){ 
                    obj.push(result.rows.item(i))
                }
                callback(obj)
            }
        );
    }
    self.orderPlayList=function(callback){

    }
    self.addSong=function(setting,callback){
        var sqlStatement="INSERT INTO songlist ("
        var count=0
        var values=[]
        for(var i in setting){
            if(option[i]!=null){
                count++
                sqlStatement+=i+","
                values.push(setting[i])
            }
        }
        sqlStatement=sqlStatement.substring(0,sqlStatement.length-1)+") values("
        for(var i=0;i<count;i++){
            sqlStatement+="?,"
        }
        sqlStatement=sqlStatement.substring(0,sqlStatement.length-1)+")"
        executeSql(sqlStatement, values, callback);
    }
    self.deleteSong=function(id){
        executeSql("DELETE FROM songlist WHERE id="+id)
    }
    self.updateSong=function(id,key,value){
        var sqlStatement="UPDATE songlist set "+key+" =? WHERE id="+id
        executeSql(sqlStatement,[value]);
    }
    // self.getSong_all=function(callback){
    //     getSong(callback,"ORDER BY singername")
    // }
    // self.getSong_new=function(ID,callback){
    //     getArticle(ID,callback,"WHERE state='new' ORDER BY pubDate DESC")
    // }
    // self.getSong_all=function(ID,callback){
    //     getArticle(ID,callback,"ORDER BY pubDate DESC LIMIT 5 OFFSET 0")
    // }
    self.getSong=function(playlist,callback,filter){
        if(playlist){
            var sqlStatement="SELECT * FROM playlist_"+name
            executeSql(sqlStatement, null,
                function(result){
                    // var obj=[]
                    // for(var i = 0; i < result.rows.length; i++){ 
                    //     obj.unshift(result.rows.item(i))
                    // }
                    // callback(obj)
                    //??????????????????????????????????????????
                }
            );
        }else{
            var sqlStatement="SELECT * FROM songlist"
            executeSql(sqlStatement, null,
                function(result){
                    var obj=[]
                    for(var i = 0; i < result.rows.length; i++){ 
                        obj.unshift(result.rows.item(i))
                    }
                    callback(obj)
                }
            );
        }
        
        
    }
    function executeSql(sqlStatement,values,callback,errorHandler){
        db.transaction(function(tx) {
            tx.executeSql(sqlStatement, values?values:[], function(tx,result){
                if(callback)callback(result);
            },function(tx,e){
                if(errorHandler){errorHandler();}
                else{DD(e.message,sqlStatement);}
            });
        });
    }
    return self
}