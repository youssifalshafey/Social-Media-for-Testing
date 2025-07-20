const dataDiv = document.getElementById('data');
const td = document.querySelector('.data--page');
const tdd = document.querySelector('.sid');
const bod = document.querySelector('body');
let new_src;
let length_of_posts;
let classs = document.querySelector('.classs');
let email = document.querySelector('.eemail');
let user = document.querySelector('.user');
let username = '';
let all_img;
let checkZoomPic = 0;

let startPositionComment = 0;
let ammountComment = 4;
let modal_content = document.querySelector('.modal_content');

let endOfPage = false;
let endOfPag = false;
let endOfComment = false;

let authorr;
let start_post = 0;
let amount_post = 10;

const userImg = document.getElementById('userImg');
let profile = document.querySelector('.popup-profile-image');
let bio = document.querySelector('#bioText');
let parentBio = document.querySelector('.form-floating');

const renderedPostIds = new Set();

getPosts(start_post, amount_post, true);

let isFetching1 = false;

async function listComments(postId, startPosition, amount, ch) {
    if (
        !postId ||
        startPosition === undefined ||
        amount === undefined ||
        isFetching1 ||
        endOfPag
    ) {
        return;
    }

    isFetching1 = true;

    try {
        const response = await fetch(
            `/posts/comment/get/${postId}/${startPosition}/${amount}`,
            {
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
            },
        );

        if (!response.ok) {
            endOfPag = true;
            isFetching1 = false;
            return;
        }

        const result = await response.json();

        if (!result || result.length === 0) {
            endOfPag = true;
            displayNoCommentsMessage();
            isFetching1 = false;
            return;
        }

        startPositionComment += ammountComment;
        displayComments(result, ch);

        if (result.length < amount) {
            endOfPag = true;
        }
    } catch (error) {
        console.error('Error in listComments:', error);
    }

    isFetching1 = false;
}

function displayNoCommentsMessage() {
    const container = document.querySelector('.sh');
    if (!container || document.querySelector('.no-comments')) return;

    const noCommentsMessage = document.createElement('div');
    noCommentsMessage.className =
        'alert alert-info text-center no-comments bg-white';
    noCommentsMessage.textContent = 'No comments available.';
    container.appendChild(noCommentsMessage);
}

function displayComments(comments, ch) {
    const container = document.querySelector('.sh');
    if (!container) return;

    const existingMessage = document.querySelector('.no-comments');
    if (existingMessage) {
        existingMessage.remove();
    }

    comments.forEach((comment) => {
        const content = document.createElement('div');
        content.className = 'mb-3 edit';
        content.setAttribute('posted', comment.date);

        const commentAuthor = document.createElement('h2');
        commentAuthor.textContent = comment.author;

        const commentBody = document.createElement('div');
        const commentText = document.createElement('h3');
        commentText.textContent = comment.content;

        commentBody.appendChild(commentText);
        content.appendChild(commentAuthor);
        content.appendChild(commentBody);
        if (user.textContent.toLowerCase() == comment.author.toLowerCase()) {
            const actions = document.createElement('div');
            actions.innerHTML = `<i class="fa-solid fa-trash"></i>
                <i class="fa-solid fa-pen clickme"></i>`;
            content.appendChild(actions);
        }

        if (ch === true) {
            container.appendChild(content);
        } else {
            container.prepend(content);
        }
    });
}

async function deleteComment(id, commentDate) {
    try {
        const response = await fetch(`/posts/comment/remove/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: parseInt(commentDate),
            }),
        });
        if (response.ok) {
        } else {
            alert('Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

async function finishEditComment(id, commentDate) {
    let inputofcomment = document.querySelector('.con1');
    let showEdit = document.querySelectorAll('.edit h3');
    let copyOfeditIcon = document.querySelector('.copy2');
    try {
        const response = await fetch(`/posts/comment/edit/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: inputofcomment.value,
                date: parseInt(commentDate),
            }),
        });
        if (response.ok) {
            showEdit.forEach((e) => {
                if (
                    parseInt(
                        e.parentElement.parentElement.getAttribute('posted'),
                    ) == commentDate
                ) {
                    e.textContent = inputofcomment.value;
                    inputofcomment.value = '';
                }
            });
            copyOfeditIcon.remove();
        } else {
            alert('Failed to edit comment');
        }
    } catch (error) {
        console.error('Error editing comment:', error);
    }
}

async function editCmment(id, commentDate, content, thi) {
    let inputofcomment = document.querySelector('.con1');
    inputofcomment.value = content.textContent;
    let containerofeditcomment = document.querySelector('.hhay');
    if (containerofeditcomment.children.length == 2) {
        let ii = document.createElement('i');
        ii.className = 'fa-solid fa-pen text-white copy2';
        containerofeditcomment.appendChild(ii);
        ii.onclick = () => finishEditComment(id, commentDate);
    }
    inputofcomment.value = content.textContent;
}

async function addcomment(postId) {
    let commentToEdit = document.querySelector('.con1');
    try {
        const response = await fetch(`/posts/comment/add/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: commentToEdit.value,
                date: Date.now(),
            }),
        });
        if (response.ok) {
            document.querySelector('.sh').classList.add('dd');
            endOfPag = false;
            listComments(postId, 0, 1, false);
            commentToEdit.value = '';
        } else {
            alert('Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment');
    }
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('closediv')) {
        e.target.parentElement.parentElement.remove();
    }
});

function addLayerForComment(targetPost) {
    startPositionComment = 0;

    const postId = targetPost.getAttribute('data');
    const div = document.createElement('div');
    div.className = 'layeer row align-items-center justify-content-center';

    const div2 = document.createElement('div');
    div2.className = 'sup-layeer row justify-content-center mt-4 comment';
    const closeIcon = document.createElement('i');
    closeIcon.className = 'fa-solid fa-close text-white fs-4';

    const commentContainer = document.createElement('div');
    commentContainer.className = 'row sh w-100 text-black';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'd-flex hhay';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control w-50 con1';

    const addIcon = document.createElement('i');
    addIcon.className = 'fa-solid fa-plus text-white fs-4';

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(addIcon);
    addIcon.onclick = () => addcomment(postId);
    input.addEventListener('keypress', (ev) => {
        if (!ev.shiftKey && ev.key === 'Enter') {
            addIcon.click();
        }
    });
    div2.appendChild(closeIcon);
    div2.appendChild(commentContainer);
    div2.appendChild(inputWrapper);

    div.appendChild(div2);
    bod.appendChild(div);
    closeIcon.addEventListener('click', () => {
        div.remove();
        endOfPag = false;
    });
    div2.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('fa-trash')) {
            const commentDate = target.closest('.edit').getAttribute('posted');
            e.target.parentElement.parentElement.remove();
            deleteComment(postId, commentDate);
        }

        if (target.classList.contains('clickme')) {
            const commentDate = target.closest('.edit').getAttribute('posted');
            const commentContent = target.closest('.edit').querySelector('h3');
            editCmment(postId, commentDate, commentContent, target);
        }
    });

    listComments(
        targetPost.getAttribute('data'),
        startPositionComment,
        ammountComment,
        true,
    );
    const container = document.querySelector('.sh');
    container.addEventListener('scroll', function () {
        if (
            container.scrollTop + container.clientHeight + 1 >=
                container.scrollHeight &&
            container.classList.contains('dd') == false
        ) {
            listComments(
                targetPost.getAttribute('data'),
                startPositionComment,
                ammountComment,
                true,
            );
        }
    });
}

let po;
let idOfEditPost;
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('eed')) {
        po = e.target.parentElement;
        idOfEditPost = e.target.parentElement.getAttribute('data');
    }
});

async function editpost() {
    let paragraph = document.querySelector('.paragraph').value;
    let title = document.querySelector('.title').value;
    let originalTimestamp = parseInt(po.getAttribute('posted'));
    let hoursToAdd = 3 * 60 * 60 * 1000;
    let newTimestamp = originalTimestamp + hoursToAdd;
    if (newTimestamp > Date.now()) {
        try {
            const response = await fetch(`/posts/edit/${idOfEditPost}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    paragraph: paragraph,
                }),
            });
            if (response.ok) {
                if (title !== '') po.children[2].textContent = title;
                if (paragraph !== '') po.children[3].textContent = paragraph;
                document.querySelector('.paragraph').value = '';
                document.querySelector('.title').value = '';
                document.querySelector('.exitFromEdit').click();
            } else {
                alert('Failed to edit post');
            }
        } catch (error) {
            console.error('Error editing post:', error);
        }
    }
}

fetch(`/info/fullInfo`, {
    credentials: 'same-origin',
    headers: {
        'content-type': 'Application/json',
    },
})
    .then((res) => res.json())
    .then((result) => {
        console.log(result);
        user.textContent = result.username;
        username = result.username;
        email.textContent = result.email;
        classs.textContent = `my class : ${result.class}`;
        authorr = result.username;
        userImg.setAttribute(
            'src',
            result.image
                ? `/info/getimage/low/${result.image}`
                : '/assets/defaultProfile.jpg',
        );
        bio.textContent = result.info ?? '';
        profile.setAttribute(
            'src',
            result.image
                ? `/info/getimage/low/${result.image}`
                : '/assets/defaultProfile.jpg',
        );
    })
    .catch((error) => {
        console.error('Error fetching user info:', error);
        userImg.setAttribute('src', '/assets/defaultProfile.jpg');
    });

function dele() {
    document.querySelector('.popup-overlay').remove();
}

const profileImageCache = {};

async function loadProfileImage(author) {
    if (profileImageCache[author]) {
        return profileImageCache[author];
    }
    try {
        let imageUrl = '/assets/defaultProfile.jpg';
        const response = await fetch(`/info/image/${author}`, {
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch image for ${author}`);
        } else {
            const result = await response.text();
            imageUrl = `/info/getimage/full/${result}`;
        }
        profileImageCache[author] = imageUrl;
        return imageUrl;
    } catch (error) {
        console.error(`Error fetching image for ${author}:`, error);
        return '/assets/defaultProfile.jpg';
    }
}

async function getPosts(f, l, create) {
    if (endOfPage) return;

    try {
        const response = await fetch(`posts/get/${f}/${l}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            endOfPage = true;
            if (create) {
            }
            return;
        }

        // Filter out already rendered posts
        const newPosts = posts.filter((post) => !renderedPostIds.has(post.Id));
        if (newPosts.length > 0) {
            start_post += amount_post;
            renderPosts(newPosts, create);
        } else {
            endOfPage = true;
        }
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        if (personally) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger text-center';
            errorMessage.textContent =
                'Failed to load posts. Please try again.';
            dataDiv.appendChild(errorMessage);
        }
    }
}

function toggle(e) {
    e.parentElement.children[1].classList.toggle('d-block');
}

async function renderPosts(posts, create) {
    for (const post of posts) {
        // Skip if post is already rendered
        if (renderedPostIds.has(post.Id)) continue;
        renderedPostIds.add(post.Id);

        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.setAttribute('data', post.Id);
        postDiv.setAttribute('posted', post.postedAt);

        const imgElement = document.createElement('img');
        const profileImageUrl = await loadProfileImage(post.author);
        imgElement.src = profileImageUrl || '/assets/defaultProfile.jpg';
        imgElement.alt = 'Profile Image';
        imgElement.style.width = '90px';
        imgElement.style.height = '90px';
        imgElement.classList.add('rounded-circle');
        imgElement.classList.add('rounded-circle2');
        postDiv.appendChild(imgElement);

        const postAuthor = document.createElement('h1');
        postAuthor.classList.add('mt-4');
        postAuthor.textContent = post.author;
        postDiv.appendChild(postAuthor);

        const postTitle = document.createElement('h2');
        postTitle.textContent = post.title;
        postDiv.appendChild(postTitle);

        const postTime = document.createElement('p');
        const time = new Date(post.postedAt);
        postTime.textContent = `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
        postTime.classList.add('me-auto');

        if (post.paragraph) {
            const postParagraph = document.createElement('p');
            postParagraph.textContent = post.paragraph;
            postDiv.appendChild(postParagraph);
        }
        postDiv.appendChild(postTime);

        if (post.attachments?.length) {
            const imageListDiv = createImageCarousel(post.attachments);
            postDiv.appendChild(imageListDiv);
        }

        const commentButton = document.createElement('p');
        commentButton.className = 'fa-regular fa-comment fs-5';
        commentButton.setAttribute('title', 'Add Comment');
        postDiv.appendChild(commentButton);
        if (username.toLowerCase() === post.author.toLowerCase()) {
            let originalTimestamp = Number(postDiv.getAttribute('posted'));
            let hoursToAdd = 3 * 60 * 60 * 1000;
            let newTimestamp = originalTimestamp + hoursToAdd;
            if (newTimestamp > Date.now()) {
                postDiv.innerHTML += `
<button type="button" class="eed" data-bs-toggle="modal" data-bs-target="#staticBackdrop1">
      <svg class="css-i6dzq1" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke-width="2" stroke="#FFFFFF" height="24" width="24" viewBox="0 0 24 24">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        Edit
</button>
`;
            }
            postDiv.innerHTML += `
<i class="fa-regular fa-trash-can fs-5" title="Delete Post" onclick="deletePost(this)"></i>
`;
        }

        if (create) {
            const createDiv = document.createElement('div');
            createDiv.classList.add('cardd');
            createDiv.appendChild(postDiv);
            dataDiv.appendChild(createDiv);
        } else {
            const createDiv = document.createElement('div');
            createDiv.classList.add('cardd');
            createDiv.appendChild(postDiv);
            dataDiv.prepend(createDiv);
            document
                .querySelectorAll('img[data-src]')
                .forEach((img) => observer.observe(img));
        }

        addScrollEffects(postDiv);
    }

    document.querySelectorAll('.fa-comment').forEach((e) => {
        e.onclick = () => addLayerForComment(e.parentElement);
    });
}

function createImageCarousel(attachments) {
    const container = document.createElement('div');
    container.classList.add('carousel-container');

    const imageListDiv = document.createElement('div');
    imageListDiv.classList.add('image-list');

    attachments.forEach((attachment, index) => {
        const img = document.createElement('img');
        img.classList.add('image-item');
        img.setAttribute('loading', 'lazy');

        if (index === 0) {
            img.src = `/posts/image/small/${attachment}`;
        } else {
            // img.setAttribute('data-src', `/posts/image/small/${attachment}`);
            img.setAttribute('src', `/posts/image/small/${attachment}`);
        }

        imageListDiv.appendChild(img);
    });

    container.appendChild(imageListDiv);

    if (attachments.length > 3) {
        const nextButton = document.createElement('i');
        nextButton.className = 'fa-solid fa-chevron-right right';
        nextButton.setAttribute('aria-label', 'Next image');

        nextButton.onclick = () => {
            const imageWidth =
                imageListDiv.querySelector('.image-item')?.offsetWidth || 150;
            imageListDiv.scrollLeft = Math.min(
                imageListDiv.scrollWidth - imageListDiv.clientWidth,
                imageListDiv.scrollLeft + imageWidth,
            );
        };

        const prevButton = document.createElement('i');
        prevButton.className = 'fa-solid fa-chevron-left prev';
        prevButton.setAttribute('aria-label', 'Previous image');

        prevButton.onclick = () => {
            const imageWidth =
                imageListDiv.querySelector('.image-item')?.offsetWidth || 150;
            imageListDiv.scrollLeft = Math.max(
                0,
                imageListDiv.scrollLeft - imageWidth,
            );
        };

        container.appendChild(prevButton);
        container.appendChild(nextButton);
    }

    imageListDiv.querySelectorAll('img').forEach((img) => {
        showpic(img);
    });

    imageListDiv.querySelectorAll('img[data-src]').forEach((img) => {
        observer.observe(img);
    });

    return container;
}

async function showProfileDetails(author) {
    try {
        const response = await fetch(`/info/publicInfo/${author}`, {
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
        });
        const result = await response.json();
        displayProfilePopup(author, result);
    } catch (error) {
        console.error(`Error fetching profile details for ${author}:`, error);
    }
}

function displayProfilePopup(author, profileInfo) {
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';

    popup.innerHTML = `
<div class="layeer row align-items-center justify-content-md-center">
<div class="sup-layeer row">
<div class="popup-content2">
<i class="fa-solid fa-close text-white fs-4 removee" onclick="dele()"></i>
<h2>profile</h2>
<div class="d-flex justify-content-start my-4 sama">
    <img src="${profileImageCache[author] || '/info/getimage/low/default.png'}" width="90px" height="60px" alt="Profile" class="popup-profile-image2 m-auto rounded-circle">
</div>
<div class="w-100">
    <label for="exampleFormControlInput1" class="form-label col-6">User Name</label>
    <p class="form-control user2 p-3 col-5" id="exampleFormControlInput1">${author}</p>
</div>
<div class="w-100">
    <label for="exampleFormControlTextarea1" class="form-label">your class</label>
    <p class="form-control form-control-sm">${profileInfo.class || 'N/A'}</p>
</div>
<div class="w-100">
    <label for="floatingTextarea">BIO</label>
    <p class="form-control p-4" id="floatingTextarea">${profileInfo.info || 'N/A'}</p>
</div>
</div>
</div>
</div>
`;
    document.body.appendChild(popup);
}

async function deletePost(e) {
    if (confirm('Are you sure?')) {
        try {
            const postId = e.parentElement.getAttribute('data') || e.parentElement.children[0].getAttribute('data')
            const response = await fetch(`/posts/remove/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                e.parentElement.remove();
                renderedPostIds.delete(postId);
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
}

function addScrollEffects(postDiv) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scale-up-ver-center');
                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(postDiv);
}

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            img.setAttribute('src', src);
            observer.unobserve(img);
        }
    });
});

function showpic(x) {
    observer.observe(x);
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('showImg')) {
        let imgList = e.target.parentElement.children[4];
        imgList.classList.add('d-flex');
    }
    if (e.target.classList.contains('image-item')) {
        const oldSrc = e.target.getAttribute('src').split('/');
        oldSrc.splice(oldSrc.indexOf('small'), 1);
        const fullSrc = oldSrc.join('/');

        const img = document.createElement('img');
        img.className = 'zoom1 col-md-10';
        img.setAttribute('src', fullSrc);

        const layer1 = document.createElement('div');
        layer1.style.background =
            'linear-gradient(45deg, #0000009e, #0000006b)';
        layer1.className =
            'layer row justify-content-center align-items-center';
        layer1.appendChild(img);

        const exit = document.createElement('i');
        exit.className = 'fa-solid fa-xmark close';
        layer1.prepend(exit);

        document.body.appendChild(layer1);

        exit.addEventListener('click', () => {
            layer1.remove();
        });
    }
    if (e.target.classList.contains('rounded-circle2')) {
        showProfileDetails(e.target.parentElement.children[1].textContent);
    }
});

let delPost = document.querySelectorAll('.dropRemove');

async function ddel(e) {
    try {
        const postId = e.parentElement.getAttribute('data');
        const response = await fetch(`/posts/remove/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            e.parentElement.remove();
            renderedPostIds.delete(postId);
        } else {
            alert('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

let search = document.querySelector('.ser');

const searchBarHidden = document.getElementById('searchHeadeen');
const searchVseat = document.getElementById('searchVseat');
const iconHead = document.getElementById('iconHead');
const s = document.getElementById('ssa');
const x = document.getElementById('xxa');
const xx = document.getElementById('x');
const sidBtn = document.getElementById('btnPosts');

searchBarHidden.classList.add('a');
searchBarHidden.style.display = 'none';
iconHead.style.display = 'none';
search.style.display = 'none';

searchVseat.onclick = () => {
    searchBarHidden.style.display = 'inline-block';
    document.querySelector('.button2').classList.add('d-none');
    document.querySelector('.log').style.display = 'none';
    searchVseat.style.display = 'none';
    iconHead.style.display = 'inline-block';
    search.style.display = 'inline-block';
};

iconHead.onclick = () => {
    searchBarHidden.style.display = 'none';
    iconHead.style.display = 'none';
    document.querySelector('.button2').classList.remove('d-none');
    document.querySelector('.log').style.display = 'flex';
    searchVseat.style.display = 'inline-block';
    search.style.display = 'none';
};

const containerfluid = document.querySelector('.container-fluid');
const div_hiden = document.querySelector('.offcanvas');

const toggleCheckbox = document.getElementById('toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('darkmode');
    toggleCheckbox.checked = true;
} else {
    body.classList.remove('darkmode');
    toggleCheckbox.checked = false;
}

toggleCheckbox.addEventListener('change', () => {
    if (toggleCheckbox.checked == true) {
        body.classList.add('darkmode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('darkmode');
        localStorage.setItem('theme', 'light');
    }
});

const menues = document.querySelector('.clas');

let scro = document.getElementById('scrol');
scro.style.display = 'none';

window.onscroll = () => {
    if (scrollY < 400) {
        scro.style.display = 'block';
    } else {
        scro.style.display = 'none';
    }
};

scro.onclick = () => {
    scroll({
        left: 0,
        top: 0,
        behavior: 'smooth',
    });
};

let logout = document.querySelector('#x');
logout.addEventListener('click', function () {
    fetch('api/logout').then((res) => {
        window.location.href = '/home';
    });
});

let create = document.querySelector('.send');
let title = document.querySelector('#recipient-name');
let filess = document.querySelector('.pic');
let paragraph = document.querySelector('#message-text');

title.addEventListener('keypress', (ev) => {
    if (!ev.shiftKey && ev.key === 'Enter') {
        create.click();
    }
});
paragraph.addEventListener('keypress', (ev) => {
    if (!ev.shiftKey && ev.key === 'Enter') {
        create.click();
    }
});
filess.addEventListener('keypress', (ev) => {
    if (!ev.shiftKey && ev.key === 'Enter') {
        create.click();
    }
});

create.addEventListener('click', async function () {
    modal_content.classList.add('loadpost');
    const close = document.querySelector('.closeCreate');

    try {
        const postResponse = await fetch('posts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title.value.trim(),
                paragraph: paragraph.value.trim(),
                attachments: filess.files.length,
            }),
        });

        if (!postResponse.ok) {
            throw new Error('فشل في إنشاء المنشور');
        }

        const postBody = await postResponse.json();
        const postId = postBody.postId;

        if (filess.files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < filess.files.length; i++) {
                formData.append('files', filess.files[i]);
            }

            const uploadResponse = await fetch(
                `posts/attachment/upload/${postId}`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!uploadResponse.ok) {
                throw new Error('فشل في رفع الملفات');
            }
        }

        setTimeout(() => {
            title.value = '';
            paragraph.value = '';
            filess.value = '';

            selectedFiles = [];
            preview.innerHTML = '';

            document.getElementById('fileCount').textContent =
                'لم يتم اختيار ملف';
            close.click();
            modal_content.classList.remove('loadpost');
        }, 200);

        endOfPage = false;
        start_post = 0;
        await getPosts(0, 1, false);
        const preview = document.getElementById('preview');

        preview.innerHTML = '';
    } catch (error) {
        console.error('حدث خطأ أثناء إنشاء المنشور:', error);
        modal_content.classList.remove('loadpost');
        alert('فشل في إنشاء المنشور. حاول مرة أخرى.');
    }
});

let isFetching = false;

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const handleScroll = debounce(() => {
    if (isFetching) return;

    if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5
    ) {
        isFetching = true;
        console.log('Reached the bottom!');

        loadMoreContent()
            .then(() => {
                isFetching = false;
            })
            .catch(() => {
                isFetching = false;
            });
    }
}, 200);

window.addEventListener('scroll', handleScroll);

async function loadMoreContent() {
    await getPosts(start_post, amount_post, true);
}

searchBarHidden.addEventListener('keypress', (ev) => {
    if (!ev.shiftKey && ev.key === 'Enter') {
        search.click();
    }
});

search.addEventListener('click', (item) => {
    fetch('posts/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: searchBarHidden.value,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            let postss = result;
            render(postss);
        });
    searchBarHidden.value = '';
});

async function render(posts) {
    const layer = document.createElement('div');
    layer.className =
        'popup d-flex justify-content-center align-items-center w-100';
    layer.style.overflowY = 'auto';
    layer.style.flexDirection = 'column';

    const lay = document.createElement('div');
    lay.classList.add('popup-content');
    lay.style.maxWidth = '90%';

    const exit = document.createElement('i');
    exit.className = 'fa-solid fa-xmark close1';
    exit.setAttribute('aria-label', 'Close popup');
    exit.addEventListener('click', () => layer.remove());
    layer.appendChild(exit);

    const fragment = document.createDocumentFragment();

    for (const post of posts) {
        const postDiv = document.createElement('div');
        postDiv.classList.add('posts');
        postDiv.setAttribute('data', post.Id);
        postDiv.setAttribute('posted', post.postedAt);

        const imgElement = document.createElement('img');
        const profileImageUrl = await loadProfileImage(post.author);
        imgElement.src = profileImageUrl || '/info/getimage/low/default.png';
        imgElement.alt = `${post.author}'s profile image`;
        imgElement.style.width = '90px';
        imgElement.style.height = '90px';
        imgElement.classList.add('rounded-circle');
        postDiv.appendChild(imgElement);

        const postAuthor = document.createElement('h1');
        postAuthor.classList.add('mt-4');
        postAuthor.textContent = post.author;
        postDiv.appendChild(postAuthor);

        const postTitle = document.createElement('h2');
        postTitle.textContent = post.title;
        postDiv.appendChild(postTitle);

        const postTime = document.createElement('p');
        const time = new Date(post.postedAt);
        postTime.textContent = `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
        postTime.classList.add('me-auto');
        postDiv.appendChild(postTime);

        if (post.paragraph) {
            const postParagraph = document.createElement('p');
            postParagraph.textContent = post.paragraph;
            postDiv.appendChild(postParagraph);
        }

        if (post.attachments?.length) {
            const imageListDiv = createImageCarousel(post.attachments);
            postDiv.appendChild(imageListDiv);
        }

        const commentButton = document.createElement('i');
        commentButton.className = 'fa-regular fa-comment fs-5';
        commentButton.setAttribute('title', 'Add Comment');
        commentButton.setAttribute('aria-label', 'Add comment');
        commentButton.onclick = () => addLayerForComment(postDiv);
        postDiv.appendChild(commentButton);

        if (username?.toLowerCase() === post.author?.toLowerCase()) {
            const deleteButton = document.createElement('i');
            deleteButton.className = 'fa-regular fa-trash-can fs-5';
            deleteButton.setAttribute('title', 'Delete Post');
            deleteButton.setAttribute('aria-label', 'Delete post');
            deleteButton.onclick = () => deletePost(postDiv);
            postDiv.appendChild(deleteButton);
        }

        addScrollEffects(postDiv);
        fragment.appendChild(postDiv);
    }

    lay.appendChild(fragment);
    layer.appendChild(lay);
    document.body.appendChild(layer);
}

const btnfixed = document.getElementById('scrol');
btnfixed.style.display = 'none';

window.onscroll = () => {
    if (scrollY > 400) {
        btnfixed.style.display = 'block';
    } else {
        btnfixed.style.display = 'none';
    }
};

btnfixed.onclick = () => {
    scroll({
        left: 0,
        top: 0,
        behavior: 'smooth',
    });
};

showImgProfile();

function showImgProfile() {
    const profileImage = document.querySelector('.popup-profile-image');
    if (profileImage) {
        profileImage.addEventListener('click', () => {
            let layer = document.createElement('div');
            layer.className = 'lay md-col-10';
            fetch(`/info/fullInfo`, {
                credentials: 'same-origin',
                headers: {
                    'content-type': 'Application/json',
                },
            })
                .then((res) => res.json())
                .then((result) => {
                    let full_img = document.createElement('img');
                    full_img.setAttribute(
                        'src',
                        result.image
                            ? `/info/getimage/full/${result.image}`
                            : '/assets/defaultProfile.jpg',
                    );
                    full_img.classList = 'col-12';
                    full_img.style.borderRadius = "20px"
                    layer.appendChild(full_img);
                })
                .catch((error) => {
                    console.error('Error fetching full profile image:', error);
                    let full_img = document.createElement('img');
                    full_img.setAttribute(
                        'src',
                        '/info/getimage/low/default.png',
                    );
                    full_img.classList = 'col-12';
                    layer.appendChild(full_img);
                });
            let lay = document.createElement('div');
            lay.classList = 'lay2';
            let i = document.createElement('i');
            i.classList = 'fa-solid fa-x text-white fs-4';
            layer.appendChild(i);
            lay.appendChild(layer);
            bod.appendChild(lay);

            i.addEventListener('click', () => {
                layer.remove();
                lay.remove();
            });
        });
    }
}

function full_info() {
    fetch(`/info/fullInfo`, {
        credentials: 'same-origin',
        headers: {
            'content-type': 'Application/json',
        },
    })
        .then((res) => res.json())
        .then((result) => {
            email.textContent = result.email;
            classs.textContent = `my class : ${result.class}`;
            authorr = result.username;
            username = result.username;
            if (result.image == undefined) {
                document
                    .querySelector('#userImg')
                    .setAttribute('src', '/assets/defaultProfile.jpg');
                profile.setAttribute('src', '/assets/defaultProfile.jpg');
            } else {
                document
                    .querySelector('#userImg')
                    .setAttribute('src', `/info/getimage/low/${result.image}`);
                profile.setAttribute(
                    'src',
                    `/info/getimage/low/${result.image}`,
                );
            }

            fetch(`/info/bio/${result.username}`, {
                credentials: 'same-origin',
                headers: {
                    'content-type': 'Application/json',
                },
            })
                .then((res) => res.text())
                .then((result) => {
                    bio.textContent = result;
                });
        })
        .catch((error) => {
            console.error('Error fetching user info:', error);
            document
                .querySelector('#userImg')
                .setAttribute('src', '/assets/defaultProfile.jpg');
            profile.setAttribute('src', '/assets/defaultProfile.jpg');
        });
}

let editButton = document.getElementById('sendButton1');
editButton.classList.add('button-53');
let form_to_send = document.querySelector('.popup-content');
editButton.onclick = () => editProfile();

function editProfile() {
    let layOfProfile = document.createElement('div');
    let layOfProfile1 = document.createElement('div');
    layOfProfile.classList.add('layprofile');
    layOfProfile1.classList.add('layeer');
    bod.appendChild(layOfProfile1);
    let originalElement = document.querySelector('.sec');
    let clonedElement = originalElement.cloneNode(true);
    let editBio = document.createElement('div');
    let showbio = bio.textContent;
    editBio.innerHTML = `
    <input type="text" class="form-control" id="bbio" value="${showbio}">
    `;
    layOfProfile.appendChild(clonedElement);
    layOfProfile.innerHTML += `
<input type="file" class="button-4 butto-4 d-none" name="" id="imageInput1">
<button id="imageInput" onclick="add()">
  <svg aria-hidden="true" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path stroke-width="2" stroke="#fffffff" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke-linejoin="round" stroke-linecap="round"></path>
    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="#fffffff" d="M17 15V18M17 21V18M17 18H14M17 18H20"></path>
  </svg>
  ADD FILE
</button>
<button type="button" id="closesupPopup" class="btn-close" aria-label="Close" onclick="supprofile()"></button>
<div class="buttons">
    <button class="button-4" onclick="editBioo()">Edit Bio</button>
    <button class="button-4" onclick="editimg(this)">Edit Img Profile</button>
</div>
`;
    layOfProfile.appendChild(editBio);
    bod.appendChild(layOfProfile);
}

function add() {
    document.querySelector('.butto-4').click();
}

async function editimg(x) {
    const fileInput = document.querySelector('.butto-4');
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);
    try {
        const response = await fetch('/info/uploadImage', {
            method: 'POST',
            body: formData,
        });
        const noCommentsMessage = document.createElement('div');
        noCommentsMessage.className =
            'alert alert-info text-center no-comments bg-white';
        noCommentsMessage.textContent = 'You cannot upload this';
        if (response.status !== 200) {
            if (!document.querySelector('.no-comments')) {
                document
                    .querySelector('.layprofile')
                    .appendChild(noCommentsMessage);
            }
        }
        if (response.status == 200) {
            const result = await response.json();
            setTimeout(() => {
                x.parentElement.parentElement.children[0].children[0].setAttribute(
                    'src',
                    `/info/getimage/low/${result.image}`,
                );
                full_info();
                document.querySelectorAll('.post').forEach((e) => {
                    if (e.children[1].textContent == user.innerText) {
                        e.children[0].setAttribute(
                            'src',
                            `/info/getimage/low/${result.image}`,
                        );
                    }
                });
            }, 2500);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

async function editBioo() {
    let inputBio = document.querySelector('#bbio');
    try {
        const response = await fetch('/info/update/bio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bio: inputBio.value }),
        });
        if (response.ok) {
            const result = await response.json();
            let inputBio1 = document.querySelector('#bioText');
            inputBio1.textContent = inputBio.value;
        } else {
            alert('Failed to update bio');
        }
    } catch (error) {
        console.error('Error updating bio:', error);
    }
}

function supprofile() {
    let exit = document.querySelector('.layprofile');
    let exit2 = document.querySelector('.layeer');
    exit.remove();
    exit2.remove();
}

let buttonLeft = document.querySelector('.button2');
let showLeft = document.querySelector('.left');
let DoItOnce = true;

buttonLeft.addEventListener('click', () => {
    showLeft.classList.toggle('showleft');
    document.querySelector('.layyer').classList.toggle('d-none');
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('layyer')) {
        showchat.classList.remove('frame');
        showLeft.classList.remove('showleft');
        e.target.classList.toggle('d-none');
        buttonLeft.classList.remove('d-none');
    }
});

let chat = document.querySelector('.Chat');
let showchat = document.querySelector('iframe');
chat.addEventListener('click', () => {
    showchat.classList.toggle('frame');
    showLeft.classList.remove('showleft');
    document.querySelector('.layyer').classList.remove('d-none');
});

function showedit() {
    document.querySelector('.bro').classList.toggle('d-flex');
}

let editPassword = document.querySelector('.editPassword');
editPassword.onclick = () => editpassword();
document.querySelector('#newpassword').addEventListener('keypress', (ev) => {
    if (!ev.shiftKey && ev.key === 'Enter') {
        editPassword.click();
    }
});

async function editpassword() {
    let password = document.querySelector('#oldpassword').value;
    let nnewpassword = document.querySelector('#newpassword').value;
    if (password.length !== 0 && nnewpassword.length !== 0) {
        try {
            const response = await fetch(`/api/changepassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                    newpassword: nnewpassword,
                }),
            });
            if (response.ok) {
                // Password changed successfully
            } else {
                let div = document.createElement('div');
                div.classList.add('card2');
                div.innerHTML = `<span><svg viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="m569.517 440.013c18.458 31.994-4.711 71.987-41.577 71.987h-479.886c-36.937 0-59.999-40.055-41.577-71.987l239.946-416.028c18.467-32.009 64.72-31.951 83.154 0zm-281.517-86.013c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346 7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
                </svg>
                <p>Your Old Password Is Wrong</p></span>`;
                bod.appendChild(div);
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }
        } catch (error) {
            console.error('Error changing password:', error);
        }
    }
}
const fileInput = document.getElementById('ffile');
const customButton = document.getElementById('imageInput1');
const fileCount = document.getElementById('fileCount');
const preview = document.getElementById('preview');

let selectedFiles = [];

customButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    selectedFiles = selectedFiles.concat(files);
    renderPreview();
});

function renderPreview() {
    preview.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const container = document.createElement('div');
            container.className = 'image-container';

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.className = 'remove-btn';
            removeBtn.addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                renderPreview();
            });

            container.appendChild(img);
            container.appendChild(removeBtn);
            preview.appendChild(container);
        };
        reader.readAsDataURL(file);
    });

    fileCount.textContent =
        selectedFiles.length > 0
            ? `تم اختيار ${selectedFiles.length} ملف${selectedFiles.length > 1 ? 'ات' : ''}`
            : 'لم يتم اختيار ملفات بعد';
}
