

$this.img_ext = [
	'.png',
	'.svg',
	'.webp',
	'.jpg',
	'.jpeg',
	'.apng',
	'.avif',
	'.jfif',
	'.gif',
];



$this.load = function(){
	print('Load ?')
	$this.list_assets()
}

// <div class="path">./${app_root.relative(file)}</div>
$this.list_assets = function(){
	for (const file of app_root.join('assets').globSync('*')){
		// print(file)
		if (!file.isFileSync()){continue};
		if ($this.img_ext.includes(file.suffixes.at(-1))){
			let is_bright = false;
			const elem = $(`
				<div class="list_entry">
					<img contain src="./assets/${file.basename}"></img>
				</div>
			`)[0];
			elem.onclick = function(){
				$('#asset_info').text(`./${app_root.relative(file)}`);
			}
			elem.oncontextmenu = function(){
				if (is_bright){
					elem.classList.remove('light');
					is_bright = false;
				}else{
					elem.classList.add('light');
					is_bright = true;
				}
			}
			$('#asset_list').append(elem);
		}
	}
}



