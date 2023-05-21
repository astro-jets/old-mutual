
jQuery( document ).ready(function( $ ) {
    const signUpForm = document.querySelector('#signUpForm')
    const logInForm = document.querySelector('#logInForm')
    const profileForm = document.querySelector('#profile-form')
    const myModal = document.querySelector('#myModalContainer')
    
    if (logInForm) {
    logInForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = logInForm.email.value;
    const password = logInForm.password.value;
    
    try {
        const res = await fetch('/logIn', {
            method: 'POST',
            body: JSON.stringify({email, password }),
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await res.json()
        console.log(data)
        if(data.user){location.assign('/services')}
        if(data.errors)
        {
            myModal.innerHTML= `
                <h4>Oops! Failed to create your account.</h4>
                <p>${data.errors.email}</p>
                <p>${data.errors.password}</p>
                <a class="btn btn-danger" href="/">
                    <span>Back</span>
                </a>` 
        }
    } catch (error) {
        console.log("Err => ",error)
    }
    })
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            try {
            const response = profileForm.response.value;
            const id = profileForm.id.value;
            console.log(id)
            const messagesContainer = document.querySelector('#messagesContainer')
                if(id)
                {
                    const res = await fetch(`/contacts/response/${id}`, {
                    method: 'POST',
                    body: JSON.stringify({response}),
                    headers: { 'Content-Type': 'application/json' }
                    })
                    const data = await res.json()
                    if(data.status){
                        const messages = data.message;

                        messagesContainer.innerHTML =`
                            <li class="odd chat-item col-xl-12">
                                <div class="chat-content">
                                    <div class="box bg-light-inverse wrap">
                                        ${messages.message}
                                    </div>
                                    <br />
                                </div>
                                <div class="chat-time">${messages.date}</div>
                            </li>
                        `;
                        if(messages.thread){ 
                            messages.thread.forEach(t=>{ 
                                if(t.from == 'user'){
                                    messagesContainer.innerHTML +=`
                                    <li class="odd chat-item col-xl-12">
                                        <div class="chat-content">
                                            <div class="box bg-light-inverse wrap">
                                                ${t.response}
                                            </div>
                                            <br />
                                        </div>
                                        <div class="chat-time">
                                            ${t.date}
                                        </div>
                                    </li>`
                                }
                                if(t.from=='admin'){
                                    messagesContainer.innerHTML +=`
                                    <li class="chat-item">
                                        <div class="chat-img">
                                            <img src="../img/admin.png" alt="user" />
                                        </div>
                                        <div class="chat-content">
                                            <h6 class="font-medium">Customer Care</h6>
                                            <div class="box bg-light-info">
                                                ${t.response}
                                            </div>
                                        </div>
                                        <div class="chat-time">
                                            ${t.date}
                                        </div>
                                    </li>`
                                } 
                            }
                        )} 
                        profileForm.response.value =''
                    }
                }
                else{
                    const res = await fetch(`/sendMessage`, {
                        method: 'POST',
                        body: JSON.stringify({response}),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    
                    const data = await res.json()
                    if(data.status){
                        const messages = data.message;

                        messagesContainer.innerHTML =`
                            <li class="odd chat-item col-xl-12">
                                <div class="chat-content">
                                    <div class="box bg-light-inverse wrap">
                                        ${messages.message}
                                    </div>
                                    <br />
                                </div>
                                <div class="chat-time">${messages.date}</div>
                            </li>
                        `;
                        if(messages.thread){ 
                            messages.thread.forEach(t=>{ 
                                if(t.from == 'user'){
                                    messagesContainer.innerHTML +=`
                                    <li class="odd chat-item col-xl-12">
                                        <div class="chat-content">
                                            <div class="box bg-light-inverse wrap">
                                                ${t.response}
                                            </div>
                                            <br />
                                        </div>
                                        <div class="chat-time">
                                            ${t.date}
                                        </div>
                                    </li>`
                                }
                                if(t.from=='admin'){
                                    messagesContainer.innerHTML +=`
                                    <li class="chat-item">
                                        <div class="chat-img">
                                            <img src="../img/admin.png" alt="user" />
                                        </div>
                                        <div class="chat-content">
                                            <h6 class="font-medium">Customer Care</h6>
                                            <div class="box bg-light-info">
                                                ${t.response}
                                            </div>
                                        </div>
                                        <div class="chat-time">
                                            ${t.date}
                                        </div>
                                    </li>`
                                } 
                            }
                        )} 
                        profileForm.response.value =''
                    }
                }
            }      
            catch (error) {
                console.log(error)
            }
        });
    }
});