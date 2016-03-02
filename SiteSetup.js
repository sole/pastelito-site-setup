var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

module.exports = function SiteSetup(args) {
	this.doIt = function() {
		console.log('doing it');
		console.log(args);

		completeArguments(args);

		console.log('completed');
		console.log(args);
		console.log('---------');

		// nginx config file
		var siteConfig = generateNginxConfigFile(args);
		console.log(siteConfig);


		// nginx ln -s sites-enabled
		// create site folder(s)
		// database
	}

	function completeArguments(args) {
		if(!args.directory) {
			args.directory = args.domain;
		}

		args.server_name = args.domain;
		args.site_path = path.join(args.www_path, args.directory);

		// For obvious reasons, no WP without PHP
		if(args.with_wordpress) {
			args.with_php = true;
		}
	}

	function generateNginxConfigFile(args) {
		var source = fs.readFileSync('./data/server.template.conf', 'utf-8');
		var template = Handlebars.compile(source);
		var result = template(args);
		return result;
	}
}
