test:
	@NODE_ENV=test \
	./node_modules/.bin/mocha --reporter spec --ui bdd

single-test:
	@NODE_ENV=test \
    ./node_modules/.bin/mocha --grep $(TEST)

.PHONY: test
