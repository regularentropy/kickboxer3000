
if(!window.kbmodules){window.kbmodules={}};
if(!window.kbmodules.starting_page){window.kbmodules.starting_page={}};





window.kbmodules.starting_page.save_creds = function()
{
	ksys.context.global.cache['vmix_ip'] = $('#welcome_enter_info [ip]').val()
	ksys.context.global.cache['vmix_port'] = $('#welcome_enter_info [port]').val()
	ksys.context.global.save()
	window.location.reload()
}








