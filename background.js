const default_options = {
	custom_range_list:{
		m: [3,6,18]
	},
	check_tools_always_auto_open: true
}

chromeAPI.storage_local_get( null , items=>{
	for (const key in default_options) {
		if(typeof items[key] === "undefined"){
			chromeAPI.storage_local_set({[key]: default_options[key]}, ()=>console.log(key, "set default"));
		}
	}
});





