
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

restart-back:
	docker compose restart backend
	docker compose start front

front:
	docker compose -f Front-end/docker-compose.yml up

clean-front:
	docker compose -f Front-end/docker-compose.yml down -v

back: # hada ila bghiti testi lback bo7do b postman ( makayn lach t runi l containers )
	DB_PATH=../db/database.db npm --prefix ./app run dev

# DB_PATH should be in the .env drto hna gha bac nod n3es mafiach li yzid lkhdma