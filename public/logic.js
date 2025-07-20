let input=document.querySelector(".hide")
   let show_input=document.querySelector("#searchVseat")
   let s_input=document.querySelector("#sear")
   show_input.addEventListener("click", function () {
    input.style.display = "inline-block";
    s_input.style.display = "inline-block";
    show_input.style.display="none"

})
s_input.addEventListener("click", function () {
    console.log(input.value)
    const searchTerm = input.value.toLowerCase();
    const allItems = document.querySelectorAll(".post");
    input.value = "";
    allItems.forEach((item) => {
        const textContent = item.textContent.toLowerCase();

        if (textContent.includes(searchTerm)) {
            item.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            input.value = "";
        }
    });
});