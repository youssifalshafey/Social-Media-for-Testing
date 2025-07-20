document.getElementById("userImg").onclick = function() {
    document.getElementById("popup").style.display = "flex";
    showLeft.classList.remove("showleft")
document.querySelector(".layyer").classList.add("d-none")
}

document.getElementById("closePopup").onclick = function() {
    document.getElementById("popup").style.display = "none";
}
