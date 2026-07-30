const plans=[

{
name:"Free",
price:"₹0",
features:[
"5 PDF uploads",
"Basic AI Chat",
"Limited quizzes"
]
},

{
name:"Pro",
price:"₹499/month",
features:[
"Unlimited PDFs",
"Advanced AI Tutor",
"Analytics"
]
},

{
name:"Premium",
price:"₹999/month",
features:[
"Everything in Pro",
"Priority AI",
"Personal Study Coach"
]
}

];


export default function Pricing(){

return(

<section className="py-24 px-6">


<h2 className="text-4xl font-bold text-center">
Choose Your Plan
</h2>


<div className="
grid
md:grid-cols-3
gap-8
mt-12
">


{
plans.map(plan=>(

<div
key={plan.name}
className="
glass
rounded-3xl
p-8
"
>


<h3 className="text-2xl font-bold">
{plan.name}
</h3>


<p className="
text-3xl
mt-5
font-bold
">

{plan.price}

</p>


<ul className="
mt-6
space-y-3
text-gray-400
">

{
plan.features.map(f=>(

<li key={f}>
✓ {f}
</li>

))
}

</ul>


</div>

))
}


</div>


</section>

)

}