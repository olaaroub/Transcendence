# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hes-safi <hes-safi@student.1337.ma>        +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/18 20:20:43 by hes-safi          #+#    #+#              #
#    Updated: 2026/01/02 21:23:19 by hes-safi         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Default target: build shared and run offline
all: build

shared:
	cd Shared && npm install && npm run build

offline: shared
	cd Offline && npm install && npm run build

online: shared
	cd Online && npm install && npm run build

build: shared
	cd Offline && npm install && npm run build
	cd Online && npm install && npm run build

clean:
	cd Shared && rm -rf dist
	cd Offline && rm -rf dist
	cd Online && rm -rf dist

fclean: clean
	rm -rf package-lock.json
	cd Shared && rm -rf node_modules package-lock.json
	cd Offline && rm -rf node_modules package-lock.json
	cd Online && rm -rf node_modules package-lock.json

re: clean all

.PHONY: all shared offline online build clean fclean re
