#! /bin/bash
#echo  in progress ...";
#echo "Syncing lattest updates from gitlab ....";
cd /var/www/mongodbroject/shoppingguru
git pull
#echo "Instaling depandencys ...";
#npm i
#echo "Creating production build ......";
#npm run build
pm2 restart ShoppingGuru.js

