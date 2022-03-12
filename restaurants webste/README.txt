AUTHOR:             Esther Osammor

ID:                 101180602

PROJECT:            Assignment 4 - active restaurants website that allows users to register, login in, order food, set their profile privacy and view other user's profiles if they are 
                    public.

FILES:              server.js
                    database-initializer.js
                    package.json
                    orders-router.js (in 'routers' subfolder)
                    users-router.js (in 'routers' subfolder)
                    home.pug (in 'pages' subfolder inside 'views')
                    login.pug (in 'pages' subfolder inside 'views')
                    order.pug (in 'pages' subfolder inside 'views')
                    orderform.pug (in 'pages' subfolder inside 'views')
                    register.pug (in 'pages' subfolder inside 'views')
                    user.pug (in 'pages' subfolder inside 'views')
                    users.pug (in 'pages' subfolder inside 'views')
                    header.pug (in 'partials' subfolder inside 'views')
                    orderform.js (in 'public' subfolder)
                    style.css (in 'routers' subfolder)
                    add.png (in 'routers' subfolder)
                    remove.png (in 'routers' subfolder)

HOW TO RUN PROJECT: Ensure all files listed above are in the same directory, navigate to directory in terminal and input "npm install". This will install all the packages and modules 
                    required to run the project. Once this is complete, input "node database-initializer" to the terminal. this will initialize the database by clearing everything that was 
                    there before and populating it with the initial users(*small edit to Dave's supplied code*). Once you see the success message, input "node server.js" This will start the server. 
                    Once it says, "server listening at..." open a browser and go to this link, "http://localhost:3000". You can then test the project. This link will also be displayed on the 
                    terminal console so you can copy and paste from there if preferred. Once done testing, press 'CTRL + C' to close the server. Thank you.