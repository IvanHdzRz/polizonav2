'use strict'

let navBar = document.getElementById('navigation');

var last_known_scroll_position = 0;
var ticking = false;



window.addEventListener('scroll', (e)=> {
  last_known_scroll_position = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(()=>{
        const navClass=last_known_scroll_position>70?'navigation navigation-colored':'navigation';
        ticking = false;
        navBar.classList=navClass;
    });
  }
  ticking = true;
});