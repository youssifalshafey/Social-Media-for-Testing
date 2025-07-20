let show_subject = document.querySelector(".left")
let show_material = document.querySelector(".right")
let addSubject = document.querySelector(".subject")
let insubject = document.querySelector(".insubject")
let dropdown = document.querySelector(".options")
let addless = document.querySelector(".addlesson")
let create = document.querySelector(".send");
let title = document.querySelector("#recipient-name");
let filess = document.querySelector(".pic");
let paragraph = document.querySelector(".subjectt");



fetch(`/info/fullInfo`, {
    credentials: "same-origin",
    headers: {
        "contgent-type": "Application/json",
    },
})
    .then((res) => res.json())
    .then((resu) => {


        let clas = resu.class

        const xhr = new XMLHttpRequest();

        addless.addEventListener("click", () => {
            document.querySelectorAll(".hna").forEach((e) => {
                let nsubject = e.children[0].children[0].textContent
                dropdown.innerHTML += `
              <div title="all">
      <input id="all" name="option" type="radio" checked="" />
      <label class="option" for="all" data-txt="${nsubject}"></label>
    </div>
              `
            })
            document.querySelector(".btn-close").addEventListener("click",()=>{
                  dropdown.innerHTML =""
            }
            )
            document.querySelectorAll(".option").forEach((e) => {
                e.addEventListener("click", () => {

                    paragraph.textContent = e.getAttribute('data-txt')
                })
            })
        })
        insubject.addEventListener("keypress", (ev) => {
            if (!ev.shiftKey && ev.key === "Enter") {
                addSubject.click();
            }
        });
        addSubject.addEventListener("click", () => {
            addsub()
            document.querySelector(".btn-close").click()
        })

        async function addsub() {
            if (insubject.value != "") {
                try {
                    const response = await fetch(`/library/class/subject/add`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({

                            "subject": insubject.value,
                        }),
                    });
                    if (response.ok) {
                        insubject.value = ""
                        // close modal of add subject
                        insubject.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].click()


                        document.querySelectorAll(".hna").forEach((e) => {
                            e.remove()
                        })
                        show_comment()
                    } else {
                        alert(" failed");
                    }
                } catch (error) { }
            }


        }

  
        create.addEventListener("click", function () {

            let count = filess.files.length;
            if (title.value !== ""&&count!=0) {
                fetch("/library/subject/lesson/add", {
                    method: "POST",
                    headers: {
                        "Content-type": "Application/json",
                    },
                    body: JSON.stringify({
                        title: title.value,
                        files: filess.files.length,
                        subject: paragraph.textContent,
                    }),
                }).then((res) =>
                    res.json().then((body) => {
                        const formData = new FormData();
                        if (count >= 1) {
                            for (let i = 0; i < count; i++) {
                                formData.append("files", filess.files[i]);
                            }
                            xhr.open("POST", `/library/subject/material/add/${body.id}`);
                            xhr.send(formData);

                        }

                        document.querySelectorAll(".hna").forEach((e) => {
                            e.remove()
                        })
                        show_comment()
                    })
                );

 setTimeout(() => {
                title.value = "";
                paragraph.value = "";
                const filePreview = document.getElementById("filePreview");
                selectedFiles = []
filePreview.innerHTML=""
filess.value=""}, 1000)
            }
        });
        async function show_comment() {
            await fetch(`/library/class/${clas}`, {
                credentials: "same-origin",
                headers: {
                    "contgent-type": "Application/json",
                },
            })
                .then((res) => res.json())
                .then((result) => {
                    let subject = result.subjects
                    for (let i = 0; i < subject.length; i++) {
                        let ul = document.createElement("ul")
                        ul.className = "hna w-100 "
                        let li = document.createElement("li")
                        let h1 = document.createElement("button")
                        h1.className = "w-100 one crush"
                        li.className = "main-subject "
                        li.style.position = "relative"
                        li.style.width = "100%"
                        h1.textContent = subject[i]
                        li.appendChild(h1)
                       
                        ul.appendChild(li)
                        show_subject.appendChild(ul)
                        let dropup = document.createElement("i")
                                                    let one=true
    h1.addEventListener("click", (e) => {

        if (h1.classList.contains("one")) {
         show(h1.textContent)
         
        
        h1.classList.remove("one")
}else{
    h1.parentElement.children[1].remove()
    h1.classList.add("one")
 
}
    })
                 


                        

                        dropup.addEventListener("click", (e) => {
                            let allArticle = document.querySelectorAll(".book")
                            e.target.parentElement.children[2].remove()
                            dropup.remove()
                            li.appendChild(dropdown)
                        })

                    }
                })
        }

        show_comment()



        async function show(subjectName) {
            const url = `/library/subject/${clas}?subject=${encodeURIComponent(subjectName)}`;
            await fetch(url, {
                credentials: "same-origin",
                headers: {
                    "contgent-type": "Application/json",
                },
            })
                .then((res) => res.json())
                .then((result) => {
                    let show1 = document.querySelectorAll(".main-subject")
                    let div = document.createElement("div")
                    div.classList.add("showTitle")
                    for (let i = 0; i < result.length; i++) {
                        let article = document.createElement("article")
                        let art = document.createElement("div")
                        art.classList.add('showTitle2')
                        article.className = "book  shadow py-3 mb-5  rounded"
                        let title = document.createElement("h2")
                        title.textContent = result[i].title
                        for (let x = 0; x < result[i].files.length; x++) {
                            let content = document.createElement("div")
                            content.classList.add("materiall")
                            content.classList.add("btn")
                            content.textContent = result[i].files[x]                           
                            article.appendChild(content)
                            art.setAttribute('data', result[i].Id)
                            content.addEventListener("click", () => {
                             
                                toggleMenu1()
                                let subject = content.parentElement.parentElement.parentElement.children[0].textContent
                                let file = content.textContent

                                material(subject, file)
                            })
                        }
                        art.setAttribute("cancel", result[i].cancelled)
                        if (art.getAttribute("cancel") == "true") {
                            art.classList.add("cancel")
                            art.innerHTML += `
                          <p>cancelled</p>
                          `
                        } else {
                            div.classList.add("nocancel")
                        }
                        let but = document.createElement("button")
                        but.className = "btn"
                        but.textContent = "cancel"
                        art.appendChild(but)
                        if (art.classList.contains("cancel")== false) {
                            but.addEventListener("click", async function cancel(e) {
                                let id = e.target.parentElement.getAttribute("data")
                                let lesson = e.target.parentElement.parentElement.parentElement.children[0].textContent
                                if (confirm("Are you sure ")) {

                                try {
                                    const response = await fetch(`/library/subject/lesson/markcancel`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(

                                            {
                                                "subject": lesson,
                                                "lessonId": id
                                            }
                                        ),
                                    });
                                    if (response.ok) {
                                        document.querySelector(".showTitle").innerHTML = ''

                                        art.setAttribute("cancel", result[i].cancelled)
                                        if (art.getAttribute("cancel") == "true") {
                                            art.classList.add("cancel")
                                            art.innerHTML += `
                        <p>cancelled</p>
                        `
                                        } else {
                                            art.classList.add("nocancel")
                                        }
                                        show(lesson)

                                    } else {
                                        alert(" failed");
                                    }
                                } catch (error) { }
                            }

                            })
                        }
                        art.appendChild(title)

                        div.appendChild(art)
                        div.appendChild(article)
                       
                    }
                    show1.forEach((e) => {
                        if (e.children[0].textContent == subjectName) {
                            e.appendChild(div)
                        }

                    })

                })
        }




        async function material(subject, file) {
            const url = `/library/material/1/${file}?subject=${encodeURIComponent(subject)}`;

            await fetch(url, {
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => response.arrayBuffer())
                .then(data => {
                    const fileExtension = file.split(".").pop().toLowerCase();
                    if (fileExtension === "pdf") {
                        show_material.innerHTML = `
                      <canvas id="pdfCanvas"></canvas>
                      <button id="prevPage" class="btn btn-outline-light">Previous Page</button>
                      <button id="nextPage" class="btn btn-outline-light">Next Page</button>
                      <button id="downloadButton" class="btn btn-outline-light">Download</button>
                  `;
                        let currentPage = 1;
                        const loadingTask = pdfjsLib.getDocument(data);
                        let totalPages;

                        function renderPage(pageNum) {
                            loadingTask.promise.then(pdf => {
                                totalPages = pdf.numPages;
                                pdf.getPage(pageNum).then(page => {
                                    const canvas = document.getElementById('pdfCanvas');
                                    const context = canvas.getContext('2d');
                        
                                    const container = document.querySelector(".right");
                                    const canvasWidth = container?.clientWidth || window.innerWidth;
                        
                                    const scale = canvasWidth / page.view[2];
                        
                                    const viewport = page.getViewport({ scale: scale });
                        
                                    canvas.width = viewport.width;
                                    canvas.height = viewport.height;
                        
                                    page.render({
                                        canvasContext: context,
                                        viewport: viewport
                                    }).promise.then(() => {
                                        // تم العرض بنجاح
                                    });
                                });
                            }).catch(error => {
                                console.error('Error loading PDF:', error);
                            });
                        }
                        
                        renderPage(currentPage);

                        document.querySelector("#nextPage").addEventListener("click", () => {
                            if (currentPage < totalPages) {
                                currentPage++;
                                renderPage(currentPage);
                            }
                        });

                        document.querySelector("#prevPage").addEventListener("click", () => {
                            if (currentPage > 1) {
                                currentPage--;
                                renderPage(currentPage);
                            }
                        });

                        document.querySelector("#downloadButton").addEventListener("click", () => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = file;
                            link.click();
                        });

                    }
                    else if (fileExtension === "pptx") {
                        mammoth.convertToHtml({ arrayBuffer: data })
                            .then(function (result) {
                                const htmlContent = result.value;

                                const paragraphs = htmlContent.split('<p>');
                                let currentPage = 0;
                                const pageSize = 5;
                                function renderPage() {
                                    const start = currentPage * pageSize;
                                    const end = start + pageSize;
                                    const pageContent = paragraphs.slice(start, end).join('<p>');

                                    show_material.innerHTML = `
                                  <div id="docContent">${pageContent}</div>
                                  <button id="prevPage" class="btn btn-outline-light">Previous Page</button>
                                  <button id="nextPage" class="btn btn-outline-light">Next Page</button>
                                  <button id="downloadButton" class="btn btn-outline-light">Download</button>
                              `;
                                }
                                renderPage();

                                document.querySelector("#nextPage").addEventListener("click", () => {
                                    if ((currentPage + 1) * pageSize < paragraphs.length) {
                                        currentPage++;
                                        renderPage();
                                    }
                                });

                                document.querySelector("#prevPage").addEventListener("click", () => {
                                    if (currentPage > 0) {
                                        currentPage--;
                                        renderPage();
                                    }
                                });

                                document.querySelector("#downloadButton").addEventListener("click", () => {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = file;
                                    link.click();
                                });

                            })
                            .catch(function (err) {
                                console.error("Error converting DOCX to HTML:", err);
                                show_material.innerHTML = "<p>Error displaying the DOCX document. It may be corrupted or not a valid DOCX file.</p>";
                            });
                    }
                    else if (fileExtension === "docx") {
                        mammoth.convertToHtml({ arrayBuffer: data })
                            .then(function (result) {
                                const htmlContent = result.value;

                                const paragraphs = htmlContent.split('<p>');
                                let currentPage = 0;
                                const pageSize = 5;
                                function renderPage() {
                                    const start = currentPage * pageSize;
                                    const end = start + pageSize;
                                    const pageContent = paragraphs.slice(start, end).join('<p>');

                                    show_material.innerHTML = `
                                  <div id="docContent">${pageContent}</div>
                                  <button id="prevPage" class="btn btn-outline-light">Previous Page</button>
                                  <button id="nextPage" class="btn btn-outline-light">Next Page</button>
                                  <button id="downloadButton" class="btn btn-outline-light">Download</button>
                              `;
                                }
                                renderPage();

                                document.querySelector("#nextPage").addEventListener("click", () => {
                                    if ((currentPage + 1) * pageSize < paragraphs.length) {
                                        currentPage++;
                                        renderPage();
                                    }
                                });

                                document.querySelector("#prevPage").addEventListener("click", () => {
                                    if (currentPage > 0) {
                                        currentPage--;
                                        renderPage();
                                    }
                                });

                                document.querySelector("#downloadButton").addEventListener("click", () => {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = file;
                                    link.click();
                                });

                            })
                            .catch(function (err) {
                                console.error("Error converting DOCX to HTML:", err);
                                show_material.innerHTML = "<p>Error displaying the DOCX document. It may be corrupted or not a valid DOCX file.</p>";
                            });
                    }
                    else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                        const img = new Image();
                        img.src = URL.createObjectURL(new Blob([data]));
                        img.classList.add("w-100");
                        img.onload = function () {
                            show_material.innerHTML = "";
                            show_material.appendChild(img);
                        };
                        img.onerror = function () {
                            show_material.innerHTML = "<p>Error loading the image file.</p>";
                        };

                        const downloadButton = document.createElement('button');
                        downloadButton.classList.add('btn', 'btn-outline-light');
                        downloadButton.innerText = 'Download';
                        downloadButton.addEventListener('click', () => {
                            const link = document.createElement('a');
                            link.href = img.src;
                            link.download = file;
                            link.click();
                        });
                        show_material.appendChild(downloadButton);

                    }
                    else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
                        const audio = new Audio();
                        audio.src = URL.createObjectURL(new Blob([data]));
                        audio.controls = true;
                        show_material.innerHTML = "";
                        show_material.appendChild(audio);
                        audio.play();

                        const downloadButton = document.createElement('button');
                        downloadButton.classList.add('btn', 'btn-outline-light');
                        downloadButton.innerText = 'Download';
                        downloadButton.addEventListener('click', () => {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(new Blob([data]));
                            link.download = file;
                            link.click();
                        });
                        show_material.appendChild(downloadButton);

                    }
                    else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
                        const video = document.createElement('video');
                        video.src = URL.createObjectURL(new Blob([data]));
                        video.controls = true;
                        video.style.maxWidth = "100%";
                        video.style.height = "auto";
                        video.width = 600;
                    
                        show_material.innerHTML = "";
                        show_material.appendChild(video);
                        video.play();
                    
                        const downloadButton = document.createElement('button');
                        downloadButton.classList.add('btn', 'btn-outline-light');
                        downloadButton.innerText = 'Download';
                        downloadButton.style.display = "block";
                        downloadButton.style.marginTop = "10px";
                    
                        downloadButton.addEventListener('click', () => {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(new Blob([data]));
                            link.download = file;
                            link.click();
                        });
                    
                        show_material.appendChild(downloadButton);
                    }
                    
                    else {
                        show_material.innerHTML = "<p>Unsupported file type or error loading file.</p>";
                    }
                }).catch(error => {
                    console.error("Error fetching the material:", error);
                    show_material.innerHTML = "<p>Error fetching the file. Please try again later.</p>";
                });
        }




    });




    
    
         function toggleMenu1() {
            let menu = document.querySelector('.left');
            let overlay = document.querySelector('.overlay');
            let right = document.querySelector('.right');
            if (window.innerWidth < 1000) {
                  right.style.overflowX = 'auto';
                menu.style.transform = 'translateX(-150%)';
                overlay.style.display = 'none';
                document.querySelector('.toggle-btn').classList.add("toggle-btn1");
              }
                }
        function toggleMenu() {
            let menu = document.querySelector('.left');
            let overlay = document.querySelector('.overlay');

            if (menu.style.transform === 'translateX(0%)') {
                menu.style.transform = 'translateX(-1500%)';
                overlay.style.display = 'none';
            } else {
                menu.style.transform = 'translateX(0%)';
                overlay.style.display = 'block';
            }
        }
        
        window.addEventListener("resize", function () {
            let menu = document.querySelector('.left');

            if (window.innerWidth < 1000) {
                menu.style.transform = 'translateX(-1500%)';
                document.querySelector('.toggle-btn').classList.add("toggle-btn1");
            }  else{
                menu.style.transform = 'translateX(0%)';

            }
          });
          const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const filePreview = document.getElementById("filePreview");

let selectedFiles = [];

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);

  selectedFiles = selectedFiles.concat(files);

  renderFilePreview();
});

function renderFilePreview() {
  filePreview.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      fileItem.appendChild(img);
    } else {
      fileItem.textContent = file.name;
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      selectedFiles.splice(index, 1);
      renderFilePreview();
    };

    fileItem.appendChild(removeBtn);
    filePreview.appendChild(fileItem);
  });
}
