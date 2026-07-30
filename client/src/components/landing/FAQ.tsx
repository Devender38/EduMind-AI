const faq=[
"Can I upload any PDF?",
"Does AI remember my documents?",
"Is my data secure?"
];


export default function FAQ(){

return(

<section className="py-24 px-6">


<h2 className="text-4xl font-bold text-center">
Frequently Asked Questions
</h2>


<div className="mt-10 space-y-5 max-w-3xl mx-auto">


{
faq.map(q=>(

<div
key={q}
className="
glass
p-6
rounded-xl
"
>

{q}

</div>

))
}


</div>


</section>

)

}