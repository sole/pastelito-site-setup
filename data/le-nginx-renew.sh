#!/bin/bash

LE_BIN=/full/path/to/letsencrypt-auto

sudo service nginx stop

sudo $LE_BIN renew > /var/log/letsencrypt/renew.log 2>&1

sudo service nginx start
