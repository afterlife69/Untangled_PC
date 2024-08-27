import { useState } from "react";
export default function Example(){
    const [x, setX] = useState(0)
    
    return (
        <div>
            <h1>{x}</h1>
            <button onClick={()=>setX(x + 1)}>increment</button>
        </div>
    )
}