
all: up

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs

clean: down

fclean:
	docker compose down -v

re: clean up

dev:
	docker compose -f compose.dev.yaml up -d --build
	docker compose -f compose.dev.yaml logs -f frontend-dev backend-dev

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