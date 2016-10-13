lint:
	./node_modules/.bin/eslint .

test: lint
	./node_modules/.bin/mocha test

.PHONY: test lint
