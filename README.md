# hotelroom

Github URL: https://github.com/dvelopWorld/hotelroom
Technologies used
1. Express
2. Javascript
3. mySql
4. html5
5. css
6. Redis
7. 
Jquery plugins
1. Sweetalert 2.0 -- for showing response message in user panel
2. Toastr -- for showing response message in admin panel
3. Dropzone -- for uploading images of room in admin panel
4. 
Other mentions
1. Font Awesome version 4.
backend tools
1. backend database orm 
a. Sequelize
2. image upload
a. Multer
3. sending mail
a. Nodemailer
port: 1997
admin panel:
localhost:1997/admin
user panel:
localhost:1997
Architecture
This project is built on MVC architecture where we have models, views and controllers isolated and
interconnected in unopinion way.
1. Models
It defines files for database tables.
2. Controllers
It is divided in two sub folders
a. Admin
it contails views and action controllers for admin
b. User
It contains views and actions controllers for user
3. Views
It includes layout, email templates and views for admin and users. 
Views refer to public folder in the root directry for media and other files(stylesheets, 
javascript, plugins, etc..) 
a. Layouts
It includes layouts for admins and users which is distributed in folder named 
‘partials’ in the same directory.
b. Partials
It includes files for welcome mail template and booking comfirm mail template
c. Views
It includes files for views of admin and users.
Apart from these MVC directories, we also have two important folders which acts as helpers for 
these Controllers. They are
1. Middlewares
It includes a single file for multer configuration. Currently we are only storing images for 
rooms so it host only a single object for that purpose
2. Services
This directory is meant for common use for both the admin controllers and user controllers. 
Currently we are having only one file in this directory which is commonService.js.
Security
We are using JWT (json web token) for applying confidentiality
We are using session data for applying authorization.
