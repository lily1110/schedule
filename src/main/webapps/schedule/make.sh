echo $1
if [ $1 = 'dev' ]; then
    cp schedule.html.dev schedule.html
    npm start
fi
if [ $1 = 'prod' ]; then
    cp schedule.html.prod schedule.html
    npm run build
fi