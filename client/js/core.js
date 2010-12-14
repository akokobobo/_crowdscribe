(function() {
	var BASE_NS = 'CS';
    var ns_exp = new RegExp('^(' + BASE_NS + '\.?)+');
	window[BASE_NS] = {
		/** 
		 * Create a namespace and extend it with and object literal
		 * @param {string} namespace the namespace to create
		 * @param {object} obj (optional) object to extend namespace
		 */
		namespace: function(namespace, obj) {
			var ns = createNamespace(namespace.replace(ns_exp, ''));
			if (obj) { $.extend(ns, obj); }
		}
	}
    
    
    /**
     * Create a namespace and return the namespaced object literal.
     * @param {string} namespace the namespace to create
     * @returns {object} the namespaced object literal or nil
     */
    function createNamespace(namespace) {
        if (!namespace) { return null; }
        var obj = window[BASE_NS];
        $(namespace.split('.')).each(function(i, item) {
			if(!obj[item]) obj[item] = {};
			obj = obj[item];
        });
        return obj;
    }
})();