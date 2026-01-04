# --- VARIABLES ---
CERTS_DIR = ./certs
KEY = $(CERTS_DIR)/nginx.key
CRT = $(CERTS_DIR)/nginx.crt
DB_DIR = ./db

# --- CERTIFICATES ---
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

# ==========================================
#              PRODUCTION
# ==========================================
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

# ==========================================
#              DEVELOPMENT
# ==========================================
dev: certs
	docker compose -f compose.dev.yaml up -d --build
	docker compose -f compose.dev.yaml logs -f frontend-dev auth-service-dev user-service-dev global-chat-dev \
												private-chat-dev pong-game-dev

down-dev:
	docker compose -f compose.dev.yaml down

logs-dev:
	docker compose -f compose.dev.yaml logs

cleandev: down-dev

fcleandev:
	docker compose -f compose.dev.yaml down -v

re-dev: clean-dev dev

# ==========================================
#              ELK STACK
# ==========================================
elk: certs
	docker compose -f compose.elk.yaml up -d --build
	docker compose -f compose.elk.yaml logs -f auth-service-elk user-service-elk frontend-elk

down-elk:
	docker compose -f compose.elk.yaml down

clean-elk: down-elk

fclean-elk:
	docker compose -f compose.elk.yaml down -v

re-elk: clean-elk elk

# ==========================================
#              CLEANUP TOOLS
# ==========================================

# Clean Database Data
clean-data: clean-deps clean-images clean-cache
	@echo "Cleaning database data..."
	@rm -rf $(DB_DIR)/auth/*
	@rm -rf $(DB_DIR)/users/*
	@rm -rf $(DB_DIR)/chat/*
	@echo "Database data cleaned."

# Clean Node Modules
clean-deps:
	@echo "Cleaning node_modules..."
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@echo "node_modules cleaned."

# Clean Docker Images
clean-images:
	@echo "Cleaning project images..."
	@images=$$(docker images -q --filter "reference=*:1337 "); \
	if [ -n "$$images" ]; then \
		docker rmi $$images; \
		echo "Images deleted."; \
	else \
		echo "No images to delete."; \
	fi
	@echo "Cleaning dangling images..."
	@dangling=$$(docker images -q --filter "dangling=true"); \
	if [ -n "$$dangling" ]; then \
		docker rmi $$dangling; \
		echo "Dangling images deleted."; \
	else \
		echo "No dangling images found."; \
	fi

clean-cache: clean-deps clean-images
	@echo "Cleaning Docker build cache..."
	@docker builder prune -f
	@echo "Docker build cache cleaned."

# System Prune
prune:
	docker system prune -a --volumes

# HARD RESET
hard-reset: fclean fcleandev fclean-elk clean-images clean-deps clean-cache clean-data
	@echo "------------------------------------------------------------------"
	@echo "-------------------HARD RESET COMPLETE----------------------------"
	@echo "------------------------------------------------------------------"

.PHONY: prune dev elk