let language = localStorage.getItem("locale");

if(!language) {
    localStorage.setItem("locale", "en")
    language = "en";
}

fetch(`/locale/${language}`).then(async res => {
    const body = await res.json();

    
})