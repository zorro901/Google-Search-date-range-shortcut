function run_script(items) {
	if (items.check_tools_always_auto_open) {
		const hdtbMenus = document.getElementById('hdtbMenus')
		const appbar = document.getElementById('appbar')
		if (hdtbMenus) {
			hdtbMenus.classList.add('hdtb-td-o')
			hdtbMenus.classList.remove('hdtb-td-c', 'hdtb-td-h')
			if (appbar) {
				appbar.classList.add('hdtb-ab-o')
				const resultStats = document.getElementById('resultStats')
				// const resultStats = document.getElementById('result-stats')
				if (resultStats) {
					resultStats.style.display = 'none'
					setTimeout(() => {
						resultStats.style.removeProperty('display')
					}, 500)
				}
			}
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	const now_date = new Date()
	const qdr_list = items.custom_range_list
	const html_list = []
	const qdr_id = {
		h: { id: 'qdr_h', text_h: chromeAPI.getMessage('qdr_h_text_H'), text_t: chromeAPI.getMessage('qdr_h_text_T') },
		d: { id: 'qdr_d', text_h: chromeAPI.getMessage('qdr_d_text_H'), text_t: chromeAPI.getMessage('qdr_d_text_T') },
		w: { id: 'qdr_w', text_h: chromeAPI.getMessage('qdr_w_text_H'), text_t: chromeAPI.getMessage('qdr_w_text_T') },
		m: { id: 'qdr_m', text_h: chromeAPI.getMessage('qdr_m_text_H'), text_t: chromeAPI.getMessage('qdr_m_text_T') },
		y: { id: 'qdr_y', text_h: chromeAPI.getMessage('qdr_y_text_H'), text_t: chromeAPI.getMessage('qdr_y_text_T') },
	}

	function getUrlPara(parameterName, newValue) {
		let para_array = window.location.search.substring(1).split('&')
		let new_para_str = ''
		let target_change_flag = false
		let now_parameter

		for (const key in para_array) {
			let keyvalue_pair = para_array[key].split('=')
			if (keyvalue_pair) {
				if (keyvalue_pair[0] === parameterName) {
					if (newValue) {
						new_para_str += new_para_str === '' ? '?' : '&'
						new_para_str += parameterName + '=' + newValue // 修正
					}
					now_parameter = keyvalue_pair[1]
					target_change_flag = true
				} else {
					new_para_str += new_para_str === '' ? '?' : '&'
					new_para_str += para_array[key]
				}
			}
		}
		if (target_change_flag === false && newValue) {
			new_para_str += new_para_str === '' ? '?' : '&'
			new_para_str += parameterName + '=' + newValue // 追加
		}
		return {
			new_url: window.location.pathname + new_para_str + window.location.hash,
			now_val: now_parameter,
			input_paraName: parameterName,
		}
		// アドレスの完成 : origin + pathname + search + hash
	}

	function make_newItemHtml(href, title, time_val, sampleItem) {
		const new_item = sampleItem.cloneNode(true)
		const a_ele = new_item.querySelector('a')
		a_ele.textContent = title
		a_ele.href = href
		new_item.setAttribute('data-time', time_val)
		return new_item.outerHTML
	}

	function minusDate_calculate(keyword, num, today = new Date(now_date)) {
		let result = new Date(today)
		switch (keyword) {
			case 'h':
				result.setHours(today.getHours() - num)
				break
			case 'd':
				result.setDate(today.getDate() - num)
				break
			case 'w':
				result.setDate(today.getDate() - num * 7)
				break
			case 'm':
				result.setMonth(today.getMonth() - num)
				break
			case 'y':
				result.setFullYear(today.getFullYear() - num)
		}
		return result
	}

	function def_menuItem_setTime(sample_menuItem) {
		const list = sample_menuItem.parentNode.childNodes //document.getElementById("qdr_").parentNode.childNodes;

		let count = 0
		list &&
			list.forEach((e) => {
				const a_tag = e.querySelector('a')
				// console.log('a_tag: ' + a_tag)
				// 一ヶ月までの期間を抽出
				if (a_tag) {
					const href = a_tag.getAttribute('href')
					const parameter = href.split('?').pop().split('&')
					parameter.some((para) => {
						const timepara = para.match(/^tbs=[^&]*qdr:([hdwmy])(\d*)$/)
						if (timepara) {
							count++
							e.setAttribute('data-time', minusDate_calculate(timepara[1], timepara[2] || 1).getTime())
							return true // break;
						}
					})
				} else {
					const now_val = getUrlPara('tbs').now_val
					// console.log('now_val: ' + now_val)  // qdr:y
					if (!now_val) {
						// 現在の日付の範囲が[すべての日付]の状態
						return
					}
					const timepara = now_val.match(/qdr(?::|%3A)([hdwmy])(\d*)$/)
					// console.log('timepara: ' + timepara) // qdr:y,y,
					if (timepara) {
						if (e.querySelectorAll('*').length > 2) {
							return // 期間設定ボタンは除く
						}
						count++
						e.setAttribute('data-time', minusDate_calculate(timepara[1], timepara[2] || 1).getTime())
					}
				}
			})
		return count === 0 ? false : true
	}

	// 追加された日付だけのリストを生成
	function make_new_menu_list(sample_menuItem) {
		console.log(sample_menuItem)
		for (const key in qdr_list) {
			qdr_list[key] &&
				qdr_list[key].length &&
				qdr_list[key].forEach((item) => {
					const time_val = minusDate_calculate(key, item).getTime()
					html_list.push([
						time_val,
						make_newItemHtml(
							getUrlPara('tbs', 'qdr:' + key + item).new_url,
							`${qdr_id[key].text_h}${item.toLocaleString('en-US')}${qdr_id[key].text_t}`,
							// `${qdr_id[key].text_h}${item.toLocaleString('ja-JP')}${qdr_id[key].text_t}`,
							time_val,
							sample_menuItem
						),
					])
				})
		}
	}

	function append_menuitem_html(sample_menuItem) {
		html_list &&
			html_list.forEach((me) => {
				const list = sample_menuItem.parentNode.childNodes // 挿入すると、リストが変わるため、毎回新たに募集
				if (!list) {
					return
				}
				let insert = false
				console.log(
					list.forEach((e) => {
						e.querySelectorAll('a').forEach((aele) => console.log(aele))
					})
				)

				list.forEach((e) => {
					const e_time = e.getAttribute('data-time')
					if (e_time && insert === false) {
						if (e_time < me[0]) {
							e.insertAdjacentHTML('beforebegin', me[1])
							insert = true
						} else if (e_time == me[0]) {
							insert = true
						}
					}
				})
				if (insert === false) {
					let last_qdr
					const reverse_list = [...list].reverse()
					reverse_list.some((e) => {
						if (e.hasAttribute('data-time')) {
							last_qdr = e
							return true
						}
					})
					if (last_qdr) {
						last_qdr.insertAdjacentHTML('afterend', me[1])
					} else {
						sample_menuItem.parentNode.insertAdjacentHTML('beforeend', me[1])
					}
				}
			})
	}

	// Googleから提示される正規の期間のみ抽出する
	function find_timemenu() {
		const qdr_m = []
		const qdr_y = []
		document.querySelectorAll('g-menu').forEach((e) => {
			e.querySelectorAll('a').forEach((aele) => {
				const href = aele.getAttribute('href')
				if (/tbs=[^&]*qdr:m/.test(href)) {
					const url = new URL(aele.href)
					qdr_m.push(aele)
				} else if (/tbs=[^&]*qdr:y/.test(href)) {
					qdr_y.push(aele)
				}
			})
		})
		// 1以上の結果の中からminの検索、通常minは、1出るが、1を超えることがありますので、
		const sort_result = [qdr_m, qdr_y].filter((e) => e.length).sort((a, b) => a.length - b.length)
		if (sort_result.length) {
			return sort_result[0][0]
		}
		return false
	}

	function run() {
		try {
			if (!document.getElementById('hdtb-tls')) {
				return true
			}
			const sample_atag = find_timemenu()
			if (!sample_atag) {
				return
			}
			const sample_menuItem = sample_atag.closest('g-menu-item')
			if (!def_menuItem_setTime(sample_menuItem)) {
				return true
			}
			make_new_menu_list(sample_menuItem)
			append_menuitem_html(sample_menuItem)
			return true
		} catch (e) {
			console.error('error!', e)
			return true
		}
	}

	if (!run()) {
		const observer = new MutationObserver(() => run() && observer.disconnect())
		observer.observe(document.getElementById('top_nav'), { subtree: true, childList: true })
	}
}

if (
	window.location.origin.match(/^http(s)?:\/\/(www.)?google.(\w{3}|\w{2}.\w{2})$/i) &&
	location.pathname.search(/^\/search/i) >= 0
) {
	chromeAPI.storage_local_get(null, run_script)
}
