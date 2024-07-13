.PHONY: build serve

build:
	go run main.go

serve: build
	python3 -m http.server -d public
