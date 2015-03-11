/**
 * @author wangjincai(wangjincai@baidu.com)
 **/

 define('cache', [], function() {
 	var exports = {};
 	var win = window;
 	var storage = win.localStorage;
	// 判断是否支持localstorage
 	function isLocalStorageNameSupported() {
    try {
      var supported = ('localStorage' in win && storage);
      if (supported) {
      	// 精确检测，防止我们自己cache大于storage的上限以后
        var tempKey = storage.key(0);
        var tempData = storage.getItem(tempKey);
        if(tempKey) {
        	storage.removeItem(tempKey);
        	storage.setItem(tempKey, tempData);
        } else {
        	storage.setItem("__storage__", "");
        	storage.removeItem( "__storage__" );
        }
      }
     return supported;
    } catch(err) { 
    	return false;
    }
	}
	exports.set = function (key, val) {};
	exports.get = function (key, defaultVal) { return defaultVal; };
	exports.remove = function (key) {};
	exports.clear = function () {};
	exports.some =  function (match) {};
	exports.getItems = function (keys) {};
	exports.getAllkeys =  function () {};
 	exports.serialize = function (val) {
 		return JSON.stringify( val );
 	}
 	exports.deserialize = function (val) {
 		if (typeof val != 'string') { 
 			return undefined;
 		}
		try { 
			return JSON.parse(val);
		} catch(e) { 
			return val || undefined;
		}
 	}
 	exports.supported = isLocalStorageNameSupported();
 	if(exports.supported) {
 		exports.set = function (key, val) {
			if ( val === undefined ) { 
				return store.remove(key);
			}
		try {
				storage.setItem(key, exports.serialize(val));
			} catch (e) {}
			return val;
	 	}
	 	exports.get = function (key, defaultVal) {
	 		var val = exports.deserialize(storage.getItem(key));
			return (val === undefined ? defaultVal : val);
	 	}
	 	exports.remove = function (key) {
	 		var val = exports.get(key);
	 		storage.removeItem(key);
	 		return val;
	 	}
	 	exports.clear = function () {
	 		storage.clear();
	 	}
	 	exports.some = function (match) {
	 		var _len = storage.length;
	 		var key = '';
	 		var pattern = new RegExp(match);
	 		var keys = [];
	 		for(var i = 0; i < _len; i++) {
	 			key = storage.key(i);
	 			if(key.match(pattern)) {
	 				keys.push(key);
	 			}
	 		}
	 		return keys;
	 	}
	 	exports.getItems = function (keys) {
	 		var itemList = {};
	 		for(var i = 0, _len = keys.length; i < _len; i++) {
	 			itemList[keys[i]] = exports.get(keys[i]);
	 		}
	 		return itemList;
	 	}
	 	exports.getAllkeys = function () {
	 		var keys = [];
	 		for (var i = 0, _len = storage.length; i < _len; i++) {
	 			keys.push(storage.key(i));
	 		}
	 		return keys;
	 	}
 	}
 	return exports;
 });