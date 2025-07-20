console.log("hello world");

const usernameFeild = document.getElementById("username");
const passwordFeild = document.getElementById("password");
const rememberMeCheck = document.getElementById("ss");
const loginForm = document.getElementById("loginform1");

loginForm.onsubmit = (ev) => {
    ev.preventDefault();
    console.log(usernameFeild, passwordFeild);
    fetch("/api/login", {
        method: "post",
        credentials: "same-origin",
        headers: {
            "Content-Type": "Application/Json",
        },
        body: JSON.stringify({
            username: usernameFeild.value,
            password: passwordFeild.value,
            remember: rememberMeCheck.checked,
        }),
    }).then((response) => {
        if (!response.ok ) {
            let text = document.createElement("p");
            text.classList.add("wrong")
            text.textContent = "the username or password is wrong";
            text.style.cssText = ` color: red;text-align: center;`;
            if ( !loginForm.children[0].classList.contains("wrong")) {
               console.log("no") 
               loginForm.prepend(text);

            }
        } else {
            window.location.href = "/home";
        }
    });
};
