const homePage = document.getElementById('home');
const homeLink = document.getElementById('homeLink');
const servicesPage = document.getElementById('services');
const serviceLink = document.getElementById('serviceLink');
const aboutPage = document.getElementById('aboutPage');
const aboutLink = document.getElementById('aboutLink');
const contactPage = document.getElementById('contactPage');
const contactLink = document.getElementById('contactLink');
const faqPage = document.getElementById('faq');
const faqLink = document.getElementById('faqLink');
const current = document.querySelector('.active')

if(homePage){
    console.log(homePage)
}
if(servicesPage){
    current.classList.remove('active')
    serviceLink.classList.add('active')
}
if(aboutPage){
    current.classList.remove('active')
    aboutLink.classList.add('active')
}
if(contactPage){
    current.classList.remove('active')
    contactLink.classList.add('active')
}
if(faqPage){
    current.classList.remove('active')
    faqLink.classList.add('active')
}