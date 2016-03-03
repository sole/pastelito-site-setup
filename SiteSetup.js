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
		var configFilename = args.directory;
		var nginxSitesAvailablePath = path.join(args.nginx_conf_path, 'sites-available');
		var configPath = path.join(nginxSitesAvailablePath, configFilename);

		var siteConfig = generateNginxConfigFile(args);
		console.log(siteConfig);
		
		if(args.write_nginx_conf) {
			var configFilename = args.directory;
			var nginxSitesAvailablePath = path.join(args.nginx_conf_path, 'sites-available');
			var configPath = path.join(nginxSitesAvailablePath, configFilename);
			console.log('Writing site config to', configPath);
			fs.writeFileSync(configPath, siteConfig, 'utf-8');
		}

		if(args.enable_site) {
			var enabledConfigPath = path.join(args.nginx_conf_path, 'sites-enabled', configFilename);
			var cmd = 'ln -s ' + configPath + ' ' + enabledConfigPath;
			shelljs.exec(cmd);
		}
		
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
