#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var jsdom = require('jsdom');
var serializeDocument = require("jsdom").serializeDocument;
var html = require("html");
var fs = require('fs');

var pageControllerPath = "src/pages/"
var pageLayoutPath = "res/layouts/"
var classesPath = "src/app/"
var manifest = "manifest.json"
var controllerTemplate = __dirname+"/.data/TemplatePage.js"
var classTemplate = __dirname+"/.data/ClassTemplate.js"

program
    .version('0.0.1')
    .command('create [name]')
    .description('create page|class files')
    .option("-t, --type [type]", "Type of what you want to create 'page' or 'class'.")
    .action(function (name, options) {
        options.type = options.type || "page"
        if(options.type === "page"){
            createPage(name)
        }else if(options.type === "class"){
            createClass(name)
        }else{
            console.log('Incorrect option. -type %s is not allowed.', options.type);
        }
    });

program
    .command('remove [name]')
    .description('remove page|class files')
    .option("-t, --type [type]", "Type of what you want to remove 'page' or 'class'.")
    .action(function (name, options) {
        options.type = options.type || "page"
        if(options.type === "page"){
            removePage(name)
        }else if(options.type === "class"){
            removeClass(name)
        }else{
            console.log('Incorrect option. -type %s is not allowed.', options.type);
        }
    });

program.parse(process.argv);

function removeClass(name){
    fs.unlink(classesPath+name+'.js', function(err){
        if(err) {
            console.log(err);
        } else {
            console.log('Successfully deleted '+name);
        }
    });
    //removeClassFromIndexHTML(classesPath+name+".js");
}

function createClass(name){
    loadClassTemplate(name, function(data){
        fs.writeFile(classesPath+name+".js", data, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Class "+name+" was created!");
            }
        }); 
    });
    //addClassToIndexHTML(classesPath+name+".js");
}

function removePage(name){
    var controllerName = name+"Page"
    var layoutName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    fs.unlink(pageLayoutPath+layoutName+".html", function(err){
        if (err) {
            console.log(err);
        }else{
            console.log('Successfully deleted Controller Layout '+layoutName);
        }
    });
    fs.unlink(pageControllerPath+controllerName+".js", function(err){
        if (err) {
            console.log(err);
        }else{
            console.log('Successfully deleted Controller'+controllerName);
        }
    });

    removeFromManifest(controllerName, layoutName)
}

function createPage(name){
    var controllerName = name+"Page"
    var layoutName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

    fs.writeFile(pageLayoutPath+layoutName+".html", "", function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Layout for "+controllerName+" was created!");
        }
    }); 

    loadTemplate(controllerName, layoutName, function(data){
        fs.writeFile(pageControllerPath+controllerName+".js", data, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Controller "+controllerName+" was created!");
            }
        }); 
    });

    addToManifest(controllerName, layoutName)
}

function addToManifest(controllerName, layoutName){
    fs.readFile(manifest, function (err, data) {
        if (err) {
            throw err; 
        }
        var manifestJSON = JSON.parse(data.toString())
        var exist = false
        manifestJSON.pages.forEach(function(page){
            if(page.name === controllerName){
                exist = true
                console.log("Page Controller with this name already exist.")
                return
            }
        });
        if(!exist) {
            manifestJSON.pages.push({
                name: controllerName
            });
            console.log("Controller was added in manifest.")
        }
        exist = false
        manifestJSON.layouts.forEach(function(layout){
            if(layout === layoutName+".html"){
                exist = true
                console.log("Page Layout with this name already exist.")
                return
            }
        });
        if(!exist){
            manifestJSON.layouts.push(layoutName+".html")
            console.log("Layout was added in manifest.")
        }
        fs.writeFile(manifest, JSON.stringify(manifestJSON, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Manifest was saved!");
            }
        }); 
    });
}

function removeFromManifest(controllerName, layoutName){
    fs.readFile(manifest, function (err, data) {
        if (err) {
            throw err; 
        }
        var manifestJSON = JSON.parse(data.toString())
        var index = -1
        manifestJSON.pages.forEach(function(page, i){
            if(page.name === controllerName){
                index = i;
                return
            }
        });
        if(index > -1){
            manifestJSON.pages.splice(index, 1);
        }
        index = -1
        manifestJSON.layouts.forEach(function(layout, i){
            if(layout === layoutName+".html"){
                index = i
                return
            }
        });
        if(index > -1){
            manifestJSON.layouts.splice(index, 1);
        }
        fs.writeFile(manifest, JSON.stringify(manifestJSON, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Manifest was saved!");
            }
        }); 
    });
}

function loadClassTemplate(name, callback){
    fs.readFile(classTemplate, function (err, data) {
        if (err) {
            throw err; 
        }
        var template = data.toString()
        template = template.replace(/<ClassName>/g, name)
        callback(template)
    });
}

function removeClassFromIndexHTML(filePath){
    fs.readFile('index.html', function (err, data) {
        if (err) {
            throw err; 
        }
        var template = data.toString()
        jsdom.env(template, function(errors, window){
            var existScript = window.document.querySelector('script[src="'+filePath+'"]');
            if(!existScript) return;
            existScript.parentElement.removeChild(existScript);

            console.log("Class Script was removed from index.html")

            fs.writeFile('index.html', html.prettyPrint(serializeDocument(window.document), {indent_size: 4}), function(err){
                if(err) {
                    console.log(err);
                } else {
                    console.log("Index HTML was saved!");
                }
            });
        });
    });
}

function addClassToIndexHTML(filePath){
    fs.readFile('index.html', function (err, data) {
        if (err) {
            throw err; 
        }
        var template = data.toString()
        jsdom.env(template, function(errors, window){
            var lastScript = window.document.querySelector('script:last-child');
            var existScript = window.document.querySelector('script[src="'+filePath+'"]');
            if(existScript) {
                console.log("This script already exist in index.html");
                return;
            }
            var newScript = window.document.createElement('script');
            newScript.src = filePath;
            lastScript.parentElement.insertBefore(newScript, lastScript);

            console.log("Class Script was added into index.html")

            fs.writeFile('index.html', html.prettyPrint(serializeDocument(window.document), {indent_size: 4}), function(err){
                if(err) {
                    console.log(err);
                } else {
                    console.log("Index HTML was saved!");
                }
            });
        });
    });
}

function loadTemplate(name, templateName, callback){
    fs.readFile(controllerTemplate, function (err, data) {
        if (err) {
            throw err; 
        }
        var template = data.toString()
        template = template.replace(/<PageName>/g, name)
        template = template.replace(/<page-name>/g, templateName)
        callback(template)
    });
}
