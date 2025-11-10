
all: up

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs

clean:
	docker compose down -v

re: clean up

dev:
	docker compose -f compose.dev.yaml up

dev-down:
	docker compose -f compose.dev.yaml down

logs-dev:
	docker compose -f compose.dev.yaml logs

clean-dev:
	docker compose -f compose.dev.yaml down -v