.PHONY: build serve

build:
	ls templates > templates.txt

serve: build
	python3 -m http.server
