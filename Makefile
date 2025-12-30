
# CERTS_DIR = ./certs
# KEY = $(CERTS_DIR)/nginx.key
# CRT = $(CERTS_DIR)/nginx.crt
# certs:
# 	@mkdir -p $(CERTS_DIR)
# 	@if [ ! -f $(KEY) ] || [ ! -f $(CRT) ]; then \
# 		echo "Generating SSL certificates..."; \
# 		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
# 			-keyout $(KEY) \
# 			-out $(CRT) \
# 			-subj "/C=MA/ST=Marrakech/L=Marrakech/O=olaaroub/OU=transcendence/CN=localhost"; \
# 		echo "Certificates generated in $(CERTS_DIR)"; \
# 	else \
# 		echo "Certificates already exist."; \
# 	fi

# .PHONY: certs

# all: up

# up: certs
# 	docker compose up --build -d

# down:
# 	docker compose down

# logs:
# 	docker compose logs

# clean: down

# fclean:
# 	docker compose down -v

# re: clean up




# dev: certs
# 	docker compose -f compose.dev.yaml up -d --build
# 	docker compose -f compose.dev.yaml logs -f auth-service-dev user-service-dev frontend-dev global-chat-dev


# downdev:
# 	docker compose -f compose.dev.yaml down

# logsdev:
# 	docker compose -f compose.dev.yaml logs

# cleandev: downdev

# fcleandev:
# 	docker compose -f compose.dev.yaml down -v



# #elk do not touch
# elk: certs
# 	docker compose -f compose.elk.yaml up -d --build
# 	docker compose -f compose.elk.yaml logs -f auth-service-elk user-service-elk frontend-elk

# cleanelk:
# 	docker compose -f compose.elk.yaml down
# fcleanelk:
# 	docker compose -f compose.elk.yaml down -v


# #ms7 images
# cleanimg: clean cleandev
# 	@images=$$(docker images -q --filter "reference=*:1337" --filter "reference=*:latest" ; docker images -q --filter "dangling=true") ;\
# 	if [ -n "$$images" ]; then\
# 		docker rmi $$images; \
# 	else \
# 		echo "no images to delete"; \
# 	fi

# # fach tbi tkhwi docker kaml
# force: cleandev
# 	docker system prune -a --volumes

# reset:



# --- Configuration Variables ---
CERTS_DIR := ./certs
KEY := $(CERTS_DIR)/nginx.key
CRT := $(CERTS_DIR)/nginx.crt

# --- SSL Certificates ---
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

# --- Main Production Commands ---
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

# --- Development Environment ---
dev: certs
	docker compose -f compose.dev.yaml up -d --build
	docker compose -f compose.dev.yaml logs -f auth-service-dev user-service-dev frontend-dev global-chat-dev

downdev:
	docker compose -f compose.dev.yaml down

logsdev:
	docker compose -f compose.dev.yaml logs

cleandev: downdev

fcleandev:
	docker compose -f compose.dev.yaml down -v

# --- ELK Stack (Do Not Touch) ---
elk: certs
	docker compose -f compose.elk.yaml up -d --build
	docker compose -f compose.elk.yaml logs -f auth-service-elk user-service-elk frontend-elk

cleanelk:
	docker compose -f compose.elk.yaml down

fcleanelk:
	docker compose -f compose.elk.yaml down -v

# --- Cleanup Utilities ---

# Remove specific images (custom builds and dangling)
cleanimg: clean cleandev
	@images=$$(docker images -q --filter "reference=*:1337" --filter "reference=*:latest" ; docker images -q --filter "dangling=true") ;\
	if [ -n "$$images" ]; then \
		docker rmi $$images || true; \
	else \
		echo "no images to delete"; \
	fi

# Complete Docker system prune
force: cleandev
	docker system prune -a --volumes -f

# Deep Reset: Cleans Docker, DBs, Node Modules, and Images
reset: cleandev cleanelk cleanimg
	@echo "🛑 Deep cleaning project..."

	@# 1. Remove Databases (SQLite files)
	@echo "Deleting database files..."
	@find ./app -name "*.db" -type f -delete || true
	@find ./data -name "*.db" -type f -delete || true
	@# Adjust path below if your DBs are stored elsewhere like ./db
	@rm -rf ./db/*.db || true

	@# 2. Remove node_modules (recursively)
	@echo "Deleting node_modules..."
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' + || true

	@# 3. Remove build artifacts (dist folders)
	@echo "Deleting build artifacts..."
	@find . -name "dist" -type d -prune -exec rm -rf '{}' + || true

	@echo "✅ Reset complete. Run 'make dev' to restart fresh."

.PHONY: all up down logs clean fclean re dev downdev logsdev cleandev fcleandev elk cleanelk fcleanelk cleanimg force reset