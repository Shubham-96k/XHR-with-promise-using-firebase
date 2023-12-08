const cl = console.log;

const postcontainer = document.getElementById("postcontainer");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const userIdControl = document.getElementById("userId");
const submtbtn = document.getElementById("submtbtn");
const updtbtn = document.getElementById("updtbtn");
const postform = document.getElementById("postform");
const loader = document.getElementById("loader");


let baseUrl = `https://js-crud-post-default-rtdb.asia-southeast1.firebasedatabase.app`;
let postUrl = `${baseUrl}/posts.json`;

const objtoArr = obj => {
    let arr = [];
    for(const key in obj) {
        let data = obj[key];
        data.id = key;
        arr.push(data);
    }
    return arr;
}
const onEdit = eve => {
    let editid = eve.closest(".card").id;
    localStorage.setItem("editId", editid);
    let editUrl = `${baseUrl}/posts/${editid}.json`

    makeApiCall("GET", editUrl)
        .then(res => {
            submtbtn.classList.add("d-none");
            updtbtn.classList.remove("d-none");
            titleControl.value = res.title;
            contentControl.value = res.body;
            userIdControl.value = res.userId;
            scrollToTop()
        })
        .catch(error => cl(error))
}
const onUpdate = () => {
    let updtid = localStorage.getItem("editId");
    let updtUrl = `${baseUrl}/posts/${updtid}.json`
    let updtobj = {
        title : titleControl.value,
        body : contentControl.value,
        userId : userIdControl.value,
        id : updtid
    };
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        if(result.isConfirmed){
            makeApiCall("PUT", updtUrl, updtobj)
                .then(res => {
                    let childcard = [...document.getElementById(updtid).children];
                    childcard[0].innerHTML = `<h2>${res.title}</h2>`;
                    childcard[1].innerHTML = `<p>${res.body}</p>`
                })
                .catch(error => cl(error))
                Swal.fire("Saved!", "", "success");
        }else if(result.isDenied){
                Swal.fire("Changes are not saved", "",);
        }
        updtbtn.classList.add("d-none")
        submtbtn.classList.remove("d-none")
        postform.reset()
      });
}
const onDelete = eve => {
    let deleteId = eve.closest(".card").id;
    let deleteUrl = `${baseUrl}/posts/${deleteId}.json`;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if(result.isConfirmed){
            makeApiCall("DELETE", deleteUrl)
                .then(() => {
                    document.getElementById(deleteId).remove();
                })
                .catch(error => cl(error))
                .finally(() => {
                    updtbtn.classList.add("d-none");
                    submtbtn.classList.remove('d-none');
                    postform.reset()
                })
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
                timer: 1000
            });
        }
      });
    
}
const onAddPost = eve => {
    eve.preventDefault();
    let postobj = {
        title : titleControl.value,
        body : contentControl.value,
        userId : userIdControl.value
    }
    makeApiCall("POST", postUrl, postobj)
        .then(res => {
            localStorage.setItem("postId", res.name);
            let postobjUrl = `${baseUrl}/posts/${res.name}.json`
            return makeApiCall("GET", postobjUrl)
        })
        .then(res => {
            let getpostid = localStorage.getItem("postId");
            res.id = getpostid;
            postobjtemplating(res);
            postform.reset();
            Swal.fire({
                icon: "success",
                title: "Your work has been saved",
                timer: 1500
              });
        })
        .catch(error => cl(error));
}

const postobjtemplating = eve => {
    let card = document.createElement('div');
    card.className = "card mb-2";
    card.id = eve.id;
    card.innerHTML = `
                <div class="card-header">
                    <h2>${eve.title}</h2>
                </div>
                <div class="card-body">
                    <p>${eve.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-primary" onclick="onEdit(this)"><strong>Edit</strong></button>
                    <button class="btn btn-danger" onclick="onDelete(this)"><strong>Delete</strong></button>
                </div>
    `
    postcontainer.append(card);
}

const makeApiCall = (methodname, apiUrl, body = null) => {
    loader.classList.remove("d-none")
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(methodname, apiUrl);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(body));
        xhr.onload = () => {
            loader.classList.add("d-none")
            if(xhr.status >= 200 && xhr.status < 300){
                resolve(JSON.parse(xhr.responseText));
            }else{
                reject(xhr.statusText)
            }
        }
    })
}

makeApiCall("GET", postUrl)
    .then(res => {
        objtoArr(res).forEach(eve => postobjtemplating(eve));
    })
    .catch(error => cl(error));

updtbtn.addEventListener("click", onUpdate);
postform.addEventListener("submit", onAddPost);

function scrollToTop(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }