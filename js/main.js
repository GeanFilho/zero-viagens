const btn = document.getElementById('hamburger');
if(btn){
btn.addEventListener('click', ()=>{
const nav = document.querySelector('.nav');
if(!nav) return;
nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});
}