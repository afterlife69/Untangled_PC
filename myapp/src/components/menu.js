import {Link} from 'react-router-dom'
import './menu.css'
export default function Menu(){
    return (
        <div>
            <Link id='helloLink' to='/hello'>HELLO PAGE</Link>
        </div>
    )
}