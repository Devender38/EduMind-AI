import Button from "../ui/Button";


export default function Navbar(){

return(

<nav
className="
fixed
top-0
w-full
z-50
glass
px-8
py-4
flex
justify-between
items-center
"
>

<h1
className="
text-2xl
font-bold
bg-gradient-to-r
from-blue-400
to-purple-500
bg-clip-text
text-transparent
"
>
EduMind AI
</h1>


<div className="flex gap-4">

<Button>
Login
</Button>

<Button>
Get Started
</Button>

</div>


</nav>

)

}