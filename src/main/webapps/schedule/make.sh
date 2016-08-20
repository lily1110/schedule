echo $1
if [ $1 = 'dev' ]; then
    cp schedule.html.dev schedule.html
    cp js/schedule/TypeStore.js.dev js/schedule/TypeStore.js
    npm start
fi
if [ $1 = 'prod' ]; then
    cp schedule.html.prod schedule.html
    cp js/schedule/TypeStore.js.prod js/schedule/TypeStore.js
    npm run build
fi