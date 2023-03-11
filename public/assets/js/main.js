
jQuery( document ).ready(function( $ ) {
    const signUpForm = document.querySelector('#signUpForm')
    const logInForm = document.querySelector('#logInForm')
    const myModal = document.querySelector('#myModalContainer')

    if(signUpForm)
    {
        signUpForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const username = signUpForm.username.value;
        const email = signUpForm.email.value;
        const password = signUpForm.password.value;
        
        try {
            const res = await fetch('/signUp',{
            method:'POST',
            body:JSON.stringify({username,email,password}),
            headers:{'Content-Type':'application/json'}
            });
            
            const data = await res.json()
            if(data.errors)
            {                
                myModal.innerHTML= `
                    <h4>Oops! Failed to create your account.</h4>
                    <p>${data.errors.email}</p>
                    <p>${data.errors.username}</p>
                    <p>${data.errors.password}</p>
                    <a class="btn btn-danger" href="/">
                        <span>Back</span>
                    </a>` 
            }

            if(data.user)
            {
                myModal.innerHTML= `
                    <h4>Great!</h4>
                    <p>Your account has been created successfully.</p>
                    <a class="btn btn-success" href="/services">
                        <span>View our services</span>
                    </a>
                    `              
            }
        } catch (error) {
            console.log(error)
            
        }
        })
    }

    
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

    }
    })
}
})