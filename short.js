// shorthand js function declarations

var $h = () => {return document.head};
var $b = () => {return document.body};

var $new = (type) => {return document.createElement(type)};
var $new_id = (type, name) => {var c = document.createElement(type); c.id = name; return c;};

var $id = (name) => {return document.getElementById(name)};
var $class = (clname) => {return document.getElementsByClassName(clname)};

var $del = (elem) => {elem.parentNode.removeChild(elem)};