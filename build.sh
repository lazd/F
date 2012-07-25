# Get http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip

includeOrder="
js/extensions/Object.js
js/extensions/Class.js

js/F/F.js
js/F/F.EventEmitter.js
js/F/F.View.js
js/F/F.Component.js
js/F/components/F.ModelComponent.js
js/F/components/F.CollectionComponent.js
js/F/components/F.FormComponent.js
"

if [ ! -e build ]; then
	mkdir build
fi

if [ ! -e build/js ]; then
	mkdir build/js;
fi

if [ ! -e build/jsdoc ]; then
	mkdir build/jsdoc;
fi

if [ ! -e build/examples ]; then
	mkdir build/examples;
fi

# Make docs
java -jar jsdoc-toolkit/jsrun.jar jsdoc-toolkit/app/run.js -a -t=jsdoc-toolkit/templates/jsdoc js/F/* js/extensions/* -d=build/jsdoc

# Rollup CSS
cat $includeOrder > build/js/F.js

# Copy examples
for example in examples/*; do
	# Copy example files
	cp -R $example build/examples/
	
	# Make sure it has a JS folder
	if [ ! -e build/$example/js/ ]; then
		mkdir -p build/$example/js/ 
	fi
	
	# Copy F.js
	cp build/js/F.js build/$example/js/ 
done
