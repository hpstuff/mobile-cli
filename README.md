mobile-cli
==========

mobile command line tool
```
npm install git://github.com/hpstuff/mobile-cli.git -g
```
####Usage

init project

```
mobile init MyApplicationName
cd MyApplicationName
npm install
grunt
```

and now you can open in your browser

http://localhost:3030


in mobile framework directory tipe
```
mobile create --type page Wellcome
```
and this will create WellcomePage.js controller hello-word.html layout file and this all will be added into manifest file.
```
mobile create --type class MyData
```
will create MyData.js class in src directory
```
mobile remove --type page Wellcome
```
clear all page files
```
mobile remove --type class MyData
```
