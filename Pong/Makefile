# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hes-safi <hes-safi@student.1337.ma>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/18 20:20:43 by hes-safi          #+#    #+#              #
#    Updated: 2026/01/01 15:10:16 by hes-safi         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Default target: build shared and run offline
all: shared offline

# Build shared library
shared:
	cd Shared && npm install && npm run build

# Run offline version
offline: shared
	cd Offline && npm install && npm run build

# Run both online server and client (in background)
online: shared
	@echo "Starting Online Server..."
	cd Online/server && npm install && npm run dev &
	@sleep 2
	@echo "Starting Online Client..."
	cd Online/client && npm install && npm run dev

# Build everything for production
build: shared
	cd Offline && npm install && npm run build
	cd Online/server && npm install && npm run build
	cd Online/client && npm install && npm run build

# Clean dist folders
clean:
	cd Shared && rm -rf dist
	cd Offline && rm -rf dist
	cd Online/server && rm -rf dist
	cd Online/client && rm -rf dist

# Full clean including node_modules
fclean: clean
	rm -rf package-lock.json
	cd Shared && rm -rf node_modules package-lock.json
	cd Offline && rm -rf node_modules package-lock.json
	cd Online/server && rm -rf node_modules package-lock.json
	cd Online/client && rm -rf node_modules package-lock.json

# Rebuild
re: clean all

.PHONY: all shared offline online build clean fclean re
