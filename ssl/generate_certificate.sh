#!/bin/bash
if [ -f req.cnf ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out public.pem -config req.cnf -sha256
else
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out public.pem -sha256
fi