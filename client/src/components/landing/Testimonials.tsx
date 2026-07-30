export default function Testimonials(){

return(

<section className="py-24 px-6">


<h2 className="
text-4xl
font-bold
text-center
">

Students Love EduMind AI

</h2>


<div className="
grid
md:grid-cols-3
gap-8
mt-12
">


{
[
"AI helped me revise 5 chapters in one night.",
"Generated quizzes improved my preparation.",
"My personal AI tutor explains better than books."
]
.map((text)=>(


<div
key={text}
className="
glass
p-8
rounded-3xl
"
>

<p>
"{text}"
</p>


</div>


))
}


</div>


</section>

)

}