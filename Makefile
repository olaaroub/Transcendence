# --- VARIABLES ---
CERTS_DIR = ./certs
KEY = $(CERTS_DIR)/nginx.key
CRT = $(CERTS_DIR)/nginx.crt
DB_DIR = ./db

# --- COLORS ---
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
RESET  := \033[0m

# ==========================================
#              MAIN RULES
# ==========================================
.PHONY: all help certs deps

all: up

help:
	@echo "$(YELLOW)Usage:$(RESET) make $(GREEN)[command]$(RESET)"
	@echo ""
	@echo "$(BLUE)---   Production (Default) ---$(RESET)"
	@echo "  $(GREEN)up$(RESET)             : Generate certs & start production"
	@echo "  $(GREEN)down$(RESET)           : Stop production"
	@echo "  $(GREEN)fclean$(RESET)         : Stop prod & remove volumes"
	@echo "  $(GREEN)re$(RESET)             : Full restart (Production)"
	@echo ""
	@echo "$(BLUE)---    Development ---$(RESET)"
	@echo "  $(GREEN)dev$(RESET)            : Start dev env & tail logs"
	@echo "  $(GREEN)down-dev$(RESET)       : Stop dev env"
	@echo "  $(GREEN)fcleandev$(RESET)     : Stop dev & remove volumes"
	@echo "  $(GREEN)re-dev$(RESET)         : Full restart (Dev)"
	@echo ""
	@echo "$(BLUE)---   ELK Stack ---$(RESET)"
	@echo "  $(GREEN)elk$(RESET)            : Start ELK stack"
	@echo "  $(GREEN)down-elk$(RESET)       : Stop ELK stack"
	@echo ""
	@echo "$(BLUE)---    Setup & Utils ---$(RESET)"
	@echo "  $(GREEN)deps$(RESET)           : Generate package-lock.json files (No install)"
	@echo "  $(GREEN)clean-data$(RESET)     : Remove DB data (needs permissions)"
	@echo "  $(GREEN)clean-images$(RESET)   : Remove images tagged *:1337"
	@echo "  $(GREEN)hard-reset$(RESET)     : Wipe containers, images, volumes, deps"

# --- CERTIFICATES ---
certs:
	@mkdir -p $(CERTS_DIR)
	@if [ ! -f $(KEY) ] || [ ! -f $(CRT) ]; then \
		echo "$(YELLOW)Generating SSL certificates...$(RESET)"; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(KEY) \
			-out $(CRT) \
			-subj "/C=MA/ST=Marrakech/L=Marrakech/O=olaaroub/OU=transcendence/CN=localhost" >/dev/null 2>&1; \
		echo "$(GREEN)Certificates generated in $(CERTS_DIR)$(RESET)"; \
	else \
		echo "$(GREEN)Certificates already exist.$(RESET)"; \
	fi

# --- DEPENDENCIES ---
deps:
	@echo "$(YELLOW)Generating package-lock.json files (without installing node_modules)...$(RESET)"
	@# Finds all package.json files (excluding node_modules) and runs the command in their directory
	@find . -name "package.json" -not -path "*/node_modules/*" -execdir npm install --package-lock-only \;
	@echo "$(GREEN)Lockfiles generated. You can now build with Docker.$(RESET)"

# setup-db: # not final, (i did a temporary fix of giving the container uid rood)
# 	@echo "$(YELLOW)Setting up database permissions...$(RESET)"
# 	@mkdir -p $(DB_DIR)/auth $(DB_DIR)/users $(DB_DIR)/chat/
# 	@chown -R 1000:1000 $(DB_DIR) || echo "$(YELLOW)Warning: Could not chown db folders!$(RESET)"

# ==========================================
#              PRODUCTION
# ==========================================
up: certs
	docker compose up --build -d
	docker compose logs -f auth-service-prod user-service-prod global-chat-prod \
												private-chat-prod pong-game-prod

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

re-dev: cleandev dev

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

clean-data: clean-deps clean-images
	@echo "$(YELLOW)Cleaning database data...$(RESET)"
	@rm -rf $(DB_DIR)/auth/* $(DB_DIR)/users/* $(DB_DIR)/chat/* || echo "$(YELLOW)Permission denied. Try running with sudo.$(RESET)"
	@echo "$(GREEN)Database data cleaned.$(RESET)"

clean-deps:
	@echo "$(YELLOW)Cleaning node_modules...$(RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@echo "$(GREEN)node_modules cleaned.$(RESET)"

clean-images:
	@echo "$(YELLOW)Cleaning project images...$(RESET)"
	@images=$$(docker images -q --filter "reference=*:1337"); \
	if [ -n "$$images" ]; then \
		docker rmi $$images; \
		echo "$(GREEN)Images deleted.$(RESET)"; \
	else \
		echo "No images to delete."; \
	fi
	@echo "$(YELLOW)Cleaning dangling images...$(RESET)"
	@dangling=$$(docker images -q --filter "dangling=true"); \
	if [ -n "$$dangling" ]; then \
		docker rmi $$dangling; \
		echo "$(GREEN)Dangling images deleted.$(RESET)"; \
	fi

clean-cache: clean-deps clean-images
	@echo "$(YELLOW)Cleaning Docker build cache...$(RESET)"
	@docker builder prune -f
	@echo "$(GREEN)Docker build cache cleaned.$(RESET)"

prune:
	docker system prune -a --volumes

hard-reset: fclean fcleandev fclean-elk clean-images clean-deps clean-cache clean-data
	@echo "$(GREEN)------------------------------------------------------------------$(RESET)"
	@echo "$(GREEN)-------------------HARD RESET COMPLETE----------------------------$(RESET)"
	@echo "$(GREEN)------------------------------------------------------------------$(RESET)"