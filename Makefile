
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

front:
	docker compose -f Front-end/docker-compose.yml up

back: # hada ila bghiti testi lback bo7do b postman ( makayn lach t runi l containers )
	npm --prefix ./app run dev