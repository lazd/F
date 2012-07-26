# Get http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip

includeOrder="
js/Class/Class.js

js/F/F.js
js/F/F.EventEmitter.js
js/F/F.View.js
js/F/F.Component.js
js/F/F.ModelComponent.js
js/F/F.CollectionComponent.js

js/F/components/*
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

# Rollup JS
cat $includeOrder > build/js/F.js

# Build components
# for componentPath in js/F/components/*; do
# 	componentName=$(basename "$componentPath")
# 	echo "Building component $componentName..."
# 	
# 	# Rollup and copy
# 	ls $componentPath/* | sort -r | xargs cat > build/js/F.$componentName.js
# done

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

# Make docs
java -jar jsdoc-toolkit/jsrun.jar jsdoc-toolkit/app/run.js -a -t=jsdoc-toolkit/templates/jsdoc $includeOrder -d=build/jsdoc
