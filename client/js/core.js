(function() {
	var BASE_NS = 'CS';
	var CS = window.CS = {
	    /**
		 * Create a namespace and return the namespaced object literal.
		 * @param {string} namespace the namespace to create
		 * @returns {object} the namespaced object literal or nil
		 */
		_createNamespace: function(namespace) {
			if (namespace == '') { return null; }
			var names = namespace.split('.'), obj = window;
			for (var i = 0, len = names.length; i < len; i++) {
				if (typeof obj[names[i]] == 'undefined') { obj[names[i]] = {}; }
				obj = obj[names[i]];
			}
			return obj;
		},

		/** 
		 * Create a namespace and extend it with and object literal
		 * @param {string} namespace the namespace to create
		 * @param {object} obj (optional) object to extend namespace
		 */
		namespace: function(namespace, obj) {
			var names = (namespace == '') ? [] : namespace.split('.');
			if (names[0] != BASE_NS) { names.unshift(BASE_NS); }
	
			var ns = CS._createNamespace(names.join('.'));
			if (obj) { $.extend(ns, obj); }
		}
	}
	
	CS.namespace('player');
	CS.player.id = function() {
		var player_id;
		try {
			player_id = JSON.parse($.cookie('login')).id;
		} catch(e) {
			player_id = null;
		}
		
		return player_id;
	}
})();