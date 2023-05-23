
if(!kbmodules){kbmodules={}};

if(!kbmodules.kickboxing_standard){kbmodules.kickboxing_standard={}};





kbmodules.kickboxing_standard.edit_mode_active = false;
kbmodules.kickboxing_standard.counter = {};

kbmodules.kickboxing_standard.load = function()
{
	// spawn rounds
	print('kickboxing init')
	const roundspool = document.querySelector('rounds pool');
	const fresh_context = ksys.context.module.pull();

	for (let rnd of range(int(document.querySelector('rounds').getAttribute('amount')))){
		roundspool.append($(`<round round_index=${rnd+1} onclick="kbmodules.kickboxing_standard.set_round(${rnd+1}, true)">${rnd+1}</round>`)[0])
	}

	// load pairs
	kbmodules.kickboxing_standard.load_paris()
	// this just has to be here... Dont fucking question it you mongrel
	kbmodules.kickboxing_standard.toggle_edit(false)

	// context.module.pull()

	// context stuff
	$('input[round_duration]').val(fresh_context.round_duration_exp)
	$('input[res_path]').val(fresh_context.resource_path)

	// round
	$(`round[round_index="${fresh_context.current_round}"]`).css('color', 'lime')

	// pair
	$(`#pairs_pool pairnum[pair_index="${fresh_context.active_pair_index}"]`).css('color', 'lime')

	if (fresh_context.current_player){
		$('player.active_player').removeClass('active_player');
		const selected_player = fresh_context.current_player.split('-');
		$(`pairnum[pair_index="${selected_player[0]}"]`).closest('pair').find(`player[${selected_player[1]}]`).addClass('active_player')
	}

}




kbmodules.kickboxing_standard.add_pair = function()
{
	// oncontextmenu="kbmodules.kickboxing_standard.del_pair(this)"
	// onclick="kbmodules.kickboxing_standard.upd_vs_title(this.getAttribute("pair_index"))"
	const pair = ksys.tplates.index_tplate(
		'#pair_asset',
		{
			'root':    'pair',
			'pairnum': 'pairnum',
		}
	)
	pair.index.root.oncontextmenu = function(_self){
		kbmodules.kickboxing_standard.del_pair(_self.target.closest('pair'))
	}
	pair.index.pairnum.onclick = function(_self){
		kbmodules.kickboxing_standard.upd_vs_title(_self.target.getAttribute('pair_index'))
	}

	document.querySelector('#pairs_pool').append(pair.elem)


	// enumarate pairs
	kbmodules.kickboxing_standard.enumerate_pairs()
}

kbmodules.kickboxing_standard.enumerate_pairs = function()
{
	const p_pool = [...document.querySelectorAll('#pairs_pool pairnum')]
	for (let enm in p_pool){
		// print('fuckoff', p_pool[enm])
		p_pool[enm].textContent = str(int(enm) + 1);
		p_pool[enm].setAttribute('pair_index', str(int(enm) + 1));
	}
}


kbmodules.kickboxing_standard.del_pair = function(pr)
{
	if (pr && (kbmodules.kickboxing_standard.edit_mode_active == true)){
		pr.remove()
		kbmodules.kickboxing_standard.enumerate_pairs()
	}
}



kbmodules.kickboxing_standard.toggle_edit = function(state=null)
{
	// Sometimes I stagger even myself with my genius
	if (state == false || state == true){
		kbmodules.kickboxing_standard.edit_mode_active = !state
	}


	if (kbmodules.kickboxing_standard.edit_mode_active == false){
		kbmodules.kickboxing_standard.edit_mode_active = true;

		kbmodules.kickboxing_standard.enumerate_pairs()

		// unlimit height
		// $('kbstandard #pairs_pool').css('height', 'auto')

		// hide display
		$('kbstandard #pairs_pool display').css('display', 'none');


		// beauty clicks
		$('kbstandard #pairs_pool player').attr('noclick', true);

		// unhide editors
		$('#pairs_pool > sysbtn, players player p_param').css('display', '')
		return
	}

	if (kbmodules.kickboxing_standard.edit_mode_active == true){
		kbmodules.kickboxing_standard.edit_mode_active = false;

		// unhide display
		$('kbstandard #pairs_pool display').css('display', '');


		// evalueate displays
		for (var evl of document.querySelectorAll('#pairs_pool players player')){
			evl.querySelector('display').textContent = evl.querySelector('p_param[p_name] input').value
		}

		kbmodules.kickboxing_standard.enumerate_pairs()

		// limit height
		// $('kbstandard #pairs_pool').css('height', '600px');

		// block beauty clicks
		$('kbstandard #pairs_pool player').removeAttr('noclick');

		// hide editors
		$('#pairs_pool > sysbtn:not(sysbtn[btname="toggle_edit_mode"]), players player p_param').css('display', 'none')
		return
	}
}


kbmodules.kickboxing_standard.save_pairs = function(tofile=false)
{
	var collected = []
	for (let pair of document.querySelectorAll('#pairs_pool pair')){
		collected.push({
			'left':{
				'name':    pair.querySelector('player[left] p_param[p_name] input').value,
				'age':     pair.querySelector('player[left] p_param[p_age] input').value,
				'height':  pair.querySelector('player[left] p_param[p_height] input').value,
				'weight':  pair.querySelector('player[left] p_param[p_weight] input').value,
				'country': pair.querySelector('player[left] p_param[p_country] input').value,
				'record':  pair.querySelector('player[left] p_param[p_record] input').value,
			},
			'right':{
				'name':    pair.querySelector('player[right] p_param[p_name] input').value,
				'age':     pair.querySelector('player[right] p_param[p_age] input').value,
				'height':  pair.querySelector('player[right] p_param[p_height] input').value,
				'weight':  pair.querySelector('player[right] p_param[p_weight] input').value,
				'country': pair.querySelector('player[right] p_param[p_country] input').value,
				'record':  pair.querySelector('player[right] p_param[p_record] input').value,
			}
		})
	}

	if (tofile == true){
		return JSON.stringify(collected, null, 4)
	}else{
		ksys.db.module.write('pairs_dict.pootis', JSON.stringify(collected, null, 4))
	}
	
}


// overwrite takes a JOn object/json containing pairs
kbmodules.kickboxing_standard.load_paris = function(overwrite=null)
{
	// wipe existing
	$('#pairs_pool pair').remove();

	// load saved, if any
	var pairs_dict = ksys.db.module.read('pairs_dict.pootis') || overwrite;
	// only if they exist in the first palce...
	if (!pairs_dict){return}

	// make JSON out of it
	pairs_dict = JSON.parse(pairs_dict)

	// spawn pairs one by one
	for (let pair of pairs_dict){
		document.querySelector('#pairs_pool').append(lizard.ehtml(`
			<pair oncontextmenu="kbmodules.kickboxing_standard.del_pair(this)">
				<pairnum click_contrast onclick="kbmodules.kickboxing_standard.upd_vs_title(this.getAttribute('pair_index'))"></pairnum>
				<players>
					<player left click_contrast noclick onclick="kbmodules.kickboxing_standard.upd_personal_title(this)">
						<display></display>
						<p_param p_name>
							<descr>Name</descr>
							<input type="text" placeholder="Player Name" value="${pair.left.name}">
						</p_param>
						<p_param p_age>
							<descr>Age</descr>
							<input type="text" placeholder="Player Age" value="${pair.left.age}">
						</p_param>
						<p_param p_height>
							<descr>Height</descr>
							<input type="text" placeholder="Player Height" value="${pair.left.height}">
						</p_param>
						<p_param p_weight>
							<descr>Weight</descr>
							<input type="text" placeholder="Player Weight" value="${pair.left.weight}">
						</p_param>
						<p_param p_country>
							<descr>Country</descr>
							<input type="text" placeholder="Player's Country of Origin" value="${pair.left.country}">
						</p_param>
						<p_param p_record>
							<descr>Record</descr>
							<input type="text" placeholder="Player Record" value="${pair.left.record}">
						</p_param>
					</player>


					<player right click_contrast noclick onclick="kbmodules.kickboxing_standard.upd_personal_title(this)">
						<display></display>
						<p_param p_name>
							<descr>Name</descr>
							<input type="text" placeholder="Player Name" value="${pair.right.name}">
						</p_param>
						<p_param p_age>
							<descr>Age</descr>
							<input type="text" placeholder="Player Age" value="${pair.right.age}">
						</p_param>
						<p_param p_height>
							<descr>Height</descr>
							<input type="text" placeholder="Player Height" value="${pair.right.height}">
						</p_param>
						<p_param p_weight>
							<descr>Weight</descr>
							<input type="text" placeholder="Player Weight" value="${pair.right.weight}">
						</p_param>
						<p_param p_country>
							<descr>Country</descr>
							<input type="text" placeholder="Player's Country of Origin" value="${pair.right.country}">
						</p_param>
						<p_param p_record>
							<descr>Record</descr>
							<input type="text" placeholder="Player Record" value="${pair.right.record}">
						</p_param>
					</player>
				</players>
			</pair>
		`))
	}

	// and enumerate pair indexes
	kbmodules.kickboxing_standard.enumerate_pairs()
}





kbmodules.kickboxing_standard.save_res_path = function()
{
	ksys.context.module.prm('resource_path', document.querySelector('input[res_path]').value)
}


kbmodules.kickboxing_standard.save_timer_duration = function()
{
	ksys.context.module.prm('round_duration', eval(document.querySelector('input[round_duration]').value) * 1000, false);
	ksys.context.module.prm('round_duration_exp', document.querySelector('input[round_duration]').value)
}




















// process VS screen
// todo: this could be done easier by splitting the save function into ripper and saver itself...
kbmodules.kickboxing_standard.upd_vs_title = async function(p_index=null)
{
	// if (!pindex){return}
	// do NOT do this in edit mode!
	if (kbmodules.kickboxing_standard.edit_mode_active == true){return}

	$('#pairs_pool pairnum').css('color', '');
	$(`#pairs_pool pairnum[pair_index="${p_index}"]`).css('color', 'lime')


	// save selected pair index
	ksys.context.module.prm('active_pair_index', p_index)

	// select the corresponding pair in the gui
	var pair_elem = $(`#pairs_pool pairnum[pair_index="${p_index}"]`).closest('pair');
	print('PAIR ITEM', pair_elem)
	// correspondance dictionary
	var c_dict = {
		// Left
		'name_l': {
			'gui': 'player[left] p_param[p_name] input',
			'vmix': 'name_L.Text'
		},
		'age_l': {
			'gui': 'player[left] p_param[p_age] input',
			'vmix': 'age_L.Text'
		},
		'height_l': {
			'gui': 'player[left] p_param[p_height] input',
			'vmix': 'height_L.Text'
		},
		'weight_l': {
			'gui': 'player[left] p_param[p_weight] input',
			'vmix': 'weight_L.Text'
		},
		'country_l': {
			'gui': 'player[left] p_param[p_country] input',
			'vmix': 'flag_L.Source'
		},
		'record_l': {
			'gui': 'player[left] p_param[p_record] input',
			'vmix': 'record_L.Text'
		},


		// Right
		'name_r': {
			'gui': 'player[right] p_param[p_name] input',
			'vmix': 'name_R.Text'
		},
		'age_r': {
			'gui': 'player[right] p_param[p_age] input',
			'vmix': 'age_R.Text'
		},
		'height_r': {
			'gui': 'player[right] p_param[p_height] input',
			'vmix': 'height_R.Text'
		},
		'weight_r': {
			'gui': 'player[right] p_param[p_weight] input',
			'vmix': 'weight_R.Text'
		},
		'country_r': {
			'gui': 'player[right] p_param[p_country] input',
			'vmix': 'flag_R.Source'
		},
		'record_r': {
			'gui': 'player[right] p_param[p_record] input',
			'vmix': 'record_R.Text'
		}

	}

	for (let apply in c_dict){
		await vmix.talker.talk({
			'Function': 'SetText',
			'Value': $(pair_elem).find(c_dict[apply]['gui']).val().trim(),
			'Input': 'vs_main.gtzip',
			'SelectedName': c_dict[apply]['vmix']
		})
	}

	// set countries
	var ctx = ksys.context.module.pull()
	if (ctx.resource_path && ctx.resource_path != ''){
		// LEFT
		await vmix.talker.talk({
			'Function': 'SetImage',
			'Value': str((new pathlib(ctx.resource_path)).join('flags', $(pair_elem).find(c_dict['country_l']['gui']).val().trim())).replaceAll('/', '\\'),
			'Input': 'vs_main.gtzip',
			'SelectedName': c_dict['country_l']['vmix']
		})
		// Right
		await vmix.talker.talk({
			'Function': 'SetImage',
			'Value': str((new pathlib(ctx.resource_path)).join('flags', $(pair_elem).find(c_dict['country_r']['gui']).val().trim())).replaceAll('/', '\\'),
			'Input': 'vs_main.gtzip',
			'SelectedName': c_dict['country_r']['vmix']
		})
		// Background
		await vmix.talker.talk({
			'Function': 'SetImage',
			'Value': str((new pathlib(ctx.resource_path)).join('pair_pool', `${p_index}.png`)).replaceAll('/', '\\'),
			'Input': 'vs_main.gtzip',
			'SelectedName': 'player_pair.Source'
		})
	}


}



kbmodules.kickboxing_standard.upd_personal_title = async function(player)
{
	if (kbmodules.kickboxing_standard.edit_mode_active == true){return};

	const player_elem = $(player).closest('player');

	$('player.active_player').removeClass('active_player');
	player_elem.addClass('active_player');

	ksys.context.module.prm(
		'current_player',
		`${player_elem.closest('pair').find('pairnum').attr('pair_index')}-${(player_elem.attr('left') == '') ? 'left' : 'right'}`
	)

	// const pname = ksys.translit(player_elem.find('p_param[p_name] input').val().trim()).split(' ');

	$('#category_change input').val($(player).find('p_param[p_weight] input').val().trim())

	return

	// surname
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': pname.at(-1).trim(),
		'Input': 'personal.gtzip',
		'SelectedName': 'name.Text'
	})
	// name
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': pname[0].trim(),
		'Input': 'personal.gtzip',
		'SelectedName': 'surname.Text'
	})

	// height
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': $(player).find('p_param[p_height] input').val().trim(),
		'Input': 'personal.gtzip',
		'SelectedName': 'height.Text'
	})

	// weight
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': $(player).find('p_param[p_weight] input').val().trim(),
		'Input': 'personal.gtzip',
		'SelectedName': 'weight.Text'
	})

	

	// record
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': $(player).find('p_param[p_record] input').val().trim(),
		'Input': 'personal.gtzip',
		'SelectedName': 'record.Text'
	})

	// Country
	await vmix.talker.talk({
		'Function': 'SetImage',
		'Value': str((new pathlib(ksys.context.module.pull().resource_path)).join('flags', `${$(player).find('p_param[p_country] input').val().trim()}`)).replaceAll('/', '\\'),
		'Input': 'personal.gtzip',
		'SelectedName': 'country.Source'
	})
}





kbmodules.kickboxing_standard.set_round = function(r, resetround=false)
{
	// store current round number
	ksys.context.module.prm('current_round', r)

	$('round').css('color', '')
	$(`round[round_index="${r}"]`).css('color', 'lime')

	vmix.talker.talk({
		'Function': 'SetText',
		'Value': `ROUND ${str(r).trim()}`,
		'Input': 'timer.gtzip',
		'SelectedName': 'round.Text'
	})

	// reset round if asked
	if (resetround == true){
		kbmodules.kickboxing_standard.respawn_timer(false, false)
	}
	
}






kbmodules.kickboxing_standard.timer_callback = async function(ticks)
{

	var minutes = Math.floor(ticks.global / 60)
	var seconds = ticks.global - (60*minutes)
	// print('minutes:', minutes, 'seconds', seconds)
	// print('global:', ticks.global)

	if (ticks.global <= 6){
		kbmodules.kickboxing_standard.timer_hide(true)
	}

	// update
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': `${minutes}:${str(seconds).zfill(2)}`,
		'Input': 'timer.gtzip',
		'SelectedName': 'timer_time.Text'
	})
}

kbmodules.kickboxing_standard.respawn_manager = function(act)
{

	// onn = the big button onn
	// if there's no timer OR the prv one is dead - create one and start and then show
	// if there's timer and it's alive - unpase and show
	if (!kbmodules.kickboxing_standard.counter.alive){
		kbmodules.kickboxing_standard.respawn_timer(true, true)
	}else{
		if (kbmodules.kickboxing_standard.counter.alive == true){
			// clear pause
			// kbmodules.kickboxing_standard.timer_pause(false)
			kbmodules.kickboxing_standard.timer_show()
		} 
	}
}

kbmodules.kickboxing_standard.respawn_timer = async function(show=false, st=false)
{
	var minutes = Math.floor((ksys.context.module.pull().round_duration / 1000) / 60)
	var seconds = (ksys.context.module.pull().round_duration / 1000) - (60*minutes)

	// clear previous timer
	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': `${minutes}:${str(seconds).zfill(2)}`,
		'Input': 'timer.gtzip',
		'SelectedName': 'timer_time.Text'
	})

	// kill previous timer
	try{
		kbmodules.kickboxing_standard.counter.force_kill()
	}catch (error){
		console.log(error)
	}

	// spawn a timer
	kbmodules.kickboxing_standard.counter = ksys.ticker.spawn({
		'duration': ksys.context.module.pull().round_duration / 1000,
		'name': 'giga_timer',
		'infinite': false,
		'reversed': true,
		'callback': kbmodules.kickboxing_standard.timer_callback,
		'wait': true
	})
	// init and show, if asked
	if (st == true){
		// init
		kbmodules.kickboxing_standard.counter.fire()
		.then(function(_ticker) {
			_ticker.force_kill()
		})
	}

	if (show == true){
		await kbmodules.kickboxing_standard.timer_show()
	}
}


kbmodules.kickboxing_standard.timer_hide = async function(dopause=false)
{
	kbmodules.kickboxing_standard.timer_pause(dopause)
	// off
	await vmix.talker.talk({
		'Function': 'OverlayInput1Out',
		'Input': 'timer.gtzip',
	})
}

kbmodules.kickboxing_standard.timer_show = async function(unpause=true)
{
	kbmodules.kickboxing_standard.timer_pause(!unpause)
	// off
	await vmix.talker.talk({
		'Function': 'OverlayInput1In',
		'Input': 'timer.gtzip',
	})
}


kbmodules.kickboxing_standard.timer_pause = function(state=true)
{
	if (kbmodules.kickboxing_standard.counter){
		// do pause
		kbmodules.kickboxing_standard.counter.pause = state;
	}
}



kbmodules.kickboxing_standard.timer_set_time = function(tm=null)
{
	if (kbmodules.kickboxing_standard.counter && tm){
		// set time
		// kbmodules.kickboxing_standard.counter.set_global_tick(tm, true)

		// kill previous timer
		try{
			kbmodules.kickboxing_standard.counter.force_kill()
		}catch (error){}

		// spawn a timer
		kbmodules.kickboxing_standard.counter = ksys.ticker.spawn({
			'duration': (ksys.context.module.pull().round_duration / 1000) - tm,
			'name': 'giga_timer',
			'infinite': false,
			'reversed': true,
			'callback': kbmodules.kickboxing_standard.timer_callback,
			'wait': true
		})
		// init
		kbmodules.kickboxing_standard.counter.fire()
		.then(function(_ticker) {
			_ticker.force_kill()
		})

	}
}







kbmodules.kickboxing_standard.vs_onn = function()
{
	vmix.talker.talk({
		'Function': 'OverlayInput1In',
		'Input': 'vs_main.gtzip',
	})
}

kbmodules.kickboxing_standard.vs_off = function()
{
	vmix.talker.talk({
		'Function': 'OverlayInput1Out',
		'Input': 'vs_main.gtzip',
	})
}








kbmodules.kickboxing_standard.player_onn = function()
{
	vmix.talker.talk({
		'Function': 'OverlayInput1In',
		'Input': 'personal.gtzip',
	})
}

kbmodules.kickboxing_standard.player_off = function()
{
	vmix.talker.talk({
		'Function': 'OverlayInput1Out',
		'Input': 'personal.gtzip',
	})
}



kbmodules.kickboxing_standard.load_pairs_from_file = function()
{
	ksys.ask_for_file()
	.then(function(response) {
		try{
			kbmodules.kickboxing_standard.load_paris(JSON.parse(fs.readFileSync(response[0].path, {encoding:'utf8', flag:'r'})))
		}catch (error){
			console.error(error)
			print('Failed to load pairs from file. Most probable problem: invalid file.')
		}
	})
}



kbmodules.kickboxing_standard.save_pairs_to_file = function()
{
	lizard.textdl('boxing_pairs.preset', kbmodules.kickboxing_standard.save_pairs(true))
}



kbmodules.kickboxing_standard.set_category = async function()
{
	const v = $('#category_change input').val().trim();
	if (!v){return};

	await vmix.talker.talk({
		'Function': 'SetText',
		'Value': v + ' КГ',
		'Input': 'category.gtzip',
		'SelectedName': 'txt.Text'
	})
}





