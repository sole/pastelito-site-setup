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
		
		// Create site directories-this is a huge chore to do manually!
		if(args.create_directories) {
			createDirectories(args);
		}

		// Create dh_params using openssl for preventing certain SSL vulnerability attacks
		if(args.create_dhparams_file) {
			createDhParams(args);
		}

	}

	function completeArguments(args) {
		if(!args.directory) {
			args.directory = args.domain;
		}

		args.server_name = args.domain;
		args.site_path = path.join(args.www_path, args.directory);

		var ssl_defaults = {
			certificate: 'cert.pem',
			certificate_key: 'privkey.pem',
			trusted_certificate: 'fullchain.pem'
		};

		if(args.with_lets_encrypt) {
			args.with_ssl = true;
		}

		if(args.with_ssl) {
			var certificate_path;
			if(args.with_lets_encrypt) {
				certificate_path = path.join('/etc/letsencrypt/live', args.domain);
			} else {
				certificate_path = args.site_path;
			}
			
			var keys = Object.keys(ssl_defaults);
			keys.forEach(function(k) {
				var full_k = 'ssl_' + k;
				if(!args[full_k]) {
					args[full_k] = path.join(certificate_path, ssl_defaults[k]);
				}
			});
		}
		
		args.http_port = 80;
		
		if(!args.port) {
			if(args.with_ssl) {
				args.port = 443;
			} else {
				args.port = 80;
			}
		}

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

			shelljs.mkdir(site_path);
			shelljs.exec('chmod g+s ' + site_path);

			[html_path, logs_path].forEach(function(v) {
				shelljs.mkdir(v);
			});

			[
				'chown -R ' + user + ' ' + site_path,
				'chgrp -R ' + group + ' ' + site_path,
				'chmod g+w ' + site_path,
				'chown root ' + logs_path,
				'chgrp root ' + logs_path,
				'chmod 700 ' + logs_path
			].forEach(function(line) {
				shelljs.exec(line);
			});
		}
	}

	function createDhParams(args) {
		var pathToFile = path.join(site_path, 'dhparams.pem');
		console.log('Attempting to create ' + pathToFile + ' --this might take a while');
		shelljs.exec('openssl dhparam -out ' + pathToFile + ' 2048');
	}
}
