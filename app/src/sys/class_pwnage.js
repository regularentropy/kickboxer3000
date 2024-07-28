// No one ever knows what value variable is..
// or what its type is...
// An array is technically just an object
// objects or object..
// null is technically not an object
// but objects can be null, so they technically can be non-objects
// unless they're an object, so technically null is an object



const remap = function(self){
	const prop_names = Object.getOwnPropertyNames(self.constructor.prototype);
	for (const func_name of prop_names){
		if (func_name == 'constructor'){continue};

		const original_func = self[func_name];

		if (original_func.constructor.name == 'AsyncFunction'){
			self[func_name] = async function(){
				return await original_func(self, ...arguments)
			}
		}

		if (original_func.constructor.name == 'Function'){
			self[func_name] = function(){
				return original_func(self, ...arguments)
			}
		}

		if (original_func.constructor.name == 'GeneratorFunction'){
			self[func_name] = function(){
				return original_func(self, ...arguments)
			}
		}
	}

	// Experimental: getters and setters
	const gs_dict = {
		'getters': {},
		'setters': {},
	}
	for (const func_name of prop_names){
		if (func_name == 'constructor'){continue};

		const real_func_name = func_name.replaceAll('$', '');

		if (func_name.startsWith('$$')){
			gs_dict.setters[real_func_name] = self[func_name];
			self[func_name] = undefined;
			continue
		}

		if (func_name.startsWith('$')){
			gs_dict.getters[real_func_name] = self[func_name];
			self[func_name] = undefined;
			continue
		}
	}

	for (const func_name of prop_names){
		if (func_name == 'constructor'){continue};

		const real_func_name = func_name.replaceAll('$', '');
		const prop_params = {};

		if (real_func_name in gs_dict.getters){
			prop_params['get'] = function(){
				return gs_dict.getters[real_func_name](self, ...arguments)
			}
		}
		if (real_func_name in gs_dict.setters){
			prop_params['set'] = function(){
				return gs_dict.setters[real_func_name](self, ...arguments)
			}
		}

		Object.defineProperty(self, real_func_name, prop_params)
	}

	return self
}








module.exports = {
	remap,
}