const ItOne=document.getElementById("btn--one")
const ItTow=document.getElementById("btn--tow")
const ItThree=document.getElementById("btn--three")
const ItForBtn=document.getElementById("btn--for")
const ItImg=document.getElementById("ItImg")




const AiOneBtn=document.getElementById("Ai-One")
const AiTowBtn=document.getElementById("Ai-Tow")
const AiThreeBtn=document.getElementById("Ai-Three")
const AiForBtn=document.getElementById("Ai-For")


const AiTitle=document.getElementById("AiTitle")
const AiPrg=document.getElementById("AiPrg")






ItOne.onclick=()=>{
    ItImg.src="imgs/phone (3).png"
}

ItTow.onclick=()=>{
    ItImg.src="imgs/al (7).jpg"
    AiTitle.innerText="Books are uniquely portable magic"
    AiPrg.innerText="All the Lorem Ipsum generators on the Internet tend to repeated predefined chunks as necessary, making this the first true value generator on the Internet. It"

}

ItThree.onclick=()=>{
    ItImg.src="imgs/ai (16).jpg"
       AiTitle.innerText="TEATCHER CAN OPEN THE DOOR BUT YOU MUST ENTER IT YOURSELF"
    AiPrg.innerText="AllHumans were built to work with their hands. And since the beginning of time, that is exactly what we have done. From the pottery and tools made during the Bronze age, to the clothing and shoes that we have worn in more recent"
}





AiOneBtn.onclick=()=>{
    ItImg.src="imgs/ai (14).jpg"
    AiTitle.innerText="Books are uniquely portable magic"
    AiPrg.innerText="    While this means students will learn to weave, knit, crochet and sew, his intention was not to produce weavers and crochet professionals. Rather, it was to help students feel confident when going out into the wider world that they would be perfectly"
    
}

AiTowBtn.onclick=()=>{
    ItImg.src="imgs/ai (15).jpg"

    AiTitle.innerText="Educating The Whole Child"
    AiPrg.innerText="All the Lorem Ipsum generators on the Internet tend to repeated predefined chunks as necessary, making this the first true value generator on the Internet. It"
    
}

AiThreeBtn.onclick=()=>{
    ItImg.src="imgs/ai (17).jpg"
       AiTitle.innerText="TEATCHER CAN OPEN THE DOOR BUT YOU MUST ENTER IT YOURSELF"
    AiPrg.innerText="AllHumans were built to work with their hands. And since the beginning of time, that is exactly what we have done. From the pottery and tools made during the Bronze age, to the clothing and shoes that we have worn in more recent"
}




const searchHeadeen = document.getElementById("searchHeadeen")
const searchVseat = document.getElementById("searchVseat")
const iconHead = document.getElementById("iconHead")
const s = document.getElementById("ssa")
const x = document.getElementById("xxa")
const xx = document.getElementById("x")


// 


searchHeadeen.classList.add("a")
searchHeadeen.style.display = "none"
iconHead.style.display = "none"

searchVseat.onclick = () => {
  searchHeadeen.style.display = "inline-block"
  // searchHeadeen.style.margin="0 1rem"
  s.style.display = "none"
  x.style.display = "none"
  xx.style.display = "none"



  searchVseat.style.display = "none"
  iconHead.style.display = "inline-block"
}

iconHead.onclick = () => {
  searchHeadeen.style.display = "none"
  iconHead.style.display = "none"

  searchVseat.style.display = "inline-block"
  s.style.display = "inline-block"
  x.style.display = "inline-block"
  xx.style.display = "inline-block"
}



const dark = document.getElementById("dark")
const darkl = document.getElementById("darkl")


window.onload = () => {
  const darkModeCheck = localStorage.getItem("dark");
  dark.checked = darkModeCheck == 1 ? true : false;
  if (darkModeCheck == 1) {
    darkMode()
  } else {
    lightMode()
  }
}


dark.onclick = () => {
  if (dark.checked) {
    darkMode()
  } else {
    lightMode()
  }
  localStorage.setItem("dark", dark.checked ? 1 : 0)
}
// const offcanvas = document.getElementById("offcanvasWithBothOptions")
const containerfluid = document.querySelector(".container-fluid")


function darkMode() {
  console.log("dark mode")

  document.body.style.backgroundColor = "#000"
  document.body.style.color = "#FFCA42"
  containerfluid.style.backgroundColor = "#000"
  darkl.style.color="#39cccc"



  darkl.innerHTML = `<i class="fa-regular fa-sun"></i>`
}

function lightMode() {
  console.log("white mode")

  document.body.style.backgroundColor = "white"
  document.body.style.color = "#989999a4"

  darkl.innerHTML = `<i class="fa-solid fa-moon"></i>`
  containerfluid.style.backgroundColor = "inherit"

darkl.style.color="#39cccc"

}

