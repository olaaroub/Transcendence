
CERTS_DIR = ./certs
KEY = $(CERTS_DIR)/nginx.key
CRT = $(CERTS_DIR)/nginx.crt
certs:
	@mkdir -p $(CERTS_DIR)
	@if [ ! -f $(KEY) ] || [ ! -f $(CRT) ]; then \
		echo "Generating SSL certificates..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(KEY) \
			-out $(CRT) \
			-subj "/C=MA/ST=Marrakech/L=Marrakech/O=olaaroub/OU=transcendence/CN=localhost"; \
		echo "Certificates generated in $(CERTS_DIR)"; \
	else \
		echo "Certificates already exist."; \
	fi

.PHONY: certs

all: up

up: certs
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs

clean: down

fclean:
	docker compose down -v

re: clean up

dev: certs
	docker compose -f compose.dev.yaml up -d --build
	docker compose -f compose.dev.yaml logs -f modSecurity-dev

# frontend-dev backend-dev
downdev:
	docker compose -f compose.dev.yaml down

logsdev:
	docker compose -f compose.dev.yaml logs

cleandev: downdev

fcleandev:
	docker compose -f compose.dev.yaml down -v

cleanimg: clean cleandev
	@images=$$(docker images -q --filter "reference=*:1337" --filter "reference=*:latest" ; docker images -q --filter "dangling=true") ;\
	if [ -n "$$images" ]; then\
		docker rmi $$images; \
	else \
		echo "no images to delete"; \
	fi
