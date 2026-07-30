const features=[

{
title:"AI PDF Chat",
desc:"Ask questions directly from your study documents."
},

{
title:"Smart Notes",
desc:"Generate summaries and revision notes instantly."
},

{
title:"AI Quiz Generator",
desc:"Create MCQ and practice tests automatically."
},

{
title:"Flashcards",
desc:"Remember concepts using AI powered flashcards."
},

{
title:"Study Planner",
desc:"Create personalized learning schedules."
},

{
title:"Analytics",
desc:"Track your learning progress."
}

];


export default function Features(){


return(

<section
className="
py-24
px-6
"
>


<h2
className="
text-4xl
font-bold
text-center
"
>

Powerful AI Learning Features

</h2>


<div
className="
grid
md:grid-cols-3
gap-8
mt-12
"
>


{
features.map((item)=>(

<div
key={item.title}
className="
glass
p-8
rounded-3xl
hover:scale-105
transition
"
>


<h3
className="
text-xl
font-bold
"
>

{item.title}

</h3>


<p
className="
mt-4
text-gray-400
"
>

{item.desc}

</p>


</div>


))
}


</div>


</section>

)

}