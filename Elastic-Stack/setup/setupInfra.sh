#!/bin/bash

if [ ! -f config/certs/ca.zip ]; then
  echo "Creating CA..."
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;

if [ ! -f config/certs/certs.zip ]; then
  echo "Creating certs..."
  echo -ne \
  "instances:\n"\
  "  - name: elasticsearch\n"\
  "    dns:\n"\
  "      - elasticsearch\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  "  - name: kibana\n"\
  "    dns:\n"\
  "      - kibana\n"\
  "      - localhost\n"\
  "    ip:\n"\
  "      - 127.0.0.1\n"\
  > config/certs/instances.yml;

  bin/elasticsearch-certutil cert --silent --pem -ca-cert config/certs/ca/ca.crt -ca-key config/certs/ca/ca.key -in config/certs/instances.yml -out config/certs/certs.zip;
  unzip config/certs/certs.zip -d config/certs;
fi;

echo "Setting permissions..."
chown -R root:root config/certs;
chown -R 1000:0 config/certs;
find . -type d -exec chmod 750 \{\} \;;
find . -type f -exec chmod 640 \{\} \;;





echo "Waiting for Elasticsearch to be ready for ILM setup..."
until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" https://elasticsearch:9200 | grep -q "You Know, for Search"; do sleep 5; done;


echo "Setting password for built-in kibana_system user..."
curl -s -X POST -k -u "elastic:${ELASTIC_PASSWORD}" \
  -H "Content-Type: application/json" \
  "https://elasticsearch:9200/_security/user/kibana_system/_password" \
  -d "{\"password\":\"${ELASTIC_PASSWORD}\"}"

echo "Setting up ILM Policy (Hot -> Cold -> Delete)..."

curl -X PUT -k -u "elastic:${ELASTIC_PASSWORD}" "https://elasticsearch:9200/_ilm/policy/transcendence_retention_policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_size": "1GB"
          }
        }
      },
      "cold": {
        "min_age": "2d",
        "actions": {
          "readonly": {}
        }
      },
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

echo "Applying ILM Template..."

curl -X PUT -k -u "elastic:${ELASTIC_PASSWORD}" "https://elasticsearch:9200/_index_template/logs_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "transcendence_retention_policy",
      "index.lifecycle.rollover_alias": "logs-alias"
    }
  }
}'


