var SiteSetup = require('./SiteSetup');
var ArgParse = require('argparse').ArgumentParser;

var parser = new ArgParse({
	addHelp: true,
	description: 'Set up sites, quick'
});

// pastelito-site-setup —with-php —with-https-redirect —create-database -domain=mydomain.com -directory=mydomain.com -www-path=/var/www/ -nginx-conf-path=/etc/nginx/ --write-nginx-conf --enable-site --create-directories --directory-owner=... --directory-group=...

// domain -> directory
parser.addArgument(
	['--domain'],
	{
		help: 'Site domain. E.g. example.com',
		required: true
	}
);

parser.addArgument(
	['--www-path'],
	{
		help: 'Folder where website directories are. Default is /var/www',
		defaultValue: '/var/www'
	}
);

// Port
parser.addArgument(
	['--port'],
	{
		help: 'Port the website will be served from. Default is 443 if using SSL, 80 otherwise'
	}
);

// with-ssl
parser.addArgument(
	['--with-ssl'],
	{
		help: 'Serve using encrypted connection (SSL)',
		action: 'storeTrue',
		defaultValue: false
	}
);


// with-php
parser.addArgument(
	['--with-php'],
	{
		help: 'Set up PHP proxy to FastCGI',
		action: 'storeTrue',
		defaultValue: false
	}
);

// with-https-redirect
// with-www-redirect
parser.addArgument(
	['--with-www-redirect'],
	{
		help: 'Set redirect from www.* to no www',
		action: 'storeTrue',
		defaultValue: false
	}
);

// with-wordpress
parser.addArgument(
	['--with-wordpress'],
	{
		help: 'Configure to send requests to WordPress',
		action: 'storeTrue',
		defaultValue: false
	}
);

// with-static-caching
parser.addArgument(
	['--with-static-caching'],
	{
		help: 'Set static assets to be cached',
		action: 'storeTrue',
		defaultValue: false
	}
);

// nginx-conf-path assumed /etc/nginx
parser.addArgument(
	['--nginx-conf-path'],
	{
		help: 'Folder where nginx configuration files are stored',
		defaultValue: '/etc/nginx'
	}
);

// Write site nginx conf to {nginx_conf_path}/sites-available
parser.addArgument(
	['--write-nginx-conf'],
	{
		help: 'Write site nginx conf to /etc/nginx/sites-available',
		action: 'storeTrue',
		defaultValue: false
	}
);

// Enable site
parser.addArgument(
	['--enable-site'],
	{
		help: 'Enable site by making symbolic link from sites-available to sites-enabled',
		action: 'storeTrue',
		defaultValue: false
	}
);

// Create directories
parser.addArgument(
	['--create-directories'],
	{
		help: 'Create directories for the site (html, logs) and sets up proper permissions',
		action: 'storeTrue',
		defaultValue: false
	}
);

// user and group for the created directory. www-data assumed which is the one the webserver runs as by default
parser.addArgument(
	['--user'],
	{
		help: 'User that will own the site directory',
		defaultValue: 'www-data'
	}
);

parser.addArgument(
	['--group'],
	{
		help: 'Group that will own the site directory',
		defaultValue: 'www-data'
	}
);

// with-database [name] assumed domain name

var args = parser.parseArgs();
var setup = new SiteSetup(args);

setup.doIt();
