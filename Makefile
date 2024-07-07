.PHONY: build serve

build:
	python3 build.py > config.json

serve: build
	python3 -m http.server
