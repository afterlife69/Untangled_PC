import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import './login.css'

export default function Login() {
    const navigate = useNavigate()
    
    const handleSignUp = (e) => {
        e.preventDefault()
        const data = {
          username: e.target.user.value,
          email: e.target.email.value,
          password: e.target.password.value,
        }
        if (data.password !== e.target.cnfpassword.value) {
            alert("Passwords do not match")
            return
        }
        axios.post("http://localhost:8000/signup", data).then((res) => {
          if (res.data == 1) {
            alert("User already exists")
          } else {
            alert("User created successfully")
            window.location.reload()
          }
        }).catch((err) => {
            console.log(err)
            alert(err)
        })
    }
    
    const handleLogin = (e) => {
        e.preventDefault()
        const data = {
          username: e.target.username.value,
          password: e.target.pswd.value
        }
        axios.post("http://localhost:8000/login", data).then((res) => {
          if (res.data == "not found") {
            alert("User not found")
          } else if (res.data == "wrong password") {
            alert("Wrong password")
          } else {
            alert("Logged in successfully")
            localStorage.setItem("user", JSON.stringify(res.data))
            navigate('/chatb')
          }
        }).catch((err) => {
          console.log(err)
          alert(err)
      })
    }
    
    return (
      <div className="login-page">
        <div className="main">  	
          <link href="https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap" rel="stylesheet"></link>
          <input type="checkbox" id="chk" aria-hidden="true" />
          <div className="signup">
            <form onSubmit={handleSignUp}>
              <label htmlFor="chk" aria-hidden="true">Sign up</label>
              <div id="ipbox">
                <input type="text" name="user" required="" placeholder=" " />
                <span id="spanS">Username</span>
              </div>
              <div id="ipbox">
                <input type="email" name="email" required="" placeholder=" " />
                <span id="spanS">Email</span>
              </div>
              <div id="ipbox">
                <input type="password" name="password" required="" placeholder=" " />
                <span id="spanS">Password</span>
              </div>
              <div id="ipbox">
                <input type="password" name="cnfpassword" required="" placeholder=" " />
                <span id="spanS">Confirm Password</span>
              </div>
              <button>Sign up</button>
            </form>
          </div>
          <div className="login">
            <form onSubmit={handleLogin}>
              <label htmlFor="chk" aria-hidden="true">Login</label>
              <div id="ipbox">
                <input type="text" name="username" required="" placeholder=" " />
                <span id="spanL">Username</span>
              </div>
              <div id="ipbox">
                <input type="password" name="pswd" required="" placeholder=" " />
                <span id="spanL">Password</span>
              </div>
              <button>Login</button>
            </form>
          </div>
        </div>
      </div>
    );
}