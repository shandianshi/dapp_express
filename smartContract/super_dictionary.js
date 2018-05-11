"use strict";

var neta = function(text) {
	if (text) {
	    var obj=text;
		this.key = obj.key;
        this.publicContent = obj.publicContent;
		this.privateContent=obj.privateContent;
		this.price=obj.price;
	}
	else {
        this.publicContent="";
        this.privateContent="";
	    this.key = "";
        this.price=0;
	}
    this.commentPos=0;
    this.commentNeg=0;
};

neta.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var netaRepo = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new neta(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

netaRepo.prototype = {
    init: function () {
        this.size = 0;
        // todo
    },

    save: function (rawNetaObject) {
        var rawNetaObj=rawNetaObject;
        if (rawNetaObj.publicContent.length+ rawNetaObj.privateContent.length> 144 || rawNetaObj.key.length > 64 ){
            throw new Error("key / value exceed limit length")
        }
        var netaData = this.repo.get(rawNetaObj.key);
        if (netaData){
            throw new Error("该主题已被占用");
        }
        netaData = new neta(rawNetaObject);
        netaData.author = Blockchain.transaction.from;

        var index = this.size;
        this.arrayMap.set(index, rawNetaObj.key);
        this.size +=1;
        this.repo.put(rawNetaObj.key, netaData);
    },

    forEach: function(limit, offset){
        limit = parseInt(100);
        offset = parseInt(0);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
            number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var  object = this.repo.get(key);
            result.push(object);
        }
        return JSON.stringify(result);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }

        return this.repo.get(key);
    }
};
module.exports = netaRepo;