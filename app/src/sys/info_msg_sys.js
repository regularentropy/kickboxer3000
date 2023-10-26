const msgsys = {};



const polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
	const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians)),
	};
}

const describeArc = function(x, y, radius, startAngle, endAngle){

	const start = polarToCartesian(x, y, radius, endAngle);
	const end = polarToCartesian(x, y, radius, startAngle);

	const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

	const d = [
	    'M', start.x, start.y, 
	    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(' ');

	return d
}



const magic_circle = class{
	constructor(){
		this.dom = $(`
			<svg viewBox="-100 -100 200 200">
				<path fill="none" stroke="white" stroke-width="190px" />
			</svg>
		`)[0];

		this.tgt_path = this.dom.querySelector('path');
	}

	async launch_anim(dur=500){
		const step_angle = 1;
		const step_count = 360 / step_angle;
		// const step_dur = step_count / dur;
		const step_dur = dur / step_count;

		let current_angle = 0;

		while (true){
			await ksys.util.sleep(step_dur)
			current_angle += step_angle;
			this.tgt_path.setAttribute('d', describeArc(0, 0, 100-10, 0, current_angle.clamp(0, 360)))

			if (current_angle >= 359){
				break
			}
		}
	}
}


// - text: Text
// - msg_type:
//     - 'err': Red Error
//     - 'ok': Green ok
//     - 'warn': Yellow warning
const info_msg = class{
	constructor(text, msg_type='warn', dur=1000){
		const self = this;

		this.pie = new magic_circle()
		this.msg_body = $(`<div ${msg_type} class="kbmsg">${text}</div>`)[0]
		this.msg_body.prepend(this.pie.dom)
		$('hintsys-bar #hintsys_bar_msgs').prepend(this.msg_body)

		this.pie.launch_anim(dur)
		.then((value) => {
			this.msg_body.remove()
		});
	}
}


const fuck_js = function(text, msg_type='warn', dur=1000){
	return new info_msg(text, msg_type, dur)
}


module.exports = {
	send_msg: fuck_js,
}








