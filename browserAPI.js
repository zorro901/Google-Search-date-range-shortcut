// v1
const chromeAPI = new class {
	constructor(){
		this.browser_code = (typeof browser !== "undefined") ? 2 : 1;
		console.log("browser_chk!", this.browser_code === 1 ? "chrome" : "FF");
	}
	
	ff_error(err){
		console.error("browser API error",err);
	}
	
	check(){
		this.browser_code = (typeof browser !== "undefined") ? 2 : 1;
		console.log("browser_chk!", this.browser_code);
		return this.browser_code;
	}

	storage_local_get(keys, callback){
		if(this.browser_code === 1){
			return chrome.storage.local.get(keys, callback);
		}
		else{
			return browser.storage.local.get(keys).then(callback, this.ff_error);
		}
	}

	storage_local_set(keys, callback){
		if(this.browser_code === 1){
			return chrome.storage.local.set(keys, callback);
		}
		else{
			return browser.storage.local.set(keys).then(callback, this.ff_error);
		}
	}

	storage_local_clear(keys, callback){
		if(this.browser_code === 1){
			return chrome.storage.local.clear(keys, callback);
		}
		else{
			return browser.storage.local.clear(keys).then(callback, this.ff_error);
		}
	}
	
	getMessage(messageName){
		if(this.browser_code === 1){
			return chrome.i18n.getMessage(messageName);
		}
		else{
			return browser.i18n.getMessage(messageName);
		}
	}

	runtime_getURL(path){
		if(this.browser_code === 1){
			return chrome.runtime.getURL(path);
		}
		else{
			return browser.runtime.getURL(path);
		}
	}

	runtime_getManifest(){
		if(this.browser_code === 1){
			return chrome.runtime.getManifest();
		}
		else{
			return browser.runtime.getManifest();
		}
	}
}();
