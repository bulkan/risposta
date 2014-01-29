test:
	@NODE_ENV=test \
	./node_modules/.bin/mocha

single-test:
	@NODE_ENV=test \
    ./node_modules/.bin/mocha --grep $(TEST)

.PHONY: test
