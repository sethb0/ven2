#!/bin/sh
set -e
rm -rf web/schema
mkdir web/schema
for x in src/schemata/*.yml
do
  if [ -e "$x" ]
  then
    node utils/y2j.js "$x" web/schema/$(basename "$x" .yml).json
  fi
done
(cd web; tar cjf - .) | ssh sharpcla.ws 'set -e; cd /var/www/vhosts/venator; sudo rm -rf *; sudo tar xjof -'
