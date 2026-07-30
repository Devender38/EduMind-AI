import Button from "../ui/Button";


export default function Hero(){

return(

<section
className="
min-h-screen
flex
items-center
justify-center
text-center
px-6
pt-32
"
>


<div>


<div
className="
inline-block
px-4
py-2
rounded-full
glass
text-sm
text-blue-400
mb-8
"
>
🤖 Powered by Advanced AI
</div>



<h1
className="
text-6xl
md:text-7xl
font-bold
bg-gradient-to-r
from-blue-400
via-purple-500
to-pink-500
bg-clip-text
text-transparent
"
>

Your Personal
<br/>
AI Study Assistant

</h1>



<p
className="
mt-8
text-xl
text-gray-400
max-w-3xl
mx-auto
"
>

Upload PDFs, chat with documents,
generate notes, quizzes and learn
with your personal AI tutor.

</p>



<div
className="
mt-10
flex
justify-center
gap-5
"
>

<Button>
Start Learning
</Button>


<Button className="bg-white/10">
Watch Demo
</Button>


</div>


</div>


</section>

)

}