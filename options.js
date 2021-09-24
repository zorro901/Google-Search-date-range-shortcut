window.addEventListener('load', ()=>{
	const time_unit = document.getElementById('time_unit');
	time_unit.querySelector('option[value=h]').textContent = chromeAPI.getMessage("h_text");
	time_unit.querySelector('option[value=d]').textContent = chromeAPI.getMessage("d_text");
	time_unit.querySelector('option[value=w]').textContent = chromeAPI.getMessage("w_text");
	time_unit.querySelector('option[value=m]').textContent = chromeAPI.getMessage("m_text");
	time_unit.querySelector('option[value=y]').textContent = chromeAPI.getMessage("y_text");
	document.getElementById("add_range_button").textContent = chromeAPI.getMessage("add_button");
	document.getElementById("always_tools_open_label").textContent = chromeAPI.getMessage("always_tools_open");
	console.log(chromeAPI.runtime_getManifest().version);


	function reload_list(items){
		const qdr_list = items.custom_range_list;
		const range_list = document.getElementById("range_list");
		const htmlstr = { h:"", d:"", w:"", m:"", y:"" };
		for(const key in qdr_list){
            if(qdr_list[key] && qdr_list[key].length){
                qdr_list[key].forEach((item)=>{
					htmlstr[key] += `<li>${chromeAPI.getMessage("qdr_"+key+"_text_H") + item + chromeAPI.getMessage("qdr_"+key+"_text_T")}<span class="close" data-key="${key}" data-val="${item}">&#10007;</span></li>`;
                });
            }
		}
		range_list.innerHTML = htmlstr.h + htmlstr.d + htmlstr.w + htmlstr.m + htmlstr.y;
	}



	chromeAPI.storage_local_get( null , items=>{
		console.log(items);
		if(items.check_tools_always_auto_open){
			document.getElementById("check_always_tools_open_id").checked = true;
		}
		reload_list(items);
		
	});




	document.getElementById("add_range_button").addEventListener("click", (e)=>{
		const range = document.getElementById("range");
		const time_unit = document.getElementById("time_unit");
		if(!range.value || !time_unit.value || isNaN(range.value) || Number(range.value) <= 1 || Number(range.value) > 10000){
			alert(chromeAPI.getMessage("no_value"));
			e.target.blur();
			return;
		}

		console.log(range.value, time_unit.value);

		let range_v = Number(range.value);

		chromeAPI.storage_local_get( "custom_range_list" , items=>{
			if(!items.custom_range_list[time_unit.value]){
				items.custom_range_list[time_unit.value] = [];
			}
			items.custom_range_list[time_unit.value].push(range_v);
			items.custom_range_list[time_unit.value] = [...new Set(items.custom_range_list[time_unit.value])];

			for(const k in items.custom_range_list){
				items.custom_range_list[k] = items.custom_range_list[k].sort((a,b)=>{return a-b});
			}

			chromeAPI.storage_local_set({'custom_range_list': items.custom_range_list}, ()=>{
				console.log(items.custom_range_list, "저장");
				reload_list(items);
				e.target.blur();
			});
		});
	});

	document.getElementById("range_list").addEventListener("click", (e)=>{
		if(e.target.matches(".close")){
			const del_range_k = e.target.getAttribute("data-key");
			const del_range_v = Number(e.target.getAttribute("data-val"));
			chromeAPI.storage_local_get( "custom_range_list" , items=> {
				const del_index = items.custom_range_list[del_range_k].indexOf(del_range_v);
				if (del_index > -1) {
					items.custom_range_list[del_range_k].splice(del_index, 1);
				}
				chromeAPI.storage_local_set({'custom_range_list': items.custom_range_list}, ()=>{
					console.log(items.custom_range_list, "삭제");
					reload_list(items);
				});
			});
		}
	});

	document.getElementById("check_always_tools_open_id").addEventListener("click", (e)=>{
		chromeAPI.storage_local_set({'check_tools_always_auto_open': e.target.checked}, ()=> console.log(e.target.checked,"save"));
	});
	
});





