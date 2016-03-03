var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');
var shelljs = require('shelljs');

module.exports = function SiteSetup(args) {
	this.doIt = function() {

		completeArguments(args);

		console.log(args);
		
		console.log('---------');

		// nginx config file
		var configFilename = args.directory;
		var nginxSitesAvailablePath = path.join(args.nginx_conf_path, 'sites-available');
		var configPath = path.join(nginxSitesAvailablePath, configFilename);

		var siteConfig = generateNginxConfigFile(args);
		
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
		
		// Create site directories-this is a huge chore to do manually!
		if(args.create_directories) {
			createDirectories(args);
		}

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

	function createDirectories(args) {
		if(!fs.existsSync(args.www_path)) {
			console.error(args.www_path, 'does not exist');
		} else {
			var site_path = args.site_path;
			var html_path = path.join(site_path, 'public_html');
			var logs_path = path.join(site_path, 'logs');
			var user = args.user;
			var group = args.group;

			[site_path, html_path, logs_path].forEach(function(v) {
				shelljs.mkdir('-p', v);
			});

			[
				'chown -R ' + user + ' ' + site_path,
				'chgrp -R ' + group + ' ' + site_path,
				'chmod g+s ' + site_path,
				'chown root ' + logs_path,
				'chgrp root ' + logs_path,
				'chmod 700 ' + logs_path
			].forEach(function(line) {
				shelljs.exec(line);
			});
		}
	}
}
