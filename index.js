var SiteSetup = require('./SiteSetup');
var ArgParse = require('argparse').ArgumentParser;

var parser = new ArgParse({
	addHelp: true,
	description: 'Set up sites, quick'
});

// pastelito-site-setup —with-php —with-https-redirect —create-database -domain=mydomain.com -directory=mydomain.com -www-path=/var/www/ -nginx-conf-path=/etc/nginx/

// domain -> directory
parser.addArgument(
	['--domain'],
	{
		help: 'Domain of the site. E.g. example.com',
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

// https certificate (?)
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


// nginx-conf-path assumed /etc/nginx
// with-database [name] assumed domain name

var args = parser.parseArgs();
var setup = new SiteSetup(args);

setup.doIt();
