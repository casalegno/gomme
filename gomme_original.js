//x = document.getElementsByClassName("city");


/**
 * Gestisco le tabs
 */
var manage_tabs = function(e){
	//console.log(e.target);  // to get the element
    //console.log(e.target.tagName);  // to get the element tag name alone 
    document.querySelectorAll('a').forEach(function(el) {
   el.className = '';});
    this.className= 'active';
    secname=this.innerText;
    //console.log(secname);
    document.querySelectorAll('.tabs').forEach(function(el) {
   //el.style.display = 'none';
   		el.classList.remove('visibile');
   });
   document.getElementById(secname.toLowerCase()).classList.add('visibile');

    
    
}
var tabs=document.getElementsByTagName("a");
for(var tab in tabs){
      tabs[tab].onclick = manage_tabs;
    }
    
/**
 *  Ora gestisco la chiamata al Form
 */
activeform=document.getElementsByClassName('visibile').firstChild;